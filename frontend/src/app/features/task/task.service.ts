import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { TaskItem, TaskItemDetail, TaskQueryParams } from './task.model';
import { PaginatedResponse } from '../../shared/models/pagination.model';
import { DatasetItem } from '../dataset/dataset.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private api = inject(ApiService);
  private readonly endpoint = 'task';

  getTask(jeditaskid: number): Observable<TaskItemDetail> {
    return this.api.get<TaskItemDetail>(`${this.endpoint}/` + jeditaskid);
  }

  getTasks(params?: TaskQueryParams): Observable<PaginatedResponse<TaskItem>> {
    return this.api.get<PaginatedResponse<TaskItem>>(`${this.endpoint}/list`, params);
  }

  getTaskDatasets(jeditaskid: number): Observable<DatasetItem[]> {
    return this.api.get<DatasetItem[]>(`${this.endpoint}/datasets`, { jeditaskid: jeditaskid });
  }
}
