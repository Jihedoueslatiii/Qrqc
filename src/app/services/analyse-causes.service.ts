import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyseCauses } from '../models/AnalyseCauses';



@Injectable({
  providedIn: 'root'
})
export class AnalyseCausesService {
  private baseUrl = 'http://localhost:8089/analyse-causes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AnalyseCauses[]> {
    return this.http.get<AnalyseCauses[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<AnalyseCauses> {
    return this.http.get<AnalyseCauses>(`${this.baseUrl}/${id}`);
  }

  create(analyse: AnalyseCauses): Observable<AnalyseCauses> {
    return this.http.post<AnalyseCauses>(this.baseUrl, analyse);
  }

  update(id: number, analyse: AnalyseCauses): Observable<AnalyseCauses> {
    return this.http.put<AnalyseCauses>(`${this.baseUrl}/${id}`, analyse);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getBySemaine(semaine: number): Observable<AnalyseCauses[]> {
    return this.http.get<AnalyseCauses[]>(`${this.baseUrl}/semaine/${semaine}`);
  }

  getByIndicateur(indicateur: string): Observable<AnalyseCauses[]> {
    return this.http.get<AnalyseCauses[]>(`${this.baseUrl}/indicateur/${indicateur}`);
  }
}
export { AnalyseCauses };

