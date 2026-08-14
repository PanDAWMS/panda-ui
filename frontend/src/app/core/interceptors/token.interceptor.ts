import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoggingService } from '../services/logging.service';

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const log = inject(LoggingService).forContext('TokenInterceptor');

  return authService.token$.pipe(
    take(1),
    switchMap((token) => {
      // clone the request and add headers if token exists
      const headers = token ? req.headers.set('Authorization', `Token ${token}`) : req.headers;
      const cloned = req.clone({
        headers,
        withCredentials: true,
      });

      log.debug('Token: ', token ? 'ok' : 'null');
      return next(cloned);
    }),
  );
};
