import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { LoggingService } from '../services/logging.service';
import { MessageBufferService } from '../services/message-buffer.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private log = inject(LoggingService).forContext('HttpErrorInterceptor');
  private messageBuffer = inject(MessageBufferService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Backend unreachable or offline
        if (error.status === 0) {
          this.messageBuffer.add('Connection Error: unable to reach the API server. Please try later :(', '', {
            duration: 0,
            panelClass: ['snackbar-error'],
          });
          this.log.error('Caught error: ', error);
        } else if (error.status === 500) {
          this.messageBuffer.add(
            'Something went wrong on our end. Please try refreshing or try again in a few minutes. ',
            '',
            {
              duration: 0,
              panelClass: ['snackbar-warning'],
            },
          );
          this.log.error('Caught error: ', error);
        } else if (error.status === 501) {
          this.messageBuffer.add('Not implemented yet :(', 'Close', {
            duration: 0,
            panelClass: ['snackbar-warning'],
          });
          this.log.warn('Caught error: Feature not implemented: ', req.url);
        } else if (error.status === 401) {
          this.log.warn('Unauthorized request:', req.url);
        }
        // Permission Errors (403)
        else if (error.status === 403) {
          this.messageBuffer.add('Forbidden: You do not have the necessary permissions for this action.', 'Close', {
            duration: 5000,
            panelClass: ['snackbar-error'],
          });
          this.log.warn('Access forbidden to:', req.url);
        } else {
          this.log.error('Unknown error', req.url, error);
        }
        const errorMessage = error.message || 'An unexpected server error occurred.';
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}
