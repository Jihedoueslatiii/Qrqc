// anomaly.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KpiData {
  qualite: number;
  delai: number;
  cout: number;
}

export interface PredictionResponse {
  predictions: number[];
}

@Injectable({
  providedIn: 'root'
})
export class AnomalyService {
  private apiUrl = 'http://127.0.0.1:8000/predict'; // FastAPI endpoint

  constructor(private http: HttpClient) { }

  predictAnomalies(data: KpiData[]): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(this.apiUrl, data);
  }
}
