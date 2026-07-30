import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);

  private apiUrl?: string;
  private get apiBaseUrl(): string {
    if (!this.apiUrl) {
      this.apiUrl = this.config.apiUrl;
    }
    return this.apiUrl;
  }

  // generic GET
  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
    const httpParams = this.makeParams(params || {});
    return this.http.get<T>(`${this.apiBaseUrl}/${endpoint}/`, { params: httpParams });
  }

  // generic POST
  post<T>(endpoint: string, data: unknown, params?: Record<string, unknown>): Observable<T> {
    const httpParams = this.makeParams(params || {});
    return this.http.post<T>(`${this.apiBaseUrl}/${endpoint}/`, data, { params: httpParams });
  }

  // generic PUT
  put<T>(endpoint: string, id: number | bigint | string, data: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiBaseUrl}/${endpoint}/${id}/`, data);
  }

  // generic PATCH
  patch<T>(endpoint: string, id: number | bigint | string, data: unknown): Observable<T> {
    return this.http.patch<T>(`${this.apiBaseUrl}/${endpoint}/${id}/`, data);
  }

  // generic DELETE
  delete<T>(endpoint: string, id: number | bigint | string): Observable<T> {
    return this.http.delete<T>(`${this.apiBaseUrl}/${endpoint}/${id}/`);
  }

  makeParams(params: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      for (const key of Object.keys(params)) {
        // convert unknown to string safely
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return httpParams;
  }
}
