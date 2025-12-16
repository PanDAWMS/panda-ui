import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // get the latest token value once for this request
    return this.authService.token$.pipe(
      take(1),
      switchMap((token) => {
        // clone the request and add headers if token exists
        const headers = token ? req.headers.set('Authorization', `Token ${token}`) : req.headers;
        const cloned = req.clone({
          headers,
          withCredentials: true,
        });
        console.debug('[TokenInterceptor] Token: ', token ? 'ok' : 'null');
        return next.handle(cloned);
      }),
    );
  }
}
