import { Component, inject, input, output, computed, Signal, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, of } from 'rxjs';
import { WorkflowDetail, WorkflowItem } from '../../workflow.model';
import { WorkflowService } from '../../workflow.service';
import { WorkflowGraphComponent } from '../workflow-graph/workflow-graph.component';
import { OptionObject } from '../../../../shared/models/option.model';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { StatusCount } from '../../../../shared/models/status.model';

@Component({
  selector: 'app-workflow-details-panel',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    WorkflowGraphComponent,
    ProgressBarSegmentedComponent,
  ],
  templateUrl: './workflow-details-panel.component.html',
  styleUrl: './workflow-details-panel.component.scss',
})
export class WorkflowDetailsPanelComponent {
  private workflowService = inject(WorkflowService);
  workflow: InputSignal<WorkflowItem> = input.required<WorkflowItem>();
  close: OutputEmitterRef<void> = output<void>();

  // Automatically re-fetches whenever workflow ID changes
  detailsResource = rxResource<WorkflowDetail | null, { id: number | null }>({
    params: () => ({
      id: this.workflow()?.workflow_id ?? null,
    }),

    stream: ({ params }): Observable<WorkflowDetail | null> => {
      const id = params.id;

      if (id == null) {
        return of(null);
      }

      return this.workflowService.getWorkflowById(id);
    },
  });

  // Convenience getters for template
  isLoading: Signal<boolean> = computed((): boolean => this.detailsResource.isLoading());
  error = computed(() => this.detailsResource.error() as Error | undefined);
  details = computed(() => this.detailsResource.value());
  stepSummary: Signal<StatusCount[]> = computed((): StatusCount[] => {
    const d: WorkflowItem | null = this.workflow();
    if (!d) return [];
    return [
      { status: 'pending', count: d.pending_steps },
      { status: 'active', count: d.active_steps },
      { status: 'done', count: d.completed_steps },
      { status: 'failed', count: d.failed_steps },
    ];
  });

  fileSummary: Signal<StatusCount[]> = computed((): StatusCount[] => {
    const d = this.details()?.file_summary;
    return [
      {
        status: 'pending',
        count:
          (d?.files_total ?? 0) -
          (d?.files_failed ?? 0) -
          (d?.files_finished ?? 0) -
          (d?.files_missing ?? 0) -
          (d?.files_waiting ?? 0),
      },
      { status: 'finished', count: d?.files_finished || 0 },
      { status: 'failed', count: d?.files_failed || 0 },
      { status: 'missing', count: d?.files_missing || 0 },
      { status: 'waiting', count: d?.files_waiting || 0 },
    ];
  });
}
