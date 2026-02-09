import { Routes } from '@angular/router';
import { authRoutes } from './modules/auth/auth.routes';
import { jobRoutes } from './modules/job/job.routes';
import { HomeComponent } from './modules/home/home.component';
import { taskRoutes } from './modules/task/task.routes';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  ...authRoutes,
  ...jobRoutes,
  ...taskRoutes,
];
