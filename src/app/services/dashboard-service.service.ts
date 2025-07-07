// src/app/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { CoutService } from './cout.service';
import { OtdService } from './otd.service';
import { KpiIpService } from './kpi-ip.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private coutService: CoutService,
    private otdService: OtdService,
    private kpiIpService: KpiIpService
  ) {}

  getDashboardStats(): Observable<DashboardStatsData | null> {
    return forkJoin({
      couts: this.coutService.getAll(),
      otds: this.otdService.getAll(),
      kpiIps: this.kpiIpService.getAll(),
    }).pipe(
      map(({ couts, otds, kpiIps }) => {
        // Group couts by week with detailed stats
        const groupedCouts = this.groupByWeek(couts);

        // KPI_IP grouped by semaineAnnee
        const groupedKpiIp = this.groupBySemaineAnnee(kpiIps);

        // OTD summary and weekly grouping
        const otdSummary = this.computeOtdSummary(otds);

        // Additional overall stats for couts
        const coutOverallAverageResultat =
          couts.length > 0
            ? couts.reduce((sum, c) => sum + (c.heuresStandardsDeclarees || 0), 0) /
              couts.reduce((sum, c) => sum + (c.heuresPresenceBadgees || 0), 0) *
              100
            : 0;

        return {
          groupedCouts,
          groupedKpiIp,
          otdSummary,
          coutOverallAverageResultat,
        };
      }),
      catchError((error) => {
        console.error('Dashboard loading error:', error);
        return of(null);
      })
    );
  }

  private groupByWeek(couts: any[]) {
    const grouped: { [week: string]: any[] } = {};
    couts.forEach((c) => {
      const weekKey = this.getWeekKey(new Date(c.date));
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(c);
    });

    return Object.entries(grouped).map(([week, data]) => {
      const totalStandards = data.reduce((sum, d) => sum + (d.heuresStandardsDeclarees || 0), 0);
      const totalPresence = data.reduce((sum, d) => sum + (d.heuresPresenceBadgees || 0), 0);
      const resultat = totalPresence > 0 ? (totalStandards / totalPresence) * 100 : 0;
      const objectif = data[0]?.objectif || 95;

      // Add percentage achievement of objectif
      const achievementPct = (resultat / objectif) * 100;

      return { week, totalStandards, totalPresence, resultat, objectif, achievementPct };
    });
  }

  private groupBySemaineAnnee(kpiIps: any[]) {
    const grouped: { [key: string]: any[] } = {};
    kpiIps.forEach((item) => {
      const key = item.semaineAnnee;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.entries(grouped).map(([semaineAnnee, items]) => {
      const nbrHseTag = items.filter((i) => i.hseTag).length;
      const nbrIp = items.filter((i) => !i.hseTag).length;
      const totalKpi = items.length;
      const objectif = 100;

      // Example: % HSE Tags ratio
      const hseTagRatio = totalKpi ? (nbrHseTag / totalKpi) * 100 : 0;

      return { semaineAnnee, nbrHseTag, nbrIp, totalKpi, objectif, hseTagRatio };
    });
  }

  private computeOtdSummary(otds: any[]) {
    const groupedByWeek: { [week: string]: any[] } = {};
    otds.forEach((o) => {
      const week = o.semaine;
      if (!groupedByWeek[week]) groupedByWeek[week] = [];
      groupedByWeek[week].push(o);
    });

    // Aggregate per week
    const weeklyStats = Object.entries(groupedByWeek).map(([week, entries]) => {
      const totalRealises = entries.reduce((sum, e) => sum + e.realises, 0);
      const totalBacklog = entries.reduce((sum, e) => sum + e.backlog, 0);
      const totalTaux = entries.reduce((sum, e) => sum + (e.tauxRealisation || 0), 0);
      const averageTaux = entries.length > 0 ? totalTaux / entries.length : 0;
      const objectif = 95;

      return { week, totalRealises, totalBacklog, averageTaux, objectif };
    });

    // Overall totals
    const totalRealises = otds.reduce((sum, o) => sum + o.realises, 0);
    const totalBacklog = otds.reduce((sum, o) => sum + o.backlog, 0);
    const averageTaux =
      otds.length > 0
        ? otds.reduce((sum, o) => sum + (o.tauxRealisation || 0), 0) / otds.length
        : 0;

    return { weeklyStats, totalRealises, totalBacklog, averageTaux, objectif: 95 };
  }

  private getWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `Semaine ${weekNo} (${d.getUTCFullYear()})`;
  }
}

export interface DashboardStatsData {
  groupedCouts: {
    week: string;
    totalStandards: number;
    totalPresence: number;
    resultat: number;
    objectif: number;
    achievementPct: number;
  }[];
  groupedKpiIp: {
    semaineAnnee: string;
    nbrHseTag: number;
    nbrIp: number;
    totalKpi: number;
    objectif: number;
    hseTagRatio: number;
  }[];
  otdSummary: {
    weeklyStats: {
      week: string;
      totalRealises: number;
      totalBacklog: number;
      averageTaux: number;
      objectif: number;
    }[];
    totalRealises: number;
    totalBacklog: number;
    averageTaux: number;
    objectif: number;
  };
  coutOverallAverageResultat: number;
}
