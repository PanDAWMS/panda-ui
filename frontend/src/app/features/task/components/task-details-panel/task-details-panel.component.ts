import { Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { TaskService } from '../../task.service';
import { TaskItemDetail } from '../../task.model';
import { TaskParamsListComponent } from '../task-params-list/task-params-list.component';
import { LoggingService } from '../../../../core/services/logging.service';
import { DocsService } from '../../../aide/components/docs/docs.service';
import { TaskOverviewComponent } from '../task-overview/task-overview.component';
import { DatasetItem } from '../../../dataset/dataset.model';
import { DatasetSummaryComponent } from '../../../dataset/components/dataset-summary/dataset-summary.component';

@Component({
  selector: 'app-task-details-panel',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TaskOverviewComponent,
    DatasetSummaryComponent,
  ],
  templateUrl: './task-details-panel.component.html',
  styleUrl: './task-details-panel.component.scss',
})
export class TaskDetailsPanelComponent {
  private log = inject(LoggingService);
  private docsService = new DocsService();
  private taskService = inject(TaskService);
  private router = inject(Router);

  // receives path parameter :id automatically from router
  id: InputSignal<string> = input.required<string>();
  closable: InputSignal<boolean> = input<boolean>(true);
  close: OutputEmitterRef<void> = output<void>();

  // fetch data automatically whenever the ID in the URL changes
  effectiveId = computed(() => Number(this.id()) || null);
  taskResource = rxResource<TaskItemDetail | null, { id: number | null }>({
    params: () => ({ id: this.effectiveId() }),
    stream: ({ params }): Observable<TaskItemDetail | null> => {
      if (params.id == null) return of(null);
      return this.taskService.getTask(params.id);
    },
  });
  isTaskLoading: Signal<boolean> = computed(() => this.taskResource.isLoading());
  taskLoadingError = computed(() => this.taskResource.error() as Error | undefined);
  taskDetails = computed(() => this.taskResource.value() ?? null);

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

  onClose(): void {
    this.close.emit();
    this.router.navigate(['/tasks']);
  }

  ngOnDestroy(): void {
    // Clear context when leaving the route
    this.docsService.setPageContext(null);
  }
}
