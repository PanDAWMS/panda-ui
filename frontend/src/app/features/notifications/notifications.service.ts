import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { TaskSubscription } from './notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private api = inject(ApiService);

  listSubscriptions(): Observable<TaskSubscription[]> {
    return this.api.get<TaskSubscription[]>('notifications/subscriptions');
  }

  subscribe(jeditaskid: number): Observable<TaskSubscription> {
    return this.api.post<TaskSubscription>('notifications/subscriptions', { jeditaskid });
  }

  unsubscribe(jeditaskid: number): Observable<void> {
    return this.api.delete<void>('notifications/subscriptions', jeditaskid);
  }
}
