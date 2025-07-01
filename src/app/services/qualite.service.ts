import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Qualite } from "../models/Qaulite";
import { catchError, Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class QualiteService {
  private apiUrl = 'http://localhost:8089/qualite'; // adjust your backend URL

  constructor(private http: HttpClient) {}

  getAll(): Observable<Qualite[]> {
    return this.http.get<Qualite[]>(this.apiUrl);
  }

  getById(id: number): Observable<Qualite> {
    return this.http.get<Qualite>(`${this.apiUrl}/${id}`);
  }

  create(qualite: Qualite): Observable<Qualite> {
    return this.http.post<Qualite>(this.apiUrl, qualite);
  }

  update(id: number, qualite: Qualite): Observable<Qualite> {
    return this.http.put<Qualite>(`${this.apiUrl}/${id}`, qualite);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByDate(date: string): Observable<Qualite[]> {
    return this.http.get<Qualite[]>(`${this.apiUrl}/date/${date}`);
  }

  compareResultatToObjectif(id: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/compare/${id}`);
  }

  getAverageResultat(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/average`);
  }

  getAverageResultatById(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/average/${id}`);
  }

  getAverageResultatByPiloteAndKPI(pilote: string, kpi: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/average/${pilote}/${kpi}`);
  }
  // In qualite.service.ts

}


export { Qualite };
