import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { appEnabledGuard } from '../../core/guards/app-enabled.guard';
import { NotificationListComponent } from './components/notification-list/notification-list.component';

export const notificationRoutes: Routes = [
  {
    path: 'notifications',
    component: NotificationListComponent,
    title: 'Notifications',
    canActivate: [authGuard, appEnabledGuard('notification')],
  },
];
