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
        path: 'panel/:id',
        title: 'Workflow Details',
        data: { closable: true },
        canActivate: [authGuard],
        loadComponent: () =>
          import('./components/workflow-details-panel/workflow-details-panel.component').then(
            (m) => m.WorkflowDetailsPanelComponent,
          ),
      },
    ],
  },
  {
    path: 'workflow/:id',
    title: 'Workflow Overview',
    loadComponent: () =>
      import('./components/workflow-overview/workflow-overview.component').then((m) => m.WorkflowOverviewComponent),
  },
];
