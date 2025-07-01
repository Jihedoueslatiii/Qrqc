import { Component, OnInit } from '@angular/core';
import { Cout, CoutService } from 'src/app/services/cout.service';

@Component({
  selector: 'app-otdprojet',
  templateUrl: './otd-projet.component.html',
  styleUrls: ['./otd-projet.component.css']
})
export class OtdProjetComponent implements OnInit {
  couts: Cout[] = [];
  groupedByWeek: {
    week: string;
    data: Cout[];
    totalStandards: number;
    totalPresence: number;
    resultat: number;
    objectif: number;
  }[] = [];

  loading = false;

  constructor(private coutService: CoutService) {}

  ngOnInit(): void {
    this.loadCouts();
  }

  loadCouts(): void {
    this.loading = true;
    this.coutService.getAll().subscribe({
      next: (data) => {
        this.couts = data;
        this.groupDataByWeek();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement des données');
      }
    });
  }

  groupDataByWeek(): void {
    const grouped: { [week: string]: Cout[] } = {};

    this.couts.forEach(cout => {
      const date = new Date(cout.date);
      const weekKey = this.getWeekKey(date);
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(cout);
    });

    this.groupedByWeek = Object.entries(grouped).map(([week, data]) => {
      const totalStandards = data.reduce((sum, d) => sum + (d.heuresStandardsDeclarees || 0), 0);
      const totalPresence = data.reduce((sum, d) => sum + (d.heuresPresenceBadgees || 0), 0);
      const resultat = totalPresence > 0 ? (totalStandards / totalPresence) * 100 : 0;
      const objectif = data[0]?.objectif || 95;

      return { week, data, totalStandards, totalPresence, resultat, objectif };
    });
  }

  getWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `Semaine ${weekNo} (${d.getUTCFullYear()})`;
  }
}
