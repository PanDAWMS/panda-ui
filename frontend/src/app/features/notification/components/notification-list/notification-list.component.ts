import { Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../notification.service';
import { TaskSubscription } from '../../notification.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-notification-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    BadgeComponent,
  ],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent {
  private notificationService = inject(NotificationService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly subscriptions: Signal<TaskSubscription[] | null> = toSignal(
    this.refresh$.pipe(switchMap(() => this.notificationService.listSubscriptions())),
    { initialValue: null },
  );

  readonly displayedColumns = ['jeditaskid', 'task_status', 'created_at', 'actions'];

  unsubscribe(jeditaskid: number): void {
    this.notificationService.unsubscribe(jeditaskid).subscribe(() => this.refresh$.next());
  }
}
