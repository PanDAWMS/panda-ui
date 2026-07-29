import { ApplicationConfig, ErrorHandler, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { appInitializer } from './core/init/app.initializer';
import { AppTitleStrategy } from './core/services/app-title.service';
import { ErrorHandlerService } from './core/services/error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    // http clint and interceptors, interceptors must be provided before the http client
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    // init app configuration and authentication on app startup, must be last
    provideAppInitializer(appInitializer),
  ],
};
