import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { WorkflowItem, WorkflowDetail, WorkflowQueryParams } from './workflow.model';
import { PaginatedResponse } from '../../shared/models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private api = inject(ApiService);
  private readonly endpoint = 'workflow';

  getWorkflows(params?: WorkflowQueryParams): Observable<PaginatedResponse<WorkflowItem>> {
    return this.api.get<PaginatedResponse<WorkflowItem>>(`${this.endpoint}/list`, params);
  }

  getWorkflowById(id: number | string): Observable<WorkflowDetail> {
    return this.api.get<WorkflowDetail>(`${this.endpoint}/${id}`);
  }
}
