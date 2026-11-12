import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { NotificationsListComponent } from './components/notifications-list/notifications-list.component';

export const notificationRoutes: Routes = [
  {
    path: 'notifications',
    component: NotificationsListComponent,
    title: 'Notifications',
    canActivate: [authGuard],
  },
];
