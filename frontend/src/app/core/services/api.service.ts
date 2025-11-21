// src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
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

  constructor() {}

  // Generic GET
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const key of Object.keys(params)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/`, { params: httpParams }).pipe(catchError(this.handleError));
  }

  // Generic POST
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}/`, data).pipe(catchError(this.handleError));
  }

  // Generic PUT
  put<T>(endpoint: string, id: number | string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}/`, data).pipe(catchError(this.handleError));
  }

  // Generic PATCH
  patch<T>(endpoint: string, id: number | string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}/${id}/`, data).pipe(catchError(this.handleError));
  }

  // Generic DELETE
  delete<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}/${id}/`).pipe(catchError(this.handleError));
  }

  // Common error handler
  private handleError(error: HttpErrorResponse) {
    console.error('API error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
