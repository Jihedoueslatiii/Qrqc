import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { QualiteService } from 'src/app/services/qualite.service';
import { DelaiService } from 'src/app/services/delai.service';
import { CoutService } from 'src/app/services/cout.service';
import { AnomalyService, KpiData } from 'src/app/services/anomaly-service.service';
interface KpiAverage {
  kpi: string;
  average: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  averageQualite: number | null = null;
  averageDelai: number | null = null;
  averageCout: number | null = null;
    anomalyPredictions: number[] = [];


  qualiteAveragesByKpi: KpiAverage[] = [];
  delaiAveragesByKpi: KpiAverage[] = [];
  coutAveragesByKpi: KpiAverage[] = [];

  loading = false;
  error = '';

  constructor(
    private qualiteService: QualiteService,
    private delaiService: DelaiService,
    private coutService: CoutService,
        private anomalyService: AnomalyService // Inject here

  ) {}

  ngOnInit(): void {
    this.loadAllAverages();
    this.loadAveragesByKpiClientSide();
  }

  loadAllAverages() {
    this.loading = true;
    this.error = '';

    forkJoin({
      qualiteAvg: this.qualiteService.getAverageResultat(),
      delaiAvg: this.delaiService.getAverageResultat(),
      coutAvg: this.coutService.getAverageResultat()
    }).subscribe({
      next: ({ qualiteAvg, delaiAvg, coutAvg }) => {
        this.averageQualite = qualiteAvg;
        this.averageDelai = delaiAvg;
        this.averageCout = coutAvg;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });
  }

  private loadAveragesByKpiClientSide() {
    // Qualite
    this.qualiteService.getAll().subscribe(items => {
      this.qualiteAveragesByKpi = this.calculateAverageByKpi(items);
    });

    // Delai
    this.delaiService.getAll().subscribe(items => {
      this.delaiAveragesByKpi = this.calculateAverageByKpi(items);
    });

    // Cout
    this.coutService.getAll().subscribe(items => {
      this.coutAveragesByKpi = this.calculateAverageByKpi(items);
    });
  }

  private calculateAverageByKpi(items: any[]): KpiAverage[] {
    const grouped: { [kpi: string]: number[] } = {};

    items.forEach(item => {
      if (item.kpi && typeof item.resultat === 'number') {
        if (!grouped[item.kpi]) {
          grouped[item.kpi] = [];
        }
        grouped[item.kpi].push(item.resultat);
      }
    });

    return Object.keys(grouped).map(kpi => {
      const results = grouped[kpi];
      const avg = results.reduce((acc, val) => acc + val, 0) / results.length;
      return { kpi, average: avg };
    });
  }
threshold = 90; // example threshold

getAlertClass(value: number | null): string {
  if (value == null) return '';
  if (value < 60) return 'flash-critical';
  if (value < this.threshold) return 'flash-warning';
  return '';
}

}
