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

  stream<T>(endpoint: string, body: unknown): Observable<T> {
    return new Observable<T>((observer) => {
      const controller = new AbortController();
      const url = `${this.apiBaseUrl}/${endpoint.replace(/^\/|\/$/g, '')}/`;

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          if (!response.body) {
            throw new Error('ReadableStream not supported or empty body');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Hold onto fragmented chunks

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (!dataStr) {
                  continue;
                }

                try {
                  const parsedEvent = JSON.parse(dataStr) as T;
                  observer.next(parsedEvent);
                } catch (err) {
                  console.error('Error parsing SSE json chunk:', line);
                }
              }
            }
          }

          observer.complete();
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            observer.error(error);
          }
        });

      // Cleanup logic: automatically cancels the fetch stream if the component unsubscribes!
      return () => controller.abort();
    });
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

  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      const v = c === 'x' ? r : (r % 4) + 8; // (r & 0x3) | 0x8 is mathematically equivalent to (r % 4) + 8
      return v.toString(16);
    });
  }
}
