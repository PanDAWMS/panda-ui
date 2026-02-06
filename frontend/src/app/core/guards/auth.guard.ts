import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { from, take } from 'rxjs';
import { MessageService } from 'primeng/api';
import { LoggingService } from '../services/logging.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const log = inject(LoggingService).forContext('authGuard');
  const messageService = inject(MessageService);
  if (typeof window === 'undefined') {
    log.debug('Running on server, returning true to allow SSR rendering, it will be re-checked on client.');
    return true;
  }
  log.debug('Checking authentication for route:', state.url);
  return from(authService.init()).pipe(
    map((user) => {
      const isAuthenticated = !!user;
      if (isAuthenticated) {
        log.debug('User is authenticated, access granted.');
        return true;
      }
      if (state.url === '/') {
        log.debug('User is not authenticated but accessing home page, access granted.');
        return true;
      }

      log.debug('User is not authenticated, redirecting to home page.');
      setTimeout(() => {
        messageService.add({
          severity: 'warn',
          summary: 'Authentication Required',
          detail: `You must be logged in to access the following page: ${state.url}`,
        });
      }, 0);
      return router.parseUrl('/');
    }),
    take(1),
  );
};
