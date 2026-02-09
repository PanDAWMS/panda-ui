import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { from, take } from 'rxjs';
import { LoggingService } from '../services/logging.service';
import { MessageBufferService } from '../services/message-buffer.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const log = inject(LoggingService).forContext('authGuard');
  const messageBuffer = inject(MessageBufferService);
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
      messageBuffer.add({
        severity: 'warn',
        summary: 'Authentication Required',
        detail: `You must be logged in to access the following page: ${state.url}`,
      });
      return router.parseUrl('/');
    }),
    take(1),
  );
};
