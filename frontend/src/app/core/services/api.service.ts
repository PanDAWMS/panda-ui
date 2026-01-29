import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  // generic GET
  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
    const httpParams = this.makeParams(params || {});
    return this.http.get<T>(`${this.apiUrl}/${endpoint}/`, { params: httpParams }).pipe(catchError(this.handleError));
  }

  // generic POST
  post<T>(endpoint: string, data: unknown, params?: Record<string, unknown>): Observable<T> {
    const httpParams = this.makeParams(params || {});
    return this.http
      .post<T>(`${this.apiUrl}/${endpoint}/`, data, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // generic PUT
  put<T>(endpoint: string, id: number | bigint | string, data: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}/${id}/`, data).pipe(catchError(this.handleError));
  }

  // generic PATCH
  patch<T>(endpoint: string, id: number | bigint | string, data: unknown): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}/${id}/`, data).pipe(catchError(this.handleError));
  }

  // generic DELETE
  delete<T>(endpoint: string, id: number | bigint | string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}/${id}/`).pipe(catchError(this.handleError));
  }

  // common error handler
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.debug('[ApiService] Handling error:', error, 'type', error.type);
    if (error.status === 0) {
      // Network or CORS error
      console.error('Network error:', error);
    } else if (error.status === 401) {
      // Authentication error
      console.warn('Unauthorized request:', error.url);
    } else {
      console.error('API error:', error);
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
