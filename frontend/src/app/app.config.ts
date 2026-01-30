import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { FilterMatchMode, MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { IndexPreset } from './core/theme/index.preset';
import { appInitializer } from './core/init/app.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      ripple: true,
      theme: {
        preset: IndexPreset,
        options: {
          darkModeSelector: false,
          colorScheme: 'light',
          prefix: 'pui',
          componentDefaults: {
            size: 'small',
          },
        },
      },
      filterMatchModeOptions: {
        text: [FilterMatchMode.CONTAINS, FilterMatchMode.NOT_CONTAINS],
        numeric: [
          FilterMatchMode.EQUALS,
          FilterMatchMode.NOT_EQUALS,
          FilterMatchMode.LESS_THAN,
          FilterMatchMode.GREATER_THAN,
        ],
        date: [FilterMatchMode.DATE_IS, FilterMatchMode.DATE_BEFORE, FilterMatchMode.DATE_AFTER],
      },
    }),
    MessageService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // http clint and interceptors, interceptors must be provided before the http client
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    // init app configuration and authentication on app startup, must be last
    provideAppInitializer(appInitializer),
  ],
};
