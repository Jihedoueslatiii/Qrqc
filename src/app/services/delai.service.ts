import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Delai } from '../models/Delai';

@Injectable({
  providedIn: 'root'
})
export class DelaiService {
  private baseUrl = 'http://localhost:8089/delai';  // adjust port/baseUrl accordingly

  constructor(private http: HttpClient) {}

  getAll(): Observable<Delai[]> {
    return this.http.get<Delai[]>(this.baseUrl);
  }

  getById(id: number): Observable<Delai> {
    return this.http.get<Delai>(`${this.baseUrl}/${id}`);
  }

  create(delai: Delai): Observable<Delai> {
    return this.http.post<Delai>(this.baseUrl, delai);
  }

  update(id: number, delai: Delai): Observable<Delai> {
    return this.http.put<Delai>(`${this.baseUrl}/${id}`, delai);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getByDate(date: string): Observable<Delai[]> {
    return this.http.get<Delai[]>(`${this.baseUrl}/date/${date}`);
  }

  compareResultatToObjectif(id: number): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/compare/${id}`);
  }

  getAverageResultat(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/average`);
  }
  
}
