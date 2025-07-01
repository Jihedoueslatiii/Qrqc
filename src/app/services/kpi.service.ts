import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KpiService {
  private _kpis = new BehaviorSubject<string[]>([]);

  getKpis(allKpis?: string[]): Observable<string[]> {
    return this._kpis.asObservable();
  }

  setKpis(kpis: string[]) {
    this._kpis.next(kpis);
  }

  addKpi(newKpi: string) {
    const current = this._kpis.value;
    if (!current.includes(newKpi)) {
      this._kpis.next([...current, newKpi]);
    }
  }
}
