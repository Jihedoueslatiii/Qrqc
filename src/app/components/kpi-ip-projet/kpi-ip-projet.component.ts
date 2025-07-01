import { Component, OnInit } from '@angular/core';
import { KpiIpService } from '../../services/kpi-ip.service';
import { KPI_IP } from '../../models/KPI_IP';

@Component({
  selector: 'app-kpi-ip-projet',
  templateUrl: './kpi-ip-projet.component.html',
  styleUrls: ['./kpi-ip-projet.component.css']
})
export class KpiIpProjetComponent implements OnInit {
  data: KPI_IP[] = [];

  groupedBySemaine: {
    semaineAnnee: string;
    items: KPI_IP[];
    totalKpi: number;
    objectif: number;
    nbrHseTag: number;
    nbrIp: number;
  }[] = [];

  loading = false;

  constructor(private kpiIpService: KpiIpService) {}

  ngOnInit(): void {
    this.loadKpiIp();
  }

  loadKpiIp(): void {
    this.loading = true;
    this.kpiIpService.getAll().subscribe({
      next: (response) => {
        this.data = response;
        this.groupData();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement des données KPI IP.');
      }
    });
  }

  groupData(): void {
    const grouped: { [key: string]: KPI_IP[] } = {};

    this.data.forEach(item => {
      const key = item.semaineAnnee;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    this.groupedBySemaine = Object.entries(grouped).map(([semaineAnnee, items]) => {
      const nbrHseTag = items.filter(i => i.hseTag).length;
      const nbrIp = items.filter(i => !i.hseTag).length;
      const totalKpi = items.length;
      const objectif = 100;

      return {
        semaineAnnee,
        items,
        totalKpi,
        objectif,
        nbrHseTag,
        nbrIp
      };
    });
  }

  get totalHseTag(): number {
    return this.groupedBySemaine.reduce((sum, g) => sum + g.nbrHseTag, 0);
  }

  get totalIp(): number {
    return this.groupedBySemaine.reduce((sum, g) => sum + g.nbrIp, 0);
  }

  get totalAll(): number {
    return this.groupedBySemaine.reduce((sum, g) => sum + g.totalKpi, 0);
  }
}
