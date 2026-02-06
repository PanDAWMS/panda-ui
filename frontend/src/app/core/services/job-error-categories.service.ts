import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { JobErrorCategory } from '../models/job-error-category.model';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class JobErrorCategoriesService {
  private categories?: JobErrorCategory[];
  private apiService = inject(ApiService);
  private log = inject(LoggingService).forContext('JobErrorCategoriesService');
  private palette = [
    '#57534e',
    '#475569',
    '#059669',
    '#dc2626',
    '#16a34a',
    '#7c3aed',
    '#57534e',
    '#ea580c',
    '#65a30d',
    '#d97706',
    '#db2777',
    '#0d9488',
    '#ca8a04',
    '#0891b2',
    '#0284c7',
    '#2563eb',
    '#4f46e5',
    '#9333ea',
    '#c026d3',
    '#e11d48',
  ];

  getJobErrorCategories(): Observable<JobErrorCategory[]> {
    if (this.categories) {
      return of(this.categories);
    }
    return this.apiService.get<JobErrorCategory[]>('job/error-categories').pipe(
      tap((data) => {
        this.categories = data;
        // Assign colors
        this.categories.forEach((category, index) => {
          category.color = this.palette[index];
        });
        this.log.debug('[JobErrorCategoriesService] Fetched job error categories');
      }),
    );
  }
}
