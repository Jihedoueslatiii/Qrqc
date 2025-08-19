import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { Chart, ChartData, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { KpiIpService, KPI_IP } from 'src/app/services/kpi-ip.service';
import { DelaiService, Delai } from 'src/app/services/delai.service';
import { CoutService, Cout } from 'src/app/services/cout.service';
import { AnalyseCausesService, AnalyseCauses } from 'src/app/services/analyse-causes.service';
import { firstValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

Chart.register(...registerables, ChartDataLabels);

interface KPIEntry {
  kpi: string;
  resultat: number;
  objectif: number;
  pilote: string;
  date?: string;
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
  selector: 'app-project-monitoring',
  templateUrl: './project-monitoring.component.html',
  styleUrls: ['./project-monitoring.component.css']
})
export class ProjectMonitoringComponent implements OnInit, AfterViewInit {
  @ViewChild('kpiIpGlobalChart') kpiIpGlobalChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('efficaciteGlobalChart') efficaciteGlobalChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('otdGlobalChart') otdGlobalChart!: ElementRef<HTMLCanvasElement>;

  loading = { kpiIp: false, efficacite: false, otd: false, analyse: false };
  error = { kpiIp: '', efficacite: '', otd: '', analyse: '' };

  kpiIps: KPIEntry[] = [];
  efficacites: KPIEntry[] = [];
  otds: KPIEntry[] = [];
  filteredKpiIps: KPIEntry[] = [];
  filteredKpiIpHseTag: KPIEntry[] = [];
  filteredKpiIpIpOnly: KPIEntry[] = [];
  filteredEfficacites: KPIEntry[] = [];
  filteredOtds: KPIEntry[] = [];
  analyseCauses: AnalyseCauses[] = [];
  weeks: string[] = [];
  openWeeks: { [kpi: string]: { [week: string]: boolean } } = {};

  amdecValue = 42;
  totalKpiIp = 0;
  totalHseTag = 0;
  totalIp = 0;

  filteredWeeks: { [key in 'kpiIp' | 'efficacite' | 'otd' | 'hseTag']: string[] } = {
    kpiIp: [],
    efficacite: [],
    otd: [],
    hseTag: []
  };

  uniquePilotes: { [key in 'kpiIp' | 'efficacite' | 'otd' | 'hseTag']: string[] } = {
    kpiIp: [],
    efficacite: [],
    otd: [],
    hseTag: []
  };

  selectedWeek = { kpiIp: '', efficacite: '', otd: '' };
  selectedPilote = { kpiIp: '', efficacite: '', otd: '' };
  filterStartDate = { kpiIp: '', efficacite: '', otd: '' };
  filterEndDate = { kpiIp: '', efficacite: '', otd: '' };
  selectedWeekFilter = { kpiIp: '', efficacite: '', otd: '' };
  visibleSection: 'kpiIp' | 'efficacite' | 'otd' | null = null;

  averageKpiIp: number | null = null;
  averageEfficacite: number | null = null;
  averageOtd: number | null = null;

  kpiIpStats: Stat[] = [];
  efficaciteStats: Stat[] = [];
  otdStats: Stat[] = [];

  globalChartData: {
    kpiIp: ChartData<'line', number[], string>;
    efficacite: ChartData<'line', number[], string>;
    otd: ChartData<'line', number[], string>;
  } = {
    kpiIp: { labels: [], datasets: [] },
    efficacite: { labels: [], datasets: [] },
    otd: { labels: [], datasets: [] }
  };

  private previousResults: { [key in 'kpiIp' | 'efficacite' | 'otd']: number } = {
    kpiIp: 0,
    efficacite: 0,
    otd: 0
  };

  private chartInstances: { [key: string]: Chart } = {};
  private debounceTimeout: { [key: string]: number } = {};

  threshold = 90;

  commonChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
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

  showAddModal = false;
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

  constructor(
    private kpiIpService: KpiIpService,
    private delaiService: DelaiService,
    private coutService: CoutService,
    private analyseCausesService: AnalyseCausesService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadAnalyses();
    this.loadAllAverages();
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.renderCharts();
        this.ngZone.run(() => this.cdr.detectChanges());
      }, 100);
    });
  }

  async loadData(): Promise<void> {
    this.loading.kpiIp = true;
    this.loading.efficacite = true;
    this.loading.otd = true;

    const fallbackData: KPIEntry[] = [
      { kpi: 'Semaine 23 (2025)', resultat: 85, objectif: 100, pilote: 'Alice', date: '2025-06-01', transactions: 4250 },
      { kpi: 'Semaine 23 (2025)', resultat: 88, objectif: 100, pilote: 'Alice', date: '2025-06-08', transactions: 4400 },
      { kpi: 'Semaine 24 (2025)', resultat: 92, objectif: 100, pilote: 'Alice', date: '2025-06-15', transactions: 4600 },
      { kpi: 'Semaine 23 (2025)', resultat: 78, objectif: 95, pilote: 'Bob', date: '2025-06-01', transactions: 3900 },
      { kpi: 'Semaine 24 (2025)', resultat: 82, objectif: 95, pilote: 'Bob', date: '2025-06-08', transactions: 4100 }
    ];

    try {
      const kpiIpData = await firstValueFrom(this.kpiIpService.getAll());
      this.totalKpiIp = kpiIpData.length;
      this.totalHseTag = kpiIpData.filter(kpi => kpi.hseTag).length;
      this.totalIp = kpiIpData.filter(kpi => !kpi.hseTag).length;

      this.kpiIps = kpiIpData.length ? this.mapKpiIpData(kpiIpData) : fallbackData;
      const hseTagData = kpiIpData.filter(kpi => kpi.hseTag);
      const ipOnlyData = kpiIpData.filter(kpi => !kpi.hseTag);
      this.filteredKpiIpHseTag = hseTagData.length ? this.mapKpiIpData(hseTagData) : fallbackData;
      this.filteredKpiIpIpOnly = ipOnlyData.length ? this.mapKpiIpData(ipOnlyData) : fallbackData;
      this.filteredKpiIps = [...this.filteredKpiIpHseTag, ...this.filteredKpiIpIpOnly];

      this.filteredWeeks.kpiIp = Array.from(new Set(this.filteredKpiIpIpOnly.map(item => item.kpi))).sort();
      this.filteredWeeks.hseTag = Array.from(new Set(this.filteredKpiIpHseTag.map(item => item.kpi))).sort();
      this.uniquePilotes.kpiIp = Array.from(new Set(this.filteredKpiIpIpOnly.map(item => item.pilote))).sort();
      this.uniquePilotes.hseTag = Array.from(new Set(this.filteredKpiIpHseTag.map(item => item.pilote))).sort();

      this.calculateStats('kpiIp');
      this.globalChartData.kpiIp = this.prepareControlChart(this.kpiIps, 'KpiIp');
    } catch (err) {
      this.error.kpiIp = 'Erreur lors du chargement des données KPI IP.';
      this.totalKpiIp = fallbackData.length;
      this.totalHseTag = Math.floor(fallbackData.length * 0.7);
      this.totalIp = fallbackData.length - this.totalHseTag;
      this.kpiIps = fallbackData;
      this.filteredKpiIps = [...fallbackData];
      this.filteredKpiIpHseTag = [...fallbackData];
      this.filteredKpiIpIpOnly = [...fallbackData];
      this.filteredWeeks.kpiIp = Array.from(new Set(fallbackData.map(item => item.kpi))).sort();
      this.filteredWeeks.hseTag = Array.from(new Set(fallbackData.map(item => item.kpi))).sort();
      this.uniquePilotes.kpiIp = Array.from(new Set(fallbackData.map(item => item.pilote))).sort();
      this.uniquePilotes.hseTag = Array.from(new Set(fallbackData.map(item => item.pilote))).sort();
      this.calculateStats('kpiIp');
      this.globalChartData.kpiIp = this.prepareControlChart(this.kpiIps, 'KpiIp');
    } finally {
      this.loading.kpiIp = false;
    }

    try {
      const delaiData = await firstValueFrom(this.delaiService.getAll());
      this.efficacites = delaiData.length ? this.mapEfficaciteData(delaiData) : fallbackData;
      this.filteredEfficacites = [...this.efficacites];
      this.filteredWeeks.efficacite = Array.from(new Set(this.efficacites.map(item => item.kpi))).sort();
      this.uniquePilotes.efficacite = Array.from(new Set(this.efficacites.map(item => item.pilote))).sort();
      this.calculateStats('efficacite');
      this.globalChartData.efficacite = this.prepareControlChart(this.efficacites, 'Efficacite');
    } catch (err) {
      this.error.efficacite = 'Erreur lors du chargement des données Efficacité.';
      this.efficacites = fallbackData;
      this.filteredEfficacites = [...this.efficacites];
      this.filteredWeeks.efficacite = Array.from(new Set(fallbackData.map(item => item.kpi))).sort();
      this.uniquePilotes.efficacite = Array.from(new Set(fallbackData.map(item => item.pilote))).sort();
      this.calculateStats('efficacite');
      this.globalChartData.efficacite = this.prepareControlChart(this.efficacites, 'Efficacite');
    } finally {
      this.loading.efficacite = false;
    }

    try {
      const otdData = await firstValueFrom(this.coutService.getAll());
      this.otds = otdData.length ? this.mapOtdData(otdData) : fallbackData;
      this.filteredOtds = [...this.otds];
      this.filteredWeeks.otd = Array.from(new Set(this.otds.map(item => item.kpi))).sort();
      this.uniquePilotes.otd = Array.from(new Set(this.otds.map(item => item.pilote))).sort();
      this.calculateStats('otd');
      this.globalChartData.otd = this.prepareControlChart(this.otds, 'Otd');
    } catch (err) {
      this.error.otd = 'Erreur lors du chargement des données OTD.';
      this.otds = fallbackData;
      this.filteredOtds = [...this.otds];
      this.filteredWeeks.otd = Array.from(new Set(fallbackData.map(item => item.kpi))).sort();
      this.uniquePilotes.otd = Array.from(new Set(fallbackData.map(item => item.pilote))).sort();
      this.calculateStats('otd');
      this.globalChartData.otd = this.prepareControlChart(this.otds, 'Otd');
    } finally {
      this.loading.otd = false;
    }
  }

  async loadAnalyses(): Promise<void> {
    this.loading.analyse = true;
    try {
      this.analyseCauses = await firstValueFrom(this.analyseCausesService.getAll());
      this.weeks = Array.from(new Set(this.analyseCauses.map(a => `Semaine ${a.semaine} (${new Date(a.date).getFullYear()})`))).sort();
      this.initOpenWeeks();
    } catch (err) {
      this.error.analyse = 'Erreur lors du chargement des analyses.';
    } finally {
      this.loading.analyse = false;
      this.ngZone.run(() => this.cdr.detectChanges());
    }
  }

  initOpenWeeks(): void {
    this.openWeeks = {
      'KPI IP': {},
      'Efficacité': {},
      'OTD': {}
    };
    this.weeks.forEach(week => {
      this.openWeeks['KPI IP'][week] = false;
      this.openWeeks['Efficacité'][week] = false;
      this.openWeeks['OTD'][week] = false;
      this.openWeeks['KPI IP'][week + '_hseTag'] = false;
    });
  }

  toggleWeek(kpi: string, week: string): void {
    if (this.openWeeks[kpi]) {
      this.openWeeks[kpi][week] = !this.openWeeks[kpi][week];
      this.ngZone.run(() => {
        this.cdr.detectChanges();
        setTimeout(() => this.renderProgramChart(this.getCategoryFromKpi(kpi), week), 0);
      });
    }
  }

  getCategoryFromKpi(kpi: string): 'kpiIp' | 'efficacite' | 'otd' {
    if (kpi === 'KPI IP') return 'kpiIp';
    if (kpi === 'Efficacité') return 'efficacite';
    return 'otd';
  }

  openAddModal(indicateur: string, week: string): void {
    this.newAnalyse = {
      date: new Date().toISOString().split('T')[0],
      semaine: week ? parseInt(week.split(' ')[1], 10) : 0,
      indicateur,
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
    this.showAddModal = true;
    this.ngZone.run(() => this.cdr.detectChanges());
  }

  async addAnalyse(): Promise<void> {
    if (!this.newAnalyse.probleme || !this.newAnalyse.date || !this.newAnalyse.semaine) {
      alert('Veuillez remplir les champs requis.');
      return;
    }

    try {
      const globalAnalyse = {
        ...this.newAnalyse,
        programme: undefined
      };
      await firstValueFrom(this.analyseCausesService.create(globalAnalyse));
      await this.loadAnalyses();
      this.closeAddModal();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'analyse :", error);
      alert("Erreur lors de l'ajout de l'analyse.");
    }
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
    this.ngZone.run(() => this.cdr.detectChanges());
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
  }

  trackByAnalyse(_index: number, analyse: AnalyseCauses): string {
    return `${analyse.date}-${analyse.indicateur}-${analyse.probleme}`;
  }

  trackByWeek(_index: number, week: string): string {
    return week;
  }

  loadAllAverages(): void {
    this.kpiIpService.getAverageResultat().subscribe(avg => {
      this.averageKpiIp = avg;
      this.ngZone.run(() => this.cdr.detectChanges());
    });
    this.delaiService.getAverageResultat().subscribe(avg => {
      this.averageEfficacite = avg;
      this.ngZone.run(() => this.cdr.detectChanges());
    });
    this.coutService.getAverageResultat().subscribe(avg => {
      this.averageOtd = avg;
      this.ngZone.run(() => this.cdr.detectChanges());
    });
  }

  showSection(section: 'kpiIp' | 'efficacite' | 'otd'): void {
    if (this.debounceTimeout['showSection']) {
      clearTimeout(this.debounceTimeout['showSection']);
    }
    this.debounceTimeout['showSection'] = window.setTimeout(() => {
      this.visibleSection = section;
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.renderCharts();
          this.ngZone.run(() => this.cdr.detectChanges());
        }, 100);
      });
    }, 200);
  }

  selectWeekFilter(category: 'kpiIp' | 'efficacite' | 'otd', week: string): void {
    if (this.debounceTimeout[`selectWeek_${category}`]) {
      clearTimeout(this.debounceTimeout[`selectWeek_${category}`]);
    }
    this.debounceTimeout[`selectWeek_${category}`] = window.setTimeout(() => {
      this.selectedWeekFilter[category] = week;
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.renderCharts();
          this.ngZone.run(() => this.cdr.detectChanges());
        }, 100);
      });
    }, 200);
  }

  renderCharts(): void {
    if (!this.visibleSection) return;

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        if (this.visibleSection === 'kpiIp') {
          this.renderGlobalChart('kpiIp', this.kpiIpGlobalChart);
          const weeks = this.selectedWeekFilter.kpiIp
            ? [this.selectedWeekFilter.kpiIp]
            : [...this.filteredWeeks.kpiIp, ...this.filteredWeeks.hseTag.map(w => w + '_hseTag')];
          weeks.forEach(week => this.renderProgramChart('kpiIp', week));
        } else if (this.visibleSection === 'efficacite') {
          this.renderGlobalChart('efficacite', this.efficaciteGlobalChart);
          const weeks = this.selectedWeekFilter.efficacite
            ? [this.selectedWeekFilter.efficacite]
            : this.filteredWeeks.efficacite;
          weeks.forEach(week => this.renderProgramChart('efficacite', week));
        } else if (this.visibleSection === 'otd') {
          this.renderGlobalChart('otd', this.otdGlobalChart);
          const weeks = this.selectedWeekFilter.otd
            ? [this.selectedWeekFilter.otd]
            : this.filteredWeeks.otd;
          weeks.forEach(week => this.renderProgramChart('otd', week));
        }
      });
    });
  }

  renderGlobalChart(category: 'kpiIp' | 'efficacite' | 'otd', viewChild: ElementRef<HTMLCanvasElement>): void {
    if (!viewChild?.nativeElement) {
      console.warn(`Canvas for ${category}GlobalChart not found`);
      return;
    }

    const chartId = `${category}GlobalChart`;
    const canvas = viewChild.nativeElement;

    if (this.chartInstances[chartId]) {
      this.chartInstances[chartId].destroy();
      delete this.chartInstances[chartId];
    }

    if (this.globalChartData[category].labels?.length) {
      try {
        this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            this.chartInstances[chartId] = new Chart(canvas, {
              type: 'line',
              data: this.globalChartData[category],
              options: this.commonChartOptions
            });
          });
        });
      } catch (err) {
        console.error(`Error rendering ${category} Global Chart:`, err);
      }
    }
  }

  renderProgramChart(category: 'kpiIp' | 'efficacite' | 'otd', week: string, retryCount = 0): void {
    const canvasId = `${category}ProgramChart_${week}`;
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!canvas) {
      if (retryCount < 3) {
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => this.renderProgramChart(category, week, retryCount + 1), 100);
        });
        return;
      }
      console.warn(`Canvas ${canvasId} not found after ${retryCount} retries`);
      return;
    }

    if (this.chartInstances[canvasId]) {
      this.chartInstances[canvasId].destroy();
      delete this.chartInstances[canvasId];
    }

    const chartData = this.prepareProgramChart(category, week);
    if (chartData.labels?.length) {
      try {
        this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            this.chartInstances[canvasId] = new Chart(canvas, {
              type: 'line',
              data: chartData,
              options: this.dailyChartOptions
            });
          });
        });
      } catch (err) {
        console.error(`Error rendering ${category} Program Chart for ${week}:`, err);
      }
    }
  }

  prepareProgramChart(category: 'kpiIp' | 'efficacite' | 'otd', week: string): ChartData<'line', number[], string> {
    let data: KPIEntry[];
    if (category === 'kpiIp') {
      const isHseTag = week.endsWith('_hseTag');
      const cleanWeek = isHseTag ? week.replace('_hseTag', '') : week;
      data = isHseTag
        ? this.filteredKpiIpHseTag.filter(e => e.kpi === cleanWeek && e.date)
        : this.filteredKpiIpIpOnly.filter(e => e.kpi === cleanWeek && e.date);
    } else {
      data = (category === 'efficacite' ? this.filteredEfficacites : this.filteredOtds)
        .filter(e => e.kpi === week && e.date);
    }

    if (!data.length) {
      return { labels: [], datasets: [] };
    }

    const sortedData = data.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const labels = sortedData.map(d => {
      const date = new Date(d.date!);
      return `${dayNames[date.getDay()]} ${date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
    });

    const results = sortedData.map(d => d.resultat);

    return {
      labels,
      datasets: [
        {
          label: `${category.charAt(0).toUpperCase() + category.slice(1)} - Résultats`,
          data: results,
          borderColor: category === 'kpiIp' ? '#10b981' : category === 'efficacite' ? '#f59e0b' : '#3b82f6',
          backgroundColor: category === 'kpiIp' ? 'rgba(16, 185, 129, 0.2)' :
                          category === 'efficacite' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
          tension: 0.1,
          fill: false,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Objectif',
          data: sortedData.map(d => d.objectif),
          borderColor: '#ef4444',
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          borderDash: [5, 5]
        }
      ]
    };
  }

  prepareControlChart(data: KPIEntry[], category: string): ChartData<'line', number[], string> {
    if (!data.length || !data.some(d => d.date)) {
      return { labels: [], datasets: [] };
    }

    const dateMap = new Map<string, number[]>();
    data.filter(d => d.date).forEach(d => {
      if (!dateMap.has(d.date!)) dateMap.set(d.date!, []);
      dateMap.get(d.date!)!.push(d.resultat);
    });

    const sortedDates = Array.from(dateMap.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const labels = sortedDates.map(d =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    );

    const results = sortedDates.map(d => {
      const values = dateMap.get(d)!;
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    const lcl = category === 'KpiIp' ? 95 : 90;

    return {
      labels,
      datasets: [
        {
          label: `${category} Résultats (Toutes Semaines)`,
          data: results,
          borderColor: category === 'KpiIp' ? '#10b981' : category === 'Efficacite' ? '#f59e0b' : '#3b82f6',
          backgroundColor: category === 'KpiIp' ? 'rgba(16, 185, 129, 0.2)' : category === 'Efficacite' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
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

  get dailyChartOptions() {
    return {
      ...this.commonChartOptions,
      plugins: {
        ...this.commonChartOptions.plugins,
        tooltip: {
          ...this.commonChartOptions.plugins.tooltip,
          callbacks: {
            title: (context: any) => {
              const dataIndex = context[0].dataIndex;
              return `${context[0].label}`;
            },
            label: (context: any) => {
              const dataIndex = context.dataIndex;
              const dataset = context.dataset;
              const value = dataset.data[dataIndex];

              if (context.datasetIndex === 0) {
                const transactions = this.getTransactionsForDataPoint(context);
                return [
                  `${dataset.label}: ${value.toFixed(2)}%`,
                  `Transactions: ${transactions || 'N/A'}`
                ];
              } else {
                return `${dataset.label}: ${value}%`;
              }
            }
          }
        }
      },
      scales: {
        ...this.commonChartOptions.scales,
        x: {
          ...this.commonChartOptions.scales.x,
          ticks: {
            ...this.commonChartOptions.scales.x.ticks,
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    };
  }

  getTransactionsForDataPoint(context: any): number {
    const category = this.getCategoryFromChartId(context.chart.canvas.id);
    const week = this.getWeekFromChartId(context.chart.canvas.id);
    const dataIndex = context.dataIndex;

    const data = (category === 'kpiIp' ? (week.endsWith('_hseTag') ? this.filteredKpiIpHseTag : this.filteredKpiIpIpOnly) :
                  category === 'efficacite' ? this.filteredEfficacites :
                  this.filteredOtds)
      .filter(e => e.kpi === (week.endsWith('_hseTag') ? week.replace('_hseTag', '') : week) && e.date);

    const sortedData = data.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    return sortedData[dataIndex]?.transactions || 0;
  }

  getCategoryFromChartId(chartId: string): 'kpiIp' | 'efficacite' | 'otd' {
    if (chartId.includes('kpiIp')) return 'kpiIp';
    if (chartId.includes('efficacite')) return 'efficacite';
    return 'otd';
  }

  getWeekFromChartId(chartId: string): string {
    const parts = chartId.split('_');
    return parts.slice(1).join('_');
  }

  applyFilters(category: 'kpiIp' | 'efficacite' | 'otd'): void {
    const startDate = this.filterStartDate[category] ? new Date(this.filterStartDate[category]) : null;
    const endDate = this.filterEndDate[category] ? new Date(this.filterEndDate[category]) : null;

    const isInDateRange = (dateStr: string): boolean => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    };

    if (category === 'kpiIp') {
      const hseTagData = [...this.kpiIps.filter(kpi => this.filteredKpiIpHseTag.some(h => h.kpi === kpi.kpi && h.date === kpi.date && h.pilote === kpi.pilote))];
      const ipOnlyData = [...this.kpiIps.filter(kpi => this.filteredKpiIpIpOnly.some(i => i.kpi === kpi.kpi && i.date === kpi.date && i.pilote === kpi.pilote))];

      this.filteredKpiIpHseTag = hseTagData.filter(e =>
        (!this.selectedWeek.kpiIp || e.kpi === this.selectedWeek.kpiIp) &&
        (!this.selectedPilote.kpiIp || e.pilote === this.selectedPilote.kpiIp) &&
        isInDateRange(e.date ?? '')
      );

      this.filteredKpiIpIpOnly = ipOnlyData.filter(e =>
        (!this.selectedWeek.kpiIp || e.kpi === this.selectedWeek.kpiIp) &&
        (!this.selectedPilote.kpiIp || e.pilote === this.selectedPilote.kpiIp) &&
        isInDateRange(e.date ?? '')
      );

      this.filteredKpiIps = [...this.filteredKpiIpHseTag, ...this.filteredKpiIpIpOnly];

      this.filteredWeeks.kpiIp = Array.from(new Set(this.filteredKpiIpIpOnly.map(item => item.kpi))).sort();
      this.filteredWeeks.hseTag = Array.from(new Set(this.filteredKpiIpHseTag.map(item => item.kpi))).sort();
      this.uniquePilotes.kpiIp = Array.from(new Set(this.filteredKpiIpIpOnly.map(item => item.pilote))).sort();
      this.uniquePilotes.hseTag = Array.from(new Set(this.filteredKpiIpHseTag.map(item => item.pilote))).sort();

      this.calculateStats('kpiIp');
      this.globalChartData.kpiIp = this.prepareControlChart(this.kpiIps, 'KpiIp');
      if (this.visibleSection === 'kpiIp') {
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            if (this.selectedWeekFilter.kpiIp) {
              this.renderProgramChart(category, this.selectedWeekFilter.kpiIp);
            } else {
              this.filteredWeeks.kpiIp.forEach(week => this.renderProgramChart(category, week));
              this.filteredWeeks.hseTag.forEach(week => this.renderProgramChart(category, week + '_hseTag'));
            }
            this.renderGlobalChart(category, this.kpiIpGlobalChart);
            this.ngZone.run(() => this.cdr.detectChanges());
          }, 100);
        });
      }
    } else if (category === 'efficacite') {
      this.filteredEfficacites = this.efficacites.filter(e =>
        (!this.selectedWeek.efficacite || e.kpi === this.selectedWeek.efficacite) &&
        (!this.selectedPilote.efficacite || e.pilote === this.selectedPilote.efficacite) &&
        isInDateRange(e.date ?? '')
      );
      this.filteredWeeks.efficacite = Array.from(new Set(this.filteredEfficacites.map(item => item.kpi))).sort();
      this.uniquePilotes.efficacite = Array.from(new Set(this.filteredEfficacites.map(item => item.pilote))).sort();
      this.calculateStats('efficacite');
      this.globalChartData.efficacite = this.prepareControlChart(this.efficacites, 'Efficacite');
      if (this.visibleSection === 'efficacite') {
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            if (this.selectedWeekFilter.efficacite) {
              this.renderProgramChart(category, this.selectedWeekFilter.efficacite);
            } else {
              this.filteredWeeks.efficacite.forEach(week => this.renderProgramChart(category, week));
            }
            this.renderGlobalChart(category, this.efficaciteGlobalChart);
            this.ngZone.run(() => this.cdr.detectChanges());
          }, 100);
        });
      }
    } else {
      this.filteredOtds = this.otds.filter(e =>
        (!this.selectedWeek.otd || e.kpi === this.selectedWeek.otd) &&
        (!this.selectedPilote.otd || e.pilote === this.selectedPilote.otd) &&
        isInDateRange(e.date ?? '')
      );
      this.filteredWeeks.otd = Array.from(new Set(this.filteredOtds.map(item => item.kpi))).sort();
      this.uniquePilotes.otd = Array.from(new Set(this.filteredOtds.map(item => item.pilote))).sort();
      this.calculateStats('otd');
      this.globalChartData.otd = this.prepareControlChart(this.otds, 'Otd');
      if (this.visibleSection === 'otd') {
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            if (this.selectedWeekFilter.otd) {
              this.renderProgramChart(category, this.selectedWeekFilter.otd);
            } else {
              this.filteredWeeks.otd.forEach(week => this.renderProgramChart(category, week));
            }
            this.renderGlobalChart(category, this.otdGlobalChart);
            this.ngZone.run(() => this.cdr.detectChanges());
          }, 100);
        });
      }
    }
  }

  resetFilters(category: 'kpiIp' | 'efficacite' | 'otd'): void {
    this.selectedWeek[category] = '';
    this.selectedPilote[category] = '';
    this.filterStartDate[category] = '';
    this.filterEndDate[category] = '';
    this.selectedWeekFilter[category] = '';
    this.applyFilters(category);
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

  filterKpiIpByWeek(week: string): KPIEntry[] {
    return this.filteredKpiIpIpOnly.filter(kpi => kpi.kpi === week);
  }

  filterHseTagByWeek(week: string): KPIEntry[] {
    return this.filteredKpiIpHseTag.filter(kpi => kpi.kpi === week);
  }

  mapKpiIpData(data: KPI_IP[]): KPIEntry[] {
    const groupedByWeekAndDay: { [key: string]: { [day: string]: KPI_IP[] } } = {};

    data.forEach(item => {
      const semaineAnnee = item.semaineAnnee;
      const semaineLabel = this.formatWeekLabel(semaineAnnee);
      const dayKey = semaineAnnee ? (this.semaineAnneeToDate(semaineAnnee) ?? 'unknown') : 'unknown';

      if (!groupedByWeekAndDay[semaineLabel]) {
        groupedByWeekAndDay[semaineLabel] = {};
      }
      if (!groupedByWeekAndDay[semaineLabel][dayKey]) {
        groupedByWeekAndDay[semaineLabel][dayKey] = [];
      }
      groupedByWeekAndDay[semaineLabel][dayKey].push(item);
    });

    const result: KPIEntry[] = [];

    Object.entries(groupedByWeekAndDay).forEach(([semaineLabel, dayData]) => {
      Object.entries(dayData).forEach(([day, items]) => {
        const totalKpi = items.length;
        const resultat = totalKpi > 0 ? (items.filter(i => i.hseTag).length / totalKpi) * 100 : 0;

        result.push({
          kpi: semaineLabel,
          resultat: parseFloat(resultat.toFixed(2)),
          objectif: 100,
          pilote: items[0]?.emetteur || 'Unknown',
          date: day,
          transactions: totalKpi
        });
      });
    });

    return result.filter(d => d.date && d.date !== 'unknown');
  }

  formatWeekLabel(semaineAnnee: string): string {
    const match = semaineAnnee.match(/(\d{4})-W(\d{1,2})/);
    if (!match) return semaineAnnee;
    const year = parseInt(match[1], 10);
    const week = parseInt(match[2], 10);
    return `Semaine ${week} (${year})`;
  }

  mapEfficaciteData(data: Delai[]): KPIEntry[] {
    const groupedByWeekAndDay: { [key: string]: { [day: string]: Delai[] } } = {};

    data.forEach(delai => {
      const week = dayjs(delai.date).isoWeek();
      const year = dayjs(delai.date).year();
      const weekKey = `Semaine ${week} (${year})`;
      const dayKey = dayjs(delai.date).format('YYYY-MM-DD');

      if (!groupedByWeekAndDay[weekKey]) {
        groupedByWeekAndDay[weekKey] = {};
      }
      if (!groupedByWeekAndDay[weekKey][dayKey]) {
        groupedByWeekAndDay[weekKey][dayKey] = [];
      }
      groupedByWeekAndDay[weekKey][dayKey].push(delai);
    });

    const result: KPIEntry[] = [];

    Object.entries(groupedByWeekAndDay).forEach(([weekKey, dayData]) => {
      Object.entries(dayData).forEach(([day, delais]) => {
        const totalATemps = delais.reduce((sum, d) => sum + d.nombrePiecesATemps, 0);
        const totalPlanifiees = delais.reduce((sum, d) => sum + d.nombrePiecesPlanifiees, 0);
        const resultat = totalPlanifiees === 0 ? 0 : (totalATemps / totalPlanifiees) * 100;

        result.push({
          kpi: weekKey,
          resultat: parseFloat(resultat.toFixed(2)),
          objectif: 95,
          pilote: delais[0]?.pilote || 'Unknown',
          date: day,
          transactions: totalPlanifiees
        });
      });
    });

    return result.filter(d => d.date);
  }

  mapOtdData(data: Cout[]): KPIEntry[] {
    const groupedByWeekAndDay: { [key: string]: { [day: string]: Cout[] } } = {};

    data.forEach(cout => {
      const date = new Date(cout.date);
      const weekKey = this.getWeekKey(date);
      const dayKey = cout.date ? new Date(cout.date).toISOString().split('T')[0] : 'unknown';

      if (!groupedByWeekAndDay[weekKey]) {
        groupedByWeekAndDay[weekKey] = {};
      }
      if (!groupedByWeekAndDay[weekKey][dayKey]) {
        groupedByWeekAndDay[weekKey][dayKey] = [];
      }
      groupedByWeekAndDay[weekKey][dayKey].push(cout);
    });

    const result: KPIEntry[] = [];

    Object.entries(groupedByWeekAndDay).forEach(([weekKey, dayData]) => {
      Object.entries(dayData).forEach(([day, couts]) => {
        const totalStandards = couts.reduce((sum, d) => sum + (d.heuresStandardsDeclarees || 0), 0);
        const totalPresence = couts.reduce((sum, d) => sum + (d.heuresPresenceBadgees || 0), 0);
        const resultat = totalPresence > 0 ? (totalStandards / totalPresence) * 100 : 0;

        result.push({
          kpi: weekKey,
          resultat: parseFloat(resultat.toFixed(2)),
          objectif: couts[0]?.objectif || 95,
          pilote: couts[0]?.pilote || 'Unknown',
          date: day,
          transactions: totalPresence
        });
      });
    });

    return result.filter(d => d.date && d.date !== 'unknown');
  }

  semaineAnneeToDate(semaineAnnee: string): string | undefined {
    const match = semaineAnnee.match(/(\d{4})-W(\d{2})/);
    if (!match) return undefined;
    const year = parseInt(match[1]);
    const week = parseInt(match[2]);
    return dayjs().year(year).isoWeek(week).startOf('isoWeek').format('YYYY-MM-DD');
  }

  getWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `Semaine ${weekNo} (${d.getUTCFullYear()})`;
  }

  calculateStats(category: 'kpiIp' | 'efficacite' | 'otd'): void {
    const data = category === 'kpiIp' ? this.filteredKpiIps : category === 'efficacite' ? this.filteredEfficacites : this.filteredOtds;
    const results = data.map(e => e.resultat);
    const averageResultat = results.length ? results.reduce((sum, val) => sum + val, 0) / results.length : 0;

    const previousResult = this.previousResults[category];
    const trend = averageResultat > previousResult ? 'up' : averageResultat < previousResult ? 'down' : 'stable';
    this.previousResults[category] = averageResultat;

    const color = category === 'kpiIp' ? '#10b981' : category === 'efficacite' ? '#f59e0b' : '#3b82f6';

    if (category === 'kpiIp') {
      this.kpiIpStats = [
        { title: 'Résultat Moyen', value: averageResultat.toFixed(2), unit: '%', trend, color },
        { title: 'Total KPI IP', value: this.totalKpiIp, unit: '', trend: 'stable', color },
        { title: 'Total HSE Tag', value: this.totalHseTag, unit: '', trend: 'stable', color },
        { title: 'Total IP', value: this.totalIp, unit: '', trend: 'stable', color }
      ];
    } else if (category === 'efficacite') {
      this.efficaciteStats = [
        { title: 'Résultat Moyen', value: averageResultat.toFixed(2), unit: '%', trend, color }
      ];
    } else {
      this.otdStats = [
        { title: 'Résultat Moyen', value: averageResultat.toFixed(2), unit: '%', trend, color }
      ];
    }
  }

  ngOnDestroy(): void {
    Object.values(this.chartInstances).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    Object.values(this.debounceTimeout).forEach(timeout => clearTimeout(timeout));
  }

  getAlertClass(value: number | null): string {
    if (value == null) return '';
    if (value < 60) return 'flash-critical';
    if (value < this.threshold) return 'flash-warning';
    return 'flash-success';
  }

  getAnalysesFor(indicateur: string, week?: string): AnalyseCauses[] {
    let list = this.analyseCauses.filter(a => a.indicateur === indicateur && !a.programme);
    if (week) {
      const num = parseInt(week.split(' ')[1], 10);
      list = list.filter(a => a.semaine === num);
    }
    return list;
  }
}