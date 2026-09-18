import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const workflowRoutes: Routes = [
  {
    path: 'workflows',
    title: 'Workflows',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/workflow-list/workflow-list.component').then((m) => m.WorkflowListComponent),
    children: [
      {
        path: ':id',
        title: 'Workflow Details',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./components/workflow-details-panel/workflow-details-panel.component').then(
            (m) => m.WorkflowDetailsPanelComponent,
          ),
      },
    ],
  },
];
