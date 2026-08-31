import { Routes } from '@angular/router';
import { JobErrorDescriptionListComponent } from './components/job-error-description-list/job-error-description-list.component';
import { authGuard } from '../../core/guards/auth.guard';
import { JobOverviewComponent } from './components/job-overview/job-overview.component';

export const jobRoutes: Routes = [
  {
    path: 'job-error-descriptions',
    component: JobErrorDescriptionListComponent,
    title: 'Job error descriptions',
    canActivate: [authGuard],
  },
  {
    path: 'job/:pandaid',
    component: JobOverviewComponent,
    title: 'Job',
    canActivate: [authGuard],
    data: { prerender: false, titleParam: 'pandaid' },
  },
];
