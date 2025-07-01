import { Component, OnInit } from '@angular/core';
import { Chart, ChartData, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { QualiteService } from 'src/app/services/qualite.service';
import { CoutService } from 'src/app/services/cout.service';
import { DelaiService } from 'src/app/services/delai.service';
import { firstValueFrom } from 'rxjs';

Chart.register(...registerables, ChartDataLabels);

interface KPIEntry {
  kpi: string;
  resultat: number;
  objectif: number;
  pilote: string;
  date?: string;
  transactions?: number;
}


@Component({
  selector: 'app-full-dashboard',
  templateUrl: './full-dashboard.component.html',
  styleUrls: ['./full-dashboard.component.css']
})
export class FullDashboardComponent implements OnInit {
  loading = false;
  error = '';

  selectedCategory: 'all' | 'qualite' | 'cout' | 'delai' = 'all';  // default all
  categoryOptions = ['all', 'qualite', 'cout', 'delai'];
filterStartDate: string = '';
filterEndDate: string = '';

  qualites: KPIEntry[] = [];
  couts: KPIEntry[] = [];
  delais: KPIEntry[] = [];

  filteredKPIs: string[] = [];
  uniquePilotes: string[] = [];

  filteredQualites: KPIEntry[] = [];
  filteredCouts: KPIEntry[] = [];
  filteredDelais: KPIEntry[] = [];

  selectedKPI = '';      // no KPI filter initially
  selectedPilote = '';   // no pilote filter initially

  barChartData: ChartData<'bar' | 'line', (number | null)[], string> = { labels: [], datasets: [] };
  lineChartData: ChartData<'line', number[], string> = { labels: [], datasets: [] };

  commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 20,
          usePointStyle: true
        }
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
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y}%`
        }
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        color: '#000',
        font: {
          weight: 'bold' as const,
          size: 10
        },
     

      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, maxRotation: 45 }
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: {
          stepSize: 10,
          callback: (val: any) => val + '%',
          font: { size: 11 }
        }
      }
    },
    elements: {
      bar: { borderRadius: 4, borderSkipped: false },
      line: { tension: 0.4 },
      point: { radius: 6, hoverRadius: 8 }
    }
  };

  constructor(
    private qualiteService: QualiteService,
    private coutService: CoutService,
    private delaiService: DelaiService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    Promise.all([
      firstValueFrom(this.qualiteService.getAll()),
      firstValueFrom(this.coutService.getAll()),
      firstValueFrom(this.delaiService.getAll())
    ])
    .then(([qualitesData, coutsData, delaisData]) => {
      this.qualites = (qualitesData ?? []).map(q => ({
        kpi: q.kpi ?? '',
        resultat: q.resultat ?? 0,
        objectif: q.objectif ?? 95,
        pilote: q.pilote ?? '',
        date: q.date,
        transactions: q.resultat ? q.resultat * 50 : 0
      }));

      this.couts = (coutsData ?? []).map(c => ({
        kpi: c.kpi ?? '',
        resultat: c.resultat ?? 0,
        objectif: c.objectif ?? 95,
        pilote: c.pilote ?? '',
        date: c.date,
        transactions: c.resultat ? c.resultat * 50 : 0
      }));

      this.delais = (delaisData ?? []).map(d => ({
        kpi: d.kpi ?? '',
        resultat: d.resultat ?? 0,
        objectif: d.objectif ?? 95,
        pilote: d.pilote ?? '',
        date: d.date,
        transactions: d.resultat ? d.resultat * 50 : 0
      }));

      // Combine all KPIs & Pilotes from all data sets
      const allEntries = [...this.qualites, ...this.couts, ...this.delais];
      this.filteredKPIs = Array.from(new Set(allEntries.map(item => item.kpi))).sort();
      this.uniquePilotes = Array.from(new Set(allEntries.map(item => item.pilote))).sort();

      // Initially show all data in filtered lists
      this.filteredQualites = this.qualites;
      this.filteredCouts = this.couts;
      this.filteredDelais = this.delais;

      this.applyFilters();
    })
    .catch(err => {
      this.error = 'Erreur lors du chargement des données. Veuillez réessayer.';
      console.error(err);
    })
    .finally(() => {
      this.loading = false;
    });
  }

 applyFilters(): void {
  let entries: KPIEntry[] = [];

  if (this.selectedCategory === 'qualite') entries = this.qualites;
  else if (this.selectedCategory === 'cout') entries = this.couts;
  else if (this.selectedCategory === 'delai') entries = this.delais;
  else if (this.selectedCategory === 'all') {
    entries = [...this.qualites, ...this.couts, ...this.delais];
  }

  // Filter KPIs from current category/all entries
  this.filteredKPIs = Array.from(new Set(entries.map(e => e.kpi))).sort();

  // Filter based on selectedKPI, selectedPilote, and date range
  const startDate = this.filterStartDate ? new Date(this.filterStartDate) : null;
  const endDate = this.filterEndDate ? new Date(this.filterEndDate) : null;

  function isInDateRange(dateStr: string): boolean {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  }

  this.filteredQualites = (this.selectedCategory === 'qualite' || this.selectedCategory === 'all')
    ? this.qualites.filter(e =>
        (!this.selectedKPI || e.kpi === this.selectedKPI) &&
        (!this.selectedPilote || e.pilote === this.selectedPilote) &&
        isInDateRange(e.date ?? '')
      ) : [];

  this.filteredCouts = (this.selectedCategory === 'cout' || this.selectedCategory === 'all')
    ? this.couts.filter(e =>
        (!this.selectedKPI || e.kpi === this.selectedKPI) &&
        (!this.selectedPilote || e.pilote === this.selectedPilote) &&
        isInDateRange(e.date ?? '')
      ) : [];

  this.filteredDelais = (this.selectedCategory === 'delai' || this.selectedCategory === 'all')
    ? this.delais.filter(e =>
        (!this.selectedKPI || e.kpi === this.selectedKPI) &&
        (!this.selectedPilote || e.pilote === this.selectedPilote) &&
        isInDateRange(e.date ?? '')
      ) : [];

  this.prepareCharts();
}
clearDateFilters(): void {
  this.filterStartDate = '';
  this.filterEndDate = '';
  this.applyFilters();
}

resetAllFilters(): void {
  this.selectedKPI = '';
  this.selectedPilote = '';
  this.filterStartDate = '';
  this.filterEndDate = '';
  this.applyFilters();
}

  prepareCharts(): void {
    if (!this.selectedKPI) {
      // No KPI filter: Show combined bar chart by category or combined data
if (this.selectedCategory !== 'all') {
        // Prepare combined bar chart by category with all KPIs
        this.barChartData = this.getCombinedBarChartDataForCategory(this.selectedCategory);
        this.lineChartData = this.prepareLineChart([], ''); // clear or minimal line chart
      } else {
        // Show combined data line and bar charts for 'all' category or others
        const combinedData = [...this.filteredQualites, ...this.filteredCouts, ...this.filteredDelais];
        this.barChartData = this.prepareBarChart(combinedData, '');
        this.lineChartData = this.prepareLineChart(combinedData, '');
      }
      return;
    }

    // If KPI selected, prepare charts filtered by KPI and category
    let data: KPIEntry[] = [];
    if (this.selectedCategory === 'qualite') data = this.filteredQualites;
    else if (this.selectedCategory === 'cout') data = this.filteredCouts;
    else if (this.selectedCategory === 'delai') data = this.filteredDelais;
    else if (this.selectedCategory === 'all') data = [...this.filteredQualites, ...this.filteredCouts, ...this.filteredDelais];

    this.barChartData = this.prepareBarChart(data, this.selectedKPI);
    this.lineChartData = this.prepareLineChart(data, this.selectedKPI);
  }

  // This method creates a combined bar chart showing average "resultat" per KPI in a category (for the big combined chart)
  getCombinedBarChartDataForCategory(category: 'qualite' | 'cout' | 'delai'): ChartData<'bar', number[], string> {
    let data: KPIEntry[] = [];
    if (category === 'qualite') data = this.filteredQualites;
    else if (category === 'cout') data = this.filteredCouts;
    else if (category === 'delai') data = this.filteredDelais;

    if (!data.length) return { labels: [], datasets: [] };

    // Group by KPI and calculate average resultat per KPI
    const kpiMap = new Map<string, number[]>();
    data.forEach(d => {
      if (!kpiMap.has(d.kpi)) {
        kpiMap.set(d.kpi, []);
      }
      kpiMap.get(d.kpi)!.push(d.resultat);
    });

    const labels = Array.from(kpiMap.keys());
    const avgResults = labels.map(kpi => average(kpiMap.get(kpi)!));

    return {
      labels,
      datasets: [
        {
          label: `Résultat moyen par KPI (${category})`,
          data: avgResults,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    };
  }

  prepareBarChart(
    data: KPIEntry[],
    selectedKpi: string,
    category: string = ''
  ): ChartData<'bar' | 'line', (number | null)[], string> {

    const filteredData = selectedKpi
      ? data.filter(d => d.kpi === selectedKpi && d.date)
      : data.filter(d => d.date);

    if (!filteredData.length) return { labels: [], datasets: [] };

    // Get all unique dates sorted
    const allDates = Array.from(new Set(filteredData.map(d => d.date!))).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const dateMap = new Map<string, number | null>();

    allDates.forEach(date => {
      const values = filteredData.filter(d => d.date === date).map(d => d.resultat);
      dateMap.set(date, values.length ? average(values) : null);
    });

    const labels = allDates.map(d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
    const values = allDates.map(d => dateMap.get(d) ?? null);

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: `Résultats ${category}`,
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          type: 'line',
          label: `Tendance ${category}`,
          data: values,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 5,
          spanGaps: true,
        }
      ]
    };
  }

  prepareLineChart(data: KPIEntry[], selectedKpi: string): ChartData<'line', number[], string> {
    const filteredData = selectedKpi
      ? data.filter(d => d.kpi === selectedKpi && d.date)
      : data.filter(d => d.date);

    if (!filteredData.length) return { labels: [], datasets: [] };

    const sorted = [...filteredData].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    const labels = sorted.map(d =>
      new Date(d.date!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    );

    const resultatData = sorted.map(d => d.resultat ?? 0);

    // Fixed objective line (e.g., 95%)
    const objectif = sorted[0].objectif ?? 95; // take first or default
    const objectifLine = new Array(resultatData.length).fill(objectif);

    return {
      labels,
      datasets: [
        {
          label: 'Résultat',
          data: resultatData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.3,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          type: 'line',
          label: 'Objectif 95%',
          data: objectifLine,
          borderColor: 'red',
          borderWidth: 2,
          fill: false,
          tension: 0,
          pointRadius: 0,
          borderDash: [],
        }
      ]
    };
  }

  getBarChartDataByCategory(category: 'qualite' | 'cout' | 'delai'): ChartData<'bar' | 'line', (number | null)[], string> {
    let data: KPIEntry[] = [];
    if (category === 'qualite') data = this.filteredQualites;
    else if (category === 'cout') data = this.filteredCouts;
    else if (category === 'delai') data = this.filteredDelais;

    return this.prepareBarChart(data, this.selectedKPI, category);
  }

  getLineChartDataByCategory(category: 'qualite' | 'cout' | 'delai'): ChartData<'line', number[], string> {
    let data: KPIEntry[] = [];
    if (category === 'qualite') data = this.filteredQualites;
    else if (category === 'cout') data = this.filteredCouts;
    else if (category === 'delai') data = this.filteredDelais;

    const kpiFilter = this.selectedKPI || '';
    return this.prepareLineChart(data, kpiFilter);
  }
  

  categories: ('qualite' | 'cout' | 'delai')[] = ['qualite', 'cout', 'delai'];

  getSectionIcon(): string {
    switch (this.selectedCategory) {
      case 'qualite': return '✅';
      case 'cout': return '💰';
      case 'delai': return '⏰';
      case 'all': return '📊';
      default: return '';
    }
  }

  getSectionIconFor(category: string): string {
    switch (category) {
      case 'qualite': return '✅';
      case 'cout': return '💰';
      case 'delai': return '⏰';
      default: return '📊';
    }
  }
  
}

function average(arr: number[]): number {
  if (!arr.length) return 0;
  return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
}
