import { ApplicationConfig, ErrorHandler, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { appInitializer } from './core/init/app.initializer';
import { AppTitleStrategy } from './core/services/app-title.service';
import { ErrorHandlerService } from './core/services/error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideHttpClient(withInterceptors([tokenInterceptor, httpErrorInterceptor])),
    // init app configuration and authentication on app startup, must be last
    provideAppInitializer(appInitializer),
  ],
};
