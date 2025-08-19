import { Component, OnInit } from '@angular/core';
import { DelaiService } from 'src/app/services/delai.service';
import { Delai } from 'src/app/models/Delai';
import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

interface WeeklyEfficacite {
  week: number;
  debut: string;
  fin: string;
  totalATemps: number;
  totalPlanifiees: number;
  resultat: number;
  objectif: number;
}

@Component({
  selector: 'app-efficacite',
  templateUrl: './efficacite.component.html',
  styleUrls: ['./efficacite.component.css']
})
export class EfficaciteComponent implements OnInit {
  allDelais: Delai[] = [];
  weeklyData: WeeklyEfficacite[] = [];
  objectifFixe: number = 95;

  constructor(private delaiService: DelaiService) {}

  ngOnInit(): void {
    this.delaiService.getAll().subscribe(data => {
      this.allDelais = data;
      this.groupByWeek();
    });
  }

  groupByWeek(): void {
    const weekGroups: { [key: number]: Delai[] } = {};

    this.allDelais.forEach(d => {
      const week = dayjs(d.date).isoWeek();
      if (!weekGroups[week]) weekGroups[week] = [];
      weekGroups[week].push(d);
    });

    this.weeklyData = Object.entries(weekGroups).map(([weekStr, delais]) => {
      const week = parseInt(weekStr);
      const totalATemps = delais.reduce((sum, d) => sum + d.nombrePiecesATemps, 0);
      const totalPlanifiees = delais.reduce((sum, d) => sum + d.nombrePiecesPlanifiees, 0);
      const resultat = totalPlanifiees === 0 ? 0 : (totalATemps / totalPlanifiees) * 100;

      const firstDate = dayjs(delais[0].date).startOf('isoWeek').format('YYYY-MM-DD');
      const lastDate = dayjs(delais[0].date).endOf('isoWeek').format('YYYY-MM-DD');

      return {
        week,
        debut: firstDate,
        fin: lastDate,
        totalATemps,
        totalPlanifiees,
        resultat: parseFloat(resultat.toFixed(2)),
        objectif: this.objectifFixe
      };
    });
  }
  kpiTitle: string = "KPI Délai = OTD (Souha( Kais Back up)";
editingTitle: boolean = false;

editTitle() {
  this.editingTitle = true;
}

saveTitle() {
  this.editingTitle = false;
  // You can add logic to persist the title if needed
}

}
