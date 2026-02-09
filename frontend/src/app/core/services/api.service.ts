import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private log = inject(LoggingService).forContext('ApiService');
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
    return this.http
      .get<T>(`${this.apiBaseUrl}/${endpoint}/`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // generic POST
  post<T>(endpoint: string, data: unknown, params?: Record<string, unknown>): Observable<T> {
    const httpParams = this.makeParams(params || {});
    return this.http
      .post<T>(`${this.apiBaseUrl}/${endpoint}/`, data, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // generic PUT
  put<T>(endpoint: string, id: number | bigint | string, data: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiBaseUrl}/${endpoint}/${id}/`, data).pipe(catchError(this.handleError));
  }

  // generic PATCH
  patch<T>(endpoint: string, id: number | bigint | string, data: unknown): Observable<T> {
    return this.http.patch<T>(`${this.apiBaseUrl}/${endpoint}/${id}/`, data).pipe(catchError(this.handleError));
  }

  // generic DELETE
  delete<T>(endpoint: string, id: number | bigint | string): Observable<T> {
    return this.http.delete<T>(`${this.apiBaseUrl}/${endpoint}/${id}/`).pipe(catchError(this.handleError));
  }

  // common error handler
  private handleError(error: HttpErrorResponse): Observable<never> {
    this.log.debug('Handling error:', error, 'type', error.type);
    if (error.status === 0) {
      // Network or CORS error
      this.log.error('Network error:', error);
    } else if (error.status === 401) {
      // Authentication error
      this.log.warn('Unauthorized request:', error.url);
    } else {
      this.log.error('API error:', error);
    }
    return throwError(() => new Error(error.message || 'Server error'));
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
