import { Routes } from '@angular/router';
import { JobErrorDescriptionListComponent } from './components/job-error-description-list/job-error-description-list.component';
import { authGuard } from '../../core/guards/auth.guard';

export const jobRoutes: Routes = [
  { path: 'job-error-descriptions', component: JobErrorDescriptionListComponent, canActivate: [authGuard] },
];
