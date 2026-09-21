import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { jobRoutes } from './features/job/job.routes';
import { HomeComponent } from './features/home/home.component';
import { taskRoutes } from './features/task/task.routes';
import { workflowRoutes } from './features/workflow/workflow.routes';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  ...authRoutes,
  ...jobRoutes,
  ...taskRoutes,
  ...workflowRoutes,
];
