// src/app/core/services/api.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // generic GET
  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
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
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/`, { params: httpParams }).pipe(catchError(this.handleError));
  }

  // generic POST
  post<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}/`, data).pipe(catchError(this.handleError));
  }

  // generic PUT
  put<T>(endpoint: string, id: number | string, data: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}/`, data).pipe(catchError(this.handleError));
  }

  // generic PATCH
  patch<T>(endpoint: string, id: number | string, data: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}/${id}/`, data).pipe(catchError(this.handleError));
  }

  // generic DELETE
  delete<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}/${id}/`).pipe(catchError(this.handleError));
  }

  // common error handler
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
