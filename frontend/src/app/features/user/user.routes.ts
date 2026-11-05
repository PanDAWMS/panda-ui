import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { UserOverviewComponent } from './components/user-overview/user-overview.component';

export const userRoutes: Routes = [
  {
    path: 'user/:username',
    component: UserOverviewComponent,
    title: 'User',
    canActivate: [authGuard],
    data: { prerender: false, titleParam: 'username' },
  },
];
