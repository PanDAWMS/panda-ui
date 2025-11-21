import { Routes } from '@angular/router';
import { authRoutes } from './modules/auth/auth.routes';
import { jobRoutes } from './modules/job/job.routes';
import { HomeComponent } from './modules/home/home.component';

export const routes: Routes = [{ path: '', component: HomeComponent }, ...authRoutes, ...jobRoutes];
