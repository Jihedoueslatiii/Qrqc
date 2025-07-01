// src/app/services/otd.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OTD {
  id?: number;
  semaine: string;
  realises: number;
  backlog: number;
  tauxRealisation?: number;
  objectif?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OtdService {
  private apiUrl = 'http://localhost:8089/livrables';

  constructor(private http: HttpClient) {}

  getAll(): Observable<OTD[]> {
    return this.http.get<OTD[]>(this.apiUrl);
  }

  getOne(id: number): Observable<OTD> {
    return this.http.get<OTD>(`${this.apiUrl}/${id}`);
  }

  create(otd: OTD): Observable<OTD> {
    return this.http.post<OTD>(this.apiUrl, otd);
  }

  update(id: number, otd: OTD): Observable<OTD> {
    return this.http.put<OTD>(`${this.apiUrl}/${id}`, otd);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getObjectif(): Observable<string> {
    return this.http.get(`${this.apiUrl}/objectif`, { responseType: 'text' });
  }
}
