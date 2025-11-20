import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token :string|null = null;
    const cloned = req.clone({
      withCredentials: true,
    });
    if (token) {
      cloned.headers.set('Authorization', `Token ${token}`);
    }
    console.debug("Request: ", cloned);
    return next.handle(cloned);
  }
}
