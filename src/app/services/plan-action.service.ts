import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanAction } from '../models/PlanAction'; // Adjust the path as necessary

@Injectable({
  providedIn: 'root'
})
export class PlanActionService {
  private apiUrl = 'http://localhost:8089/plan-actions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PlanAction[]> {
    return this.http.get<PlanAction[]>(this.apiUrl);
  }

  getById(id: number): Observable<PlanAction> {
    return this.http.get<PlanAction>(`${this.apiUrl}/${id}`);
  }

  create(planAction: PlanAction): Observable<PlanAction> {
    return this.http.post<PlanAction>(this.apiUrl, planAction);
  }

  update(id: number, planAction: PlanAction): Observable<PlanAction> {
    return this.http.put<PlanAction>(`${this.apiUrl}/${id}`, planAction);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
