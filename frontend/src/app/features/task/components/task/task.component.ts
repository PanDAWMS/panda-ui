import { Component, computed, inject, input, InputSignal } from '@angular/core';
import { TaskParamsListComponent } from '../task-params-list/task-params-list.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { TaskItemDetail } from '../../task.model';
import { Observable, of } from 'rxjs';
import { TaskService } from '../../task.service';
import { DOCS_TASK } from '../../task.docs';
import { DocsService } from '../../../aide/components/docs/docs.service';
import { TaskOverviewComponent } from '../task-overview/task-overview.component';
import { DatasetItem } from '../../../dataset/dataset.model';
import { DatasetSummaryComponent } from '../../../dataset/components/dataset-summary/dataset-summary.component';
import { DatasetListComponent } from '../../../dataset/components/dataset-list/dataset-list.component';

@Component({
  selector: 'app-task',
  imports: [TaskOverviewComponent, TaskParamsListComponent, DatasetSummaryComponent, DatasetListComponent],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
})
export class TaskComponent {
  id: InputSignal<string> = input.required<string>();
  private taskService = inject(TaskService);
  private docsService = inject(DocsService);

  // fetch data automatically whenever the ID in the URL changes
  effectiveId = computed(() => Number(this.id()) || null);
  detailsResource = rxResource<TaskItemDetail | null, { id: number | null }>({
    params: () => ({ id: this.effectiveId() }),
    stream: ({ params }): Observable<TaskItemDetail | null> => {
      if (params.id == null) return of(null);
      return this.taskService.getTask(params.id);
    },
  });
  taskDetails = computed(() => this.detailsResource.value() ?? null);
  isInputContainer = computed(() => {
    const params = this.taskDetails()?.params_json;
    return params != null && 'dsForIN' in params;
  });

  // Fetch datasets whenever the task ID changes
  datasetsResource = rxResource<DatasetItem[], { id: number | null }>({
    params: () => ({ id: this.effectiveId() }),
    stream: ({ params }): Observable<DatasetItem[]> => {
      if (params.id == null) return of([]);
      return this.taskService.getTaskDatasets(params.id);
    },
  });
  datasets = computed(() => this.datasetsResource.value() ?? []);
  isDatasetsLoading = computed(() => this.datasetsResource.isLoading());
  datasetsLoadingError = computed(() => this.datasetsResource.error() as Error | undefined);

  ngOnInit(): void {
    this.docsService.setPageContext(DOCS_TASK);
  }
}
