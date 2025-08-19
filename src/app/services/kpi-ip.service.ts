import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KPI_IP } from '../models/KPI_IP';


@Injectable({
  providedIn: 'root'
})
export class KpiIpService {
  private baseUrl = 'http://localhost:8089/kpi-ip';

  constructor(private http: HttpClient) {}

  getAll(): Observable<KPI_IP[]> {
    return this.http.get<KPI_IP[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<KPI_IP> {
    return this.http.get<KPI_IP>(`${this.baseUrl}/${id}`);
  }

  create(data: KPI_IP): Observable<KPI_IP> {
    return this.http.post<KPI_IP>(`${this.baseUrl}`, data);
  }

  update(id: number, data: KPI_IP): Observable<KPI_IP> {
    return this.http.put<KPI_IP>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getBySemaine(semaine: number): Observable<KPI_IP[]> {
    return this.http.get<KPI_IP[]>(`${this.baseUrl}/semaine/${semaine}`);
  }

  getByAnnee(annee: number): Observable<KPI_IP[]> {
    return this.http.get<KPI_IP[]>(`${this.baseUrl}/annee/${annee}`);
  }

  getByCodeIp(codeIp: string): Observable<KPI_IP[]> {
    return this.http.get<KPI_IP[]>(`${this.baseUrl}/codeip/${codeIp}`);
  }

  getByHseTag(hseTag: boolean): Observable<KPI_IP[]> {
    return this.http.get<KPI_IP[]>(`${this.baseUrl}/hsetag/${hseTag}`);
  }
  getAverageResultat(): Observable<number> {
  return this.http.get<number>('/api/kpi-ip/average');
}

}
export { KPI_IP };

