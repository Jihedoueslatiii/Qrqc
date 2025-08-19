import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { Chart, ChartData, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { QualiteService, Qualite } from 'src/app/services/qualite.service';
import { CoutService, Cout } from 'src/app/services/cout.service';
import { DelaiService, Delai } from 'src/app/services/delai.service';
import { AnalyseCausesService, AnalyseCauses } from 'src/app/services/analyse-causes.service';
import { firstValueFrom } from 'rxjs';

Chart.register(...registerables, ChartDataLabels);

interface KPIEntry {
  kpi: string;
  resultat: number;
  objectif: number;
  pilote: string;
  date?: string;
  semaine?: number;
  transactions?: number;
}

interface Stat {
  title: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit, AfterViewInit {
  @ViewChild('qualiteGlobalChart') qualiteGlobalChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('coutGlobalChart') coutGlobalChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('delaiGlobalChart') delaiGlobalChart!: ElementRef<HTMLCanvasElement>;

  loading = { qualite: false, cout: false, delai: false, analyse: false };
  error = { qualite: '', cout: '', delai: '', analyse: '' };

  qualites: KPIEntry[] = [];
  couts: KPIEntry[] = [];
  delais: KPIEntry[] = [];
  filteredQualites: KPIEntry[] = [];
  filteredCouts: KPIEntry[] = [];
  filteredDelais: KPIEntry[] = [];
  analyseCauses: AnalyseCauses[] = [];
  programmes: string[] = [];
  openProgrammes: { [kpi: string]: { [programme: string]: boolean } } = {};

  filteredKPIs: { [key in 'qualite' | 'cout' | 'delai']: string[] } = {
    qualite: [],
    cout: [],
    delai: []
  };
  uniquePilotes: { [key in 'qualite' | 'cout' | 'delai']: string[] } = {
    qualite: [],
    cout: [],
    delai: []
  };

  averageQualite: number | null = null;
  averageDelai: number | null = null;
  averageCout: number | null = null;

  selectedKPI = { qualite: '', cout: '', delai: '' };
  selectedPilote = { qualite: '', cout: '', delai: '' };
  filterStartDate = { qualite: '', cout: '', delai: '' };
  filterEndDate = { qualite: '', cout: '', delai: '' };
  filterSemaine = { qualite: '', cout: '', delai: '' };
  selectedProgram = { qualite: '', cout: '', delai: '' }; // New property for selected KPI

  qualiteStats: Stat[] = [];
  coutStats: Stat[] = [];
  delaiStats: Stat[] = [];

  globalChartData: {
    qualite: ChartData<'line', number[], string>;
    cout: ChartData<'line', number[], string>;
    delai: ChartData<'line', number[], string>;
  } = {
    qualite: { labels: [], datasets: [] },
    cout: { labels: [], datasets: [] },
    delai: { labels: [], datasets: [] }
  };

  newAnalyse: AnalyseCauses = {
    date: '',
    semaine: 0,
    indicateur: '',
    probleme: '',
    pourquoi: '',
    planAction: {
      action: '',
      pilote: '',
      delai: '',
      statut: 'NOT_STARTED'
    },
    programme: undefined
  };

  showAddModal = false;
  activeAddForm: { indicateur: string; programme: string } | null = null;

  showQualite = false;
  showCout = false;
  showDelai = false;

  private previousResults: { [key in 'qualite' | 'cout' | 'delai']: number } = {
    qualite: 0,
    cout: 0,
    delai: 0
  };

  private chartInstances: { [key: string]: Chart } = {};

  private chartViewChildMap: { [key in 'qualite' | 'cout' | 'delai']: ElementRef<HTMLCanvasElement> } = {
    qualite: this.qualiteGlobalChart,
    cout: this.coutGlobalChart,
    delai: this.delaiGlobalChart
  };

  commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 12, weight: 'bold' }, padding: 20, usePointStyle: true }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: { label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%` }
      },
      datalabels: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 45 } },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { stepSize: 10, callback: (val: any) => val + '%', font: { size: 11 } }
      }
    },
    elements: { line: { tension: 0 }, point: { radius: 5, hoverRadius: 7 } }
  };

  constructor(
    private qualiteService: QualiteService,
    private coutService: CoutService,
    private delaiService: DelaiService,
    private analyseService: AnalyseCausesService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadAllAverages();
    this.loadAnalyses();
  }

  ngAfterViewInit(): void {
    this.chartViewChildMap = {
      qualite: this.qualiteGlobalChart,
      cout: this.coutGlobalChart,
      delai: this.delaiGlobalChart
    };
  }

  async loadData(): Promise<void> {
    this.loading.qualite = true;
    this.loading.cout = true;
    this.loading.delai = true;

    const fallbackData: KPIEntry[] = [
      { kpi: 'ARJ321', resultat: 85, objectif: 95, pilote: 'Alice', date: '2025-06-01', semaine: this.getWeekNumber(new Date('2025-06-01')), transactions: 4250 },
      { kpi: 'ARJ321', resultat: 88, objectif: 95, pilote: 'Alice', date: '2025-06-02', semaine: this.getWeekNumber(new Date('2025-06-02')), transactions: 4400 },
      { kpi: 'TestProg2', resultat: 78, objectif: 95, pilote: 'Bob', date: '2025-06-01', semaine: this.getWeekNumber(new Date('2025-06-01')), transactions: 3900 },
    ];

    try {
      const qualiteData = await firstValueFrom(this.qualiteService.getAll());
      this.qualites = qualiteData.length ? this.mapQualiteData(qualiteData) : fallbackData;
      this.filteredQualites = [...this.qualites];
      this.filteredKPIs.qualite = Array.from(new Set(this.qualites.map(item => item.kpi))).sort();
      this.uniquePilotes.qualite = Array.from(new Set(this.qualites.map(item => item.pilote))).sort();
      this.calculateStats('qualite');
      this.prepareCharts('qualite');
    } catch (err) {
      this.error.qualite = 'Erreur lors du chargement des données Qualité.';
      this.qualites = fallbackData;
      this.filteredQualites = [...this.qualites];
      this.filteredKPIs.qualite = Array.from(new Set(this.qualites.map(item => item.kpi))).sort();
      this.uniquePilotes.qualite = Array.from(new Set(this.qualites.map(item => item.pilote))).sort();
      this.calculateStats('qualite');
      this.prepareCharts('qualite');
    } finally {
      this.loading.qualite = false;
    }

    try {
      const coutData = await firstValueFrom(this.coutService.getAll());
      this.couts = coutData.length ? this.mapCoutData(coutData) : fallbackData;
      this.filteredCouts = [...this.couts];
      this.filteredKPIs.cout = Array.from(new Set(this.couts.map(item => item.kpi))).sort();
      this.uniquePilotes.cout = Array.from(new Set(this.couts.map(item => item.pilote))).sort();
      this.calculateStats('cout');
      this.prepareCharts('cout');
    } catch (err) {
      this.error.cout = 'Erreur lors du chargement des données Coût.';
      this.couts = fallbackData;
      this.filteredCouts = [...this.couts];
      this.filteredKPIs.cout = Array.from(new Set(this.couts.map(item => item.kpi))).sort();
      this.uniquePilotes.cout = Array.from(new Set(this.couts.map(item => item.pilote))).sort();
      this.calculateStats('cout');
      this.prepareCharts('cout');
    } finally {
      this.loading.cout = false;
    }

    try {
      const delaiData = await firstValueFrom(this.delaiService.getAll());
      this.delais = delaiData.length ? this.mapDelaiData(delaiData) : fallbackData;
      this.filteredDelais = [...this.delais];
      this.filteredKPIs.delai = Array.from(new Set(this.delais.map(item => item.kpi))).sort();
      this.uniquePilotes.delai = Array.from(new Set(this.delais.map(item => item.pilote))).sort();
      this.calculateStats('delai');
      this.prepareCharts('delai');
    } catch (err) {
      this.error.delai = 'Erreur lors du chargement des données Délai.';
      this.delais = fallbackData;
      this.filteredDelais = [...this.delais];
      this.filteredKPIs.delai = Array.from(new Set(this.delais.map(item => item.kpi))).sort();
      this.uniquePilotes.delai = Array.from(new Set(this.delais.map(item => item.pilote))).sort();
      this.calculateStats('delai');
      this.prepareCharts('delai');
    } finally {
      this.loading.delai = false;
    }
  }

  async loadAnalyses(): Promise<void> {
    this.loading.analyse = true;
    try {
      this.analyseCauses = await firstValueFrom(this.analyseService.getAll());
      this.programmes = Array.from(new Set(this.analyseCauses.map(a => a.programme?.trim()).filter(p => p))).sort();
      this.initOpenProgrammes();
    } catch (err) {
      this.error.analyse = 'Erreur lors du chargement des analyses.';
    } finally {
      this.loading.analyse = false;
      this.cdr.detectChanges();
    }
  }

  initOpenProgrammes() {
    this.openProgrammes = { 'Qualité': {}, 'Coût': {}, 'Délai': {} };
    this.programmes.forEach(prog => {
      this.openProgrammes['Qualité'][prog] = false;
      this.openProgrammes['Coût'][prog] = false;
      this.openProgrammes['Délai'][prog] = false;
    });
  }

  toggleProgramme(kpi: string, programme: string) {
    if (!this.openProgrammes[kpi]) this.openProgrammes[kpi] = {};
    this.openProgrammes[kpi][programme] = !this.openProgrammes[kpi][programme];
    this.cdr.detectChanges();
  }

  getAnalysesFor(indicateur: string, programme?: string): AnalyseCauses[] {
    return this.analyseCauses.filter(a => {
      const category = indicateur.trim().toLowerCase();
      const kpi = programme?.trim().toLowerCase();
      const isSameCategory = a.indicateur?.trim().toLowerCase() === category;
      const isSameKpi = kpi ? a.programme?.trim().toLowerCase() === kpi : !a.programme;
      return isSameCategory && isSameKpi;
    });
  }

  openAddModal(indicateur: string, programme: string) {
    this.activeAddForm = { indicateur, programme };
    this.newAnalyse = {
      date: new Date().toISOString().split('T')[0],
      semaine: this.getWeekNumber(new Date()),
      indicateur: indicateur,
      probleme: '',
      pourquoi: '',
      planAction: {
        action: '',
        pilote: '',
        delai: '',
        statut: 'NOT_STARTED'
      },
      programme: programme || undefined
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  addAnalyse(): void {
    if (!this.newAnalyse.date || !this.newAnalyse.semaine || !this.newAnalyse.probleme) {
      alert('Veuillez remplir tous les champs obligatoires (Date, Semaine, Problème).');
      return;
    }

    const baseData: AnalyseCauses = {
      ...this.newAnalyse,
      planAction: { ...this.newAnalyse.planAction }
    };

    const category = this.activeAddForm!.indicateur;
    const kpi = this.activeAddForm!.programme;

    const globalAnalyse: AnalyseCauses = {
      ...baseData,
      indicateur: category,
      programme: undefined
    };

    const specificAnalyse: AnalyseCauses | null = kpi
      ? {
          ...baseData,
          indicateur: category,
          programme: kpi
        }
      : null;

    this.analyseService.create(globalAnalyse).subscribe({
      next: createdGlobal => {
        this.analyseCauses = [...this.analyseCauses, createdGlobal];
        if (specificAnalyse) {
          this.analyseService.create(specificAnalyse).subscribe({
            next: createdSpecific => {
              this.analyseCauses = [...this.analyseCauses, createdSpecific];
              this.finishAfterAdding();
            },
            error: err => {
              console.error('[addAnalyse] Erreur KPI:', err);
              alert("Erreur lors de l'ajout pour le KPI spécifique.");
              this.finishAfterAdding();
            }
          });
        } else {
          this.finishAfterAdding();
        }
      },
      error: err => {
        console.error('[addAnalyse] Erreur global:', err);
        alert("Erreur lors de l'ajout du plan d'action.");
        this.finishAfterAdding();
      }
    });
  }

  finishAfterAdding(): void {
    this.programmes = Array.from(new Set(this.analyseCauses.map(a => a.programme?.trim()).filter(p => p))).sort();
    this.filteredKPIs.qualite = [...this.filteredKPIs.qualite];
    this.filteredKPIs.cout = [...this.filteredKPIs.cout];
    this.filteredKPIs.delai = [...this.filteredKPIs.delai];
    this.closeAddModal();
    this.cdr.detectChanges();
  }

  resetForm(): void {
    this.newAnalyse = {
      date: '',
      semaine: 0,
      indicateur: '',
      probleme: '',
      pourquoi: '',
      planAction: {
        action: '',
        pilote: '',
        delai: '',
        statut: 'NOT_STARTED'
      },
      programme: undefined
    };
    this.activeAddForm = null;
  }

  trackByAnalyse(index: number, analyse: AnalyseCauses): any {
    return analyse.id || index;
  }

  trackByKPI(_index: number, kpi: string): string {
    return kpi;
  }

  trackByProgramme(_index: number, programme: string): string {
    return programme;
  }

  getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  mapQualiteData(data: Qualite[]): KPIEntry[] {
    return data.map(q => ({
      kpi: q.kpi?.trim() ?? '',
      resultat: q.resultat ?? 0,
      objectif: q.objectif ?? 95,
      pilote: q.pilote?.trim() ?? '',
      date: q.date ? new Date(q.date).toISOString().split('T')[0] : undefined,
      semaine: q.date ? this.getWeekNumber(new Date(q.date)) : undefined,
      transactions: q.resultat ? q.resultat * 50 : 0
    })).filter(d => d.date && d.semaine);
  }

  mapCoutData(data: Cout[]): KPIEntry[] {
    return data.map(c => ({
      kpi: c.kpi?.trim() ?? '',
      resultat: c.resultat ?? (c.heuresPresenceBadgees && c.heuresStandardsDeclarees ? (c.heuresPresenceBadgees / c.heuresStandardsDeclarees * 100) : 0),
      objectif: c.objectif ?? 95,
      pilote: c.pilote?.trim() ?? '',
      date: c.date ? new Date(c.date).toISOString().split('T')[0] : undefined,
      semaine: c.date ? this.getWeekNumber(new Date(c.date)) : undefined,
      transactions: c.resultat ? c.resultat * 50 : 0
    })).filter(d => d.date && d.semaine);
  }

  mapDelaiData(data: Delai[]): KPIEntry[] {
    return data.map(d => ({
      kpi: d.kpi?.trim() ?? '',
      resultat: d.resultat ?? (d.nombrePiecesPlanifiees ? (d.nombrePiecesATemps / d.nombrePiecesPlanifiees * 100) : 0),
      objectif: d.objectif ?? 95,
      pilote: d.pilote?.trim() ?? '',
      date: d.date ? new Date(d.date).toISOString().split('T')[0] : undefined,
      semaine: d.date ? this.getWeekNumber(new Date(d.date)) : undefined,
      transactions: d.resultat ? d.resultat * 50 : 0
    })).filter(d => d.date && d.semaine);
  }

  calculateStats(category: 'qualite' | 'cout' | 'delai'): void {
    const data = category === 'qualite' ? this.filteredQualites : category === 'cout' ? this.filteredCouts : this.filteredDelais;
    const results = data.map(e => e.resultat);
    const averageResultat = results.length ? results.reduce((sum, val) => sum + val, 0) / results.length : 0;
    const trend = averageResultat > this.previousResults[category] ? 'up' : averageResultat < this.previousResults[category] ? 'down' : 'stable';
    this.previousResults[category] = averageResultat;

    if (category === 'qualite') {
      this.qualiteStats = [
        { title: 'Résultat Moyen', value: averageResultat.toFixed(2), unit: '%', trend, color: '#10b981' }
      ];
    } else if (category === 'cout') {
      this.coutStats = [
        { title: 'Résultat Moyen', value: averageResultat.toFixed(2), unit: '%', trend, color: '#3b82f6' }
      ];
    } else {
      this.delaiStats = [
        { title: 'Résultat Moyen', value: averageResultat.toFixed(2), unit: '%', trend, color: '#f59e0b' }
      ];
    }
  }

  prepareCharts(category: 'qualite' | 'cout' | 'delai'): void {
    const data = category === 'qualite' ? this.qualites : category === 'cout' ? this.couts : this.delais;
    this.globalChartData[category] = this.prepareControlChart(data, category.charAt(0).toUpperCase() + category.slice(1));
  }

  prepareControlChart(data: KPIEntry[], category: string): ChartData<'line', number[], string> {
    if (!data.length || !data.some(d => d.semaine)) {
      return { labels: [], datasets: [] };
    }

    const weekMap = new Map<number, number[]>();
    data.filter(d => d.semaine).forEach(d => {
      if (!weekMap.has(d.semaine!)) weekMap.set(d.semaine!, []);
      weekMap.get(d.semaine!)!.push(d.resultat);
    });

    const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);
    const labels = sortedWeeks.map(week => `Semaine ${week}`);
    const results = sortedWeeks.map(week => {
      const values = weekMap.get(week)!;
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    const lcl = 95;

    return {
      labels,
      datasets: [
        {
          label: `${category} Résultats (Tous Programmes)`,
          data: results,
          borderColor: category === 'Qualité' ? '#10b981' : category === 'Coût' ? '#3b82f6' : '#f59e0b',
          backgroundColor: category === 'Qualité' ? 'rgba(16, 185, 129, 0.2)' : category === 'Coût' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          tension: 0,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: 'LCL',
          data: new Array(results.length).fill(lcl),
          borderColor: '#ef4444',
          borderWidth: 2,
          fill: false,
          tension: 0,
          pointRadius: 0,
          borderDash: [5, 5]
        }
      ]
    };
  }

  prepareProgramChart(category: 'qualite' | 'cout' | 'delai', kpi: string): ChartData<'line', number[], string> {
    const data = (category === 'qualite' ? this.filteredQualites : category === 'cout' ? this.filteredCouts : this.filteredDelais)
      .filter(e => e.kpi === kpi && e.date);
    if (!data.length) {
      return { labels: [], datasets: [] };
    }

    const sortedData = data.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    const labels = sortedData.map(d => new Date(d.date!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
    const results = sortedData.map(d => d.resultat);

    return {
      labels,
      datasets: [
        {
          label: `${category.charAt(0).toUpperCase() + category.slice(1)} - ${kpi}`,
          data: results,
          borderColor: category === 'qualite' ? '#10b981' : category === 'cout' ? '#3b82f6' : '#f59e0b',
          backgroundColor: category === 'qualite' ? 'rgba(16, 185, 129, 0.2)' : category === 'cout' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          tension: 0,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  }

  toggleSection(category: 'qualite' | 'cout' | 'delai'): void {
    if (category === 'qualite') {
      this.showQualite = !this.showQualite;
      if (this.showQualite) {
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            this.renderGlobalChart('qualite', this.qualiteGlobalChart);
            // Render only the selected program chart or all if none selected
            if (this.selectedProgram.qualite) {
              this.renderProgramChart('qualite', this.selectedProgram.qualite);
            } else {
              this.filteredKPIs.qualite.forEach(kpi => this.renderProgramChart('qualite', kpi));
            }
            this.cdr.detectChanges();
          }, 100);
        });
      } else {
        const chartId = 'qualiteGlobalChart';
        if (this.chartInstances[chartId]) {
          this.chartInstances[chartId].destroy();
          delete this.chartInstances[chartId];
        }
        this.filteredKPIs.qualite.forEach(kpi => {
          const canvasId = `qualiteProgramChart_${kpi}`;
          if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
            delete this.chartInstances[canvasId];
          }
        });
      }
    } else if (category === 'cout') {
      this.showCout = !this.showCout;
      if (this.showCout) {
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            this.renderGlobalChart('cout', this.coutGlobalChart);
            if (this.selectedProgram.cout) {
              this.renderProgramChart('cout', this.selectedProgram.cout);
            } else {
              this.filteredKPIs.cout.forEach(kpi => this.renderProgramChart('cout', kpi));
            }
            this.cdr.detectChanges();
          }, 100);
        });
      } else {
        const chartId = 'coutGlobalChart';
        if (this.chartInstances[chartId]) {
          this.chartInstances[chartId].destroy();
          delete this.chartInstances[chartId];
        }
        this.filteredKPIs.cout.forEach(kpi => {
          const canvasId = `coutProgramChart_${kpi}`;
          if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
            delete this.chartInstances[canvasId];
          }
        });
      }
    } else if (category === 'delai') {
      this.showDelai = !this.showDelai;
      if (this.showDelai) {
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            this.renderGlobalChart('delai', this.delaiGlobalChart);
            if (this.selectedProgram.delai) {
              this.renderProgramChart('delai', this.selectedProgram.delai);
            } else {
              this.filteredKPIs.delai.forEach(kpi => this.renderProgramChart('delai', kpi));
            }
            this.cdr.detectChanges();
          }, 100);
        });
      } else {
        const chartId = 'delaiGlobalChart';
        if (this.chartInstances[chartId]) {
          this.chartInstances[chartId].destroy();
          delete this.chartInstances[chartId];
        }
        this.filteredKPIs.delai.forEach(kpi => {
          const canvasId = `delaiProgramChart_${kpi}`;
          if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
            delete this.chartInstances[canvasId];
          }
        });
      }
    }
    this.cdr.detectChanges();
  }

  renderCharts(): void {
    if (this.showQualite) {
      this.renderGlobalChart('qualite', this.qualiteGlobalChart);
      if (this.selectedProgram.qualite) {
        this.renderProgramChart('qualite', this.selectedProgram.qualite);
      } else {
        this.filteredKPIs.qualite.forEach(kpi => this.renderProgramChart('qualite', kpi));
      }
    }
    if (this.showCout) {
      this.renderGlobalChart('cout', this.coutGlobalChart);
      if (this.selectedProgram.cout) {
        this.renderProgramChart('cout', this.selectedProgram.cout);
      } else {
        this.filteredKPIs.cout.forEach(kpi => this.renderProgramChart('cout', kpi));
      }
    }
    if (this.showDelai) {
      this.renderGlobalChart('delai', this.delaiGlobalChart);
      if (this.selectedProgram.delai) {
        this.renderProgramChart('delai', this.selectedProgram.delai);
      } else {
        this.filteredKPIs.delai.forEach(kpi => this.renderProgramChart('delai', kpi));
      }
    }
  }

  renderGlobalChart(category: 'qualite' | 'cout' | 'delai', viewChild: ElementRef<HTMLCanvasElement>): void {
    if (!viewChild?.nativeElement) {
      return;
    }

    const chartId = `${category}GlobalChart`;
    const canvas = viewChild.nativeElement;

    if (this.chartInstances[chartId]) {
      this.chartInstances[chartId].destroy();
    }

    if (this.globalChartData[category].labels?.length) {
      this.chartInstances[chartId] = new Chart(canvas, {
        type: 'line',
        data: this.globalChartData[category],
        options: this.commonChartOptions
      });
    }
  }

  renderProgramChart(category: 'qualite' | 'cout' | 'delai', kpi: string): void {
    const canvasId = `${category}ProgramChart_${kpi}`;
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!canvas) {
      return;
    }

    if (this.chartInstances[canvasId]) {
      this.chartInstances[canvasId].destroy();
    }

    const chartData = this.prepareProgramChart(category, kpi);
    if (chartData.labels?.length) {
      this.chartInstances[canvasId] = new Chart(canvas, {
        type: 'line',
        data: chartData,
        options: { ...this.commonChartOptions, aspectRatio: 1.5 }
      });
    }
  }

  selectProgram(category: 'qualite' | 'cout' | 'delai', kpi: string): void {
    this.selectedProgram[category] = kpi;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.renderCharts();
        this.cdr.detectChanges();
      }, 100);
    });
  }

  applyFilters(category: 'qualite' | 'cout' | 'delai'): void {
    const startDate = this.filterStartDate[category] ? new Date(this.filterStartDate[category]) : null;
    const endDate = this.filterEndDate[category] ? new Date(this.filterEndDate[category]) : null;
    const semaine = this.filterSemaine[category] ? parseInt(this.filterSemaine[category], 10) : null;

    const isInDateRange = (dateStr: string): boolean => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    };

    const isInWeek = (entrySemaine: number | undefined): boolean => {
      if (!semaine || !entrySemaine) return true;
      return entrySemaine === semaine;
    };

    if (category === 'qualite') {
      this.filteredQualites = this.qualites.filter(e =>
        (!this.selectedKPI.qualite || e.kpi === this.selectedKPI.qualite) &&
        (!this.selectedPilote.qualite || e.pilote === this.selectedPilote.qualite) &&
        isInDateRange(e.date ?? '') &&
        isInWeek(e.semaine)
      );
      this.filteredKPIs.qualite = Array.from(new Set(this.filteredQualites.map(item => item.kpi))).sort();
      this.uniquePilotes.qualite = Array.from(new Set(this.filteredQualites.map(item => item.pilote))).sort();
      this.calculateStats('qualite');
      this.globalChartData.qualite = this.prepareControlChart(this.filteredQualites, 'Qualité');
      if (this.showQualite) {
        this.renderGlobalChart('qualite', this.qualiteGlobalChart);
        if (this.selectedProgram.qualite) {
          this.renderProgramChart('qualite', this.selectedProgram.qualite);
        } else {
          this.filteredKPIs.qualite.forEach(kpi => this.renderProgramChart('qualite', kpi));
        }
      }
    } else if (category === 'cout') {
      this.filteredCouts = this.couts.filter(e =>
        (!this.selectedKPI.cout || e.kpi === this.selectedKPI.cout) &&
        (!this.selectedPilote.cout || e.pilote === this.selectedPilote.cout) &&
        isInDateRange(e.date ?? '') &&
        isInWeek(e.semaine)
      );
      this.filteredKPIs.cout = Array.from(new Set(this.filteredCouts.map(item => item.kpi))).sort();
      this.uniquePilotes.cout = Array.from(new Set(this.filteredCouts.map(item => item.pilote))).sort();
      this.calculateStats('cout');
      this.globalChartData.cout = this.prepareControlChart(this.filteredCouts, 'Coût');
      if (this.showCout) {
        this.renderGlobalChart('cout', this.coutGlobalChart);
        if (this.selectedProgram.cout) {
          this.renderProgramChart('cout', this.selectedProgram.cout);
        } else {
          this.filteredKPIs.cout.forEach(kpi => this.renderProgramChart('cout', kpi));
        }
      }
    } else {
      this.filteredDelais = this.delais.filter(e =>
        (!this.selectedKPI.delai || e.kpi === this.selectedKPI.delai) &&
        (!this.selectedPilote.delai || e.pilote === this.selectedPilote.delai) &&
        isInDateRange(e.date ?? '') &&
        isInWeek(e.semaine)
      );
      this.filteredKPIs.delai = Array.from(new Set(this.filteredDelais.map(item => item.kpi))).sort();
      this.uniquePilotes.delai = Array.from(new Set(this.filteredDelais.map(item => item.pilote))).sort();
      this.calculateStats('delai');
      this.globalChartData.delai = this.prepareControlChart(this.filteredDelais, 'Délai');
      if (this.showDelai) {
        this.renderGlobalChart('delai', this.delaiGlobalChart);
        if (this.selectedProgram.delai) {
          this.renderProgramChart('delai', this.selectedProgram.delai);
        } else {
          this.filteredKPIs.delai.forEach(kpi => this.renderProgramChart('delai', kpi));
        }
      }
    }
    this.cdr.detectChanges();
  }

  resetFilters(category: 'qualite' | 'cout' | 'delai'): void {
    this.selectedKPI[category] = '';
    this.selectedPilote[category] = '';
    this.filterStartDate[category] = '';
    this.filterEndDate[category] = '';
    this.filterSemaine[category] = '';
    this.selectedProgram[category] = ''; // Reset selected program
    this.applyFilters(category);
  }

  loadAllAverages(): void {
    this.qualiteService.getAverageResultat().subscribe(avg => this.averageQualite = avg);
    this.delaiService.getAverageResultat().subscribe(avg => this.averageDelai = avg);
    this.coutService.getAverageResultat().subscribe(avg => this.averageCout = avg);
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
      default:
        return '';
    }
  }

  ngOnDestroy(): void {
    Object.values(this.chartInstances).forEach(chart => {
      if (chart) chart.destroy();
    });
  }

  threshold = 90;

  getAlertClass(value: number | null): string {
    if (value == null) return '';
    if (value < 60) return 'flash-critical';
    if (value < this.threshold) return 'flash-warning';
    return 'flash-success';
  }

  public getProgrammeAnalyses(indicateur: string, programme: string): AnalyseCauses[] {
    return this.getAnalysesFor(indicateur, programme);
  }
}