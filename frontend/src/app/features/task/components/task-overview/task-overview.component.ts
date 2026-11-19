import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskItemDetail } from '../../task.model';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { StatusCount } from '../../../../shared/models/status.model';
import { BreakAtPipe } from '../../../../shared/pipes/breakAt.pipe';
import { NotificationSubscribeToggleComponent } from '../../../notification/components/notification-subscribe-toggle/notification-subscribe-toggle.component';

@Component({
  selector: 'app-task-overview',
  imports: [CommonModule, DatePipe, RouterLink, BreakAtPipe, NotificationSubscribeToggleComponent],
  templateUrl: './task-overview.component.html',
  styleUrl: './task-overview.component.scss',
})
export class TaskOverviewComponent {
  task: InputSignal<TaskItemDetail> = input.required<TaskItemDetail>();
  closable: InputSignal<boolean> = input<boolean>(false);

  fileSummary: Signal<StatusCount[]> = computed((): StatusCount[] => {
    const d: TaskItemDetail = this.task();
    if (!d || d.files_total === 0) return [];

    return [
      {
        status: 'pending',
        count: (d.files_total ?? 0) - (d.files_failed ?? 0) - (d.files_finished ?? 0),
      },
      { status: 'finished', count: d.files_finished || 0 },
      { status: 'failed', count: d.files_failed || 0 },
      { status: 'missing', count: d.files_missing || 0 },
    ];
  });
}
