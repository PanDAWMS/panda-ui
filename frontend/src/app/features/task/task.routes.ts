import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { TaskOverviewComponent } from './components/task-overview/task-overview.component';

export const taskRoutes: Routes = [
  {
    path: 'task/:jeditaskid',
    component: TaskOverviewComponent,
    title: 'Task',
    canActivate: [authGuard],
    data: { prerender: false, titleParam: 'jeditaskid' },
  },
];
