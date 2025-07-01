// shared-kpi.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DelaiService } from './delai.service';
import { CoutService } from './cout.service';
// Import your QualiteService here
// import { QualiteService } from './qualite.service';

export interface KpiInfo {
  kpi: string;
  pilote: string;
  objectif: number;
  source: 'delai' | 'cout' | 'qualite';
}

@Injectable({
  providedIn: 'root'
})
export class SharedKpiService {
  private kpisSubject = new BehaviorSubject<KpiInfo[]>([]);
  public kpis$ = this.kpisSubject.asObservable();

  constructor(
    private delaiService: DelaiService,
    private coutService: CoutService
    // private qualiteService: QualiteService // Add when available
  ) {
    this.loadAllKpis();
  }

  // Load KPIs from all services
  loadAllKpis(): void {
    combineLatest([
      this.delaiService.getAll(),
      this.coutService.getAll()
      // this.qualiteService.getAll() // Add when available
    ]).subscribe({
      next: ([delais, couts /*, qualites*/]) => {
        const allKpis: KpiInfo[] = [];

        // Extract KPIs from delais
        const delaiKpis = this.extractUniqueKpis(delais, 'delai');
        allKpis.push(...delaiKpis);

        // Extract KPIs from couts
        const coutKpis = this.extractUniqueKpis(couts, 'cout');
        allKpis.push(...coutKpis);

        // Extract KPIs from qualites
        // const qualiteKpis = this.extractUniqueKpis(qualites, 'qualite');
        // allKpis.push(...qualiteKpis);

        // Remove duplicates (same KPI name)
        const uniqueKpis = this.removeDuplicateKpis(allKpis);
        this.kpisSubject.next(uniqueKpis);
      },
      error: (error) => {
        console.error('Error loading KPIs from services:', error);
      }
    });
  }

  // Extract unique KPIs from data array
  private extractUniqueKpis(data: any[], source: 'delai' | 'cout' | 'qualite'): KpiInfo[] {
    const kpiMap = new Map<string, KpiInfo>();
    
    data.forEach(item => {
      if (item.kpi && !kpiMap.has(item.kpi)) {
        kpiMap.set(item.kpi, {
          kpi: item.kpi,
          pilote: item.pilote || '',
          objectif: item.objectif || 95,
          source: source
        });
      }
    });

    return Array.from(kpiMap.values());
  }

  // Remove duplicate KPIs (keep the first occurrence)
  private removeDuplicateKpis(kpis: KpiInfo[]): KpiInfo[] {
    const uniqueMap = new Map<string, KpiInfo>();
    
    kpis.forEach(kpi => {
      if (!uniqueMap.has(kpi.kpi.toLowerCase())) {
        uniqueMap.set(kpi.kpi.toLowerCase(), kpi);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => a.kpi.localeCompare(b.kpi));
  }

  // Get all KPI names
  getKpiNames(): Observable<string[]> {
    return this.kpis$.pipe(
      map(kpis => kpis.map(k => k.kpi))
    );
  }

  // Get all pilotes
  getPilotes(): Observable<string[]> {
    return this.kpis$.pipe(
      map(kpis => {
        const pilotes = kpis.map(k => k.pilote).filter(Boolean);
        return Array.from(new Set(pilotes)).sort();
      })
    );
  }

  // Check if KPI exists
  kpiExists(kpiName: string): boolean {
    const currentKpis = this.kpisSubject.value;
    return currentKpis.some(k => k.kpi.toLowerCase() === kpiName.toLowerCase());
  }

  // Get KPI info by name
  getKpiInfo(kpiName: string): KpiInfo | null {
    const currentKpis = this.kpisSubject.value;
    return currentKpis.find(k => k.kpi.toLowerCase() === kpiName.toLowerCase()) || null;
  }

  // Add new KPI (this will create entries in all three services)
  async addNewKpi(kpiData: { kpi: string, pilote: string, objectif: number }): Promise<boolean> {
    if (this.kpiExists(kpiData.kpi)) {
      throw new Error('Ce KPI existe déjà');
    }

    const currentDate = new Date().toISOString().split('T')[0];

    try {
      // Create initial entries in all services
      const delaiEntry = {
        kpi: kpiData.kpi,
        pilote: kpiData.pilote,
        objectif: kpiData.objectif,
        date: currentDate,
        nombrePiecesATemps: 0,
        nombrePiecesPlanifiees: 0
      };

      const coutEntry = {
        kpi: kpiData.kpi,
        pilote: kpiData.pilote,
        objectif: kpiData.objectif,
        date: currentDate,
        heuresStandardsDeclarees: 0,
        heuresPresenceBadgees: 0
      };

      // Create entries in parallel
      await Promise.all([
        this.delaiService.create(delaiEntry).toPromise(),
        this.coutService.create(coutEntry).toPromise()
        // this.qualiteService.create(qualiteEntry).toPromise() // Add when available
      ]);

      // Reload KPIs after successful creation
      this.loadAllKpis();
      
      return true;
    } catch (error) {
      console.error('Error creating new KPI:', error);
      throw error;
    }
  }

  // Force refresh KPIs
  refreshKpis(): void {
    this.loadAllKpis();
  }

  // Get current KPIs synchronously
  getCurrentKpis(): KpiInfo[] {
    return this.kpisSubject.value;
  }
}