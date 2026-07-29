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
        if (error.status === 0 || error.status === 500) {
          this.messageBuffer.add('Connection Error: Unable to reach the API server. Please try later :(', '', {
            duration: 0,
            panelClass: ['snackbar-error'],
          });
          this.log.error('Caught error: ', error);
        } else if (error.status === 501) {
          this.messageBuffer.add('Not implemented yet :(', 'Close', {
            duration: 0,
            panelClass: ['snackbar-warning'],
          });
          this.log.warn('Caught error: ', error);
        }

        // Permission Errors (403)
        if (error.status === 403) {
          this.messageBuffer.add('Forbidden: You do not have the necessary permissions for this action.', 'Close', {
            duration: 5000, // Explicitly sets the auto-dismiss time to 5 seconds (life: 5000)
            panelClass: ['snackbar-error'],
          });
          this.log.warn('Access forbidden to:', req.url);
        }

        return throwError(() => error);
      }),
    );
  }
}
