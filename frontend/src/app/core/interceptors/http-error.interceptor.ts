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
        if (error.status === 0 || error.status >= 500) {
          this.messageBuffer.add({
            severity: 'error',
            summary: 'Connection Error',
            detail: 'Unable to reach the API server. Please try later :( ',
            sticky: true,
            closable: false,
          });
          this.log.error('Caught error: ', error);
        }

        return throwError(() => error);
      }),
    );
  }
}
