import { Component, computed, inject, input, InputSignal, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TaskItemDetail } from '../../task.model';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { StatusCount } from '../../../../shared/models/status.model';
import { BreakAtPipe } from '../../../../shared/pipes/breakAt.pipe';
import { NotificationsService } from '../../../notifications/notifications.service';

@Component({
  selector: 'app-task-overview',
  imports: [CommonModule, DatePipe, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink, BreakAtPipe],
  templateUrl: './task-overview.component.html',
  styleUrl: './task-overview.component.scss',
})
export class TaskOverviewComponent implements OnInit {
  private notificationsService = inject(NotificationsService);

  task: InputSignal<TaskItemDetail> = input.required<TaskItemDetail>();
  closable: InputSignal<boolean> = input<boolean>(false);

  readonly subscribed: WritableSignal<boolean> = signal(false);

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

  ngOnInit(): void {
    const jeditaskid = this.task().jeditaskid;
    this.notificationsService.listSubscriptions().subscribe((subs) => {
      this.subscribed.set(subs.some((sub) => sub.jeditaskid === jeditaskid));
    });
  }

  toggleSubscription(): void {
    const jeditaskid = this.task().jeditaskid;
    if (this.subscribed()) {
      this.notificationsService.unsubscribe(jeditaskid).subscribe(() => this.subscribed.set(false));
    } else {
      this.notificationsService.subscribe(jeditaskid).subscribe(() => this.subscribed.set(true));
    }
  }
}
