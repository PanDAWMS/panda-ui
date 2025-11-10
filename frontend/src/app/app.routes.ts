import { Routes } from '@angular/router';
import {authRoutes} from './core/auth/auth.routes';
import {jobRoutes} from './core/job/job.routes';
import {HomeComponent} from './core/home/home.component';

export const routes: Routes = [
  {path: '', component: HomeComponent, },
  ...authRoutes,
  ...jobRoutes,
];

