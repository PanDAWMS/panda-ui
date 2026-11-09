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
import { NotificationsService } from '../../notifications.service';
import { TaskSubscription } from '../../notification.model';

@Component({
  selector: 'app-notifications-list',
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.scss',
})
export class NotificationsListComponent {
  private notificationsService = inject(NotificationsService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly subscriptions: Signal<TaskSubscription[] | null> = toSignal(
    this.refresh$.pipe(switchMap(() => this.notificationsService.listSubscriptions())),
    { initialValue: null },
  );

  readonly displayedColumns = ['jeditaskid', 'created_at', 'actions'];

  unsubscribe(jeditaskid: number): void {
    this.notificationsService.unsubscribe(jeditaskid).subscribe(() => this.refresh$.next());
  }
}
