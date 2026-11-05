import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { TaskOverviewComponent } from './components/task-overview/task-overview.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskComponent } from './components/task/task.component';

export const taskRoutes: Routes = [
  {
    path: 'task/:id',
    component: TaskComponent,
    title: 'Task',
    canActivate: [authGuard],
    data: { prerender: false, titleParam: 'jeditaskid' },
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/task-list/task-list.component').then((m) => m.TaskListComponent),
    title: 'Tasks',
    canActivate: [authGuard],
    data: { prerender: false, titleParam: 'tasks' },
    children: [
      {
        path: 'panel/:id',
        title: 'Task Details',
        data: { closable: true },
        canActivate: [authGuard],
        loadComponent: () =>
          import('./components/task-details-panel/task-details-panel.component').then(
            (m) => m.TaskDetailsPanelComponent,
          ),
      },
    ],
  },
];
