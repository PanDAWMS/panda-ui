import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';

export const workflowRoutes: Routes = [
  {
    path: 'workflows',
    component: WorkflowListComponent,
    title: 'Workflows',
    canActivate: [authGuard],
  },
];
