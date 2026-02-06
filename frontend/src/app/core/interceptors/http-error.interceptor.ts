import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private log = inject(LoggingService).forContext('HttpErrorInterceptor');
  private messageService = inject(MessageService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Backend unreachable or offline
        if (error.status === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Connection Error',
            detail: 'Unable to reach the server. Please check your network or try again later.',
            sticky: true,
            closable: false,
          });
          this.log.error('Caught error: ', error);
          this.log.debug('MessageService instance:', this.messageService);
        }

        return throwError(() => error);
      }),
    );
  }
}
