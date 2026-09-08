import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { EMPTY, Observable, throwError } from 'rxjs';
import { LoggingService } from '../services/logging.service';
import { MessageBufferService } from '../services/message-buffer.service';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const log = inject(LoggingService).forContext('HttpErrorInterceptor');
  const messageBuffer = inject(MessageBufferService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Backend unreachable or offline
      if (error.status === 0) {
        messageBuffer.add('Connection Error: unable to reach the API server. Please try later :(', '', {
          duration: 0,
          panelClass: ['snackbar-error'],
        });
        log.error('Caught error: ', error);
      } else if (error.status === 500) {
        messageBuffer.add(
          'Something went wrong on our end. Please try refreshing or try again in a few minutes. ',
          'Close',
          {
            duration: 0,
            panelClass: ['snackbar-warning'],
          },
        );
        log.error('Caught error: ', error);
      } else if (error.status === 501) {
        messageBuffer.add('Not implemented yet :(', 'Close', {
          duration: 0,
          panelClass: ['snackbar-warning'],
        });
        log.warn('Caught error: Feature not implemented: ', req.url);
      } else if (error.status === 401) {
        log.warn('Unauthorized request:', req.url);
        if (req.url.includes('/oauth/')) {
          return throwError(() => error);
        }
      } else if (error.status === 403) {
        messageBuffer.add('Forbidden: You do not have the necessary permissions for this action.', 'Close', {
          duration: 5000,
          panelClass: ['snackbar-error'],
        });
        log.warn('Access forbidden to:', req.url);
      } else {
        log.error('Unknown error', req.url, error);
        // propagate it further to general error handler
        return throwError(() => new Error(error.message || 'An unexpected server error occurred.'));
      }
      return EMPTY;
    }),
  );
};
