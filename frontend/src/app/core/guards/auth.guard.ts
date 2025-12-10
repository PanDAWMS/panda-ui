import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { take } from 'rxjs';
import { MessageService } from 'primeng/api';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }
      if (state.url === '/') {
        return true;
      }

      console.debug('[AuthGuard] User is not authenticated, redirecting to home page.');
      setTimeout(() => {
        messageService.add({
          severity: 'warn',
          summary: 'Authentication Required',
          detail: 'You must be logged in to access this page.',
        });
      }, 0);
      return router.parseUrl('/');
    }),
  );
};
