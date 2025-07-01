import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cout } from '../models/Cout ';

@Injectable({
  providedIn: 'root',
})
export class CoutService {
  [x: string]: any;
  private baseUrl = 'http://localhost:8089/cout';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cout[]> {
    return this.http.get<Cout[]>(this.baseUrl);
  }

  getById(id: number): Observable<Cout> {
    return this.http.get<Cout>(`${this.baseUrl}/${id}`);
  }

  create(cout: Cout): Observable<Cout> {
    return this.http.post<Cout>(this.baseUrl, cout);
  }

  update(id: number, cout: Cout): Observable<Cout> {
    return this.http.put<Cout>(`${this.baseUrl}/${id}`, cout);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getByDate(date: string): Observable<Cout[]> {
    return this.http.get<Cout[]>(`${this.baseUrl}/date/${date}`);
  }

  compareResultatToObjectif(id: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/compare/${id}`, { responseType: 'text' });
  }

  getAverageResultat(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/average`);
  }
}
export { Cout };

