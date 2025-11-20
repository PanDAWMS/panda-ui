import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { providePrimeNG} from 'primeng/config';
import { FilterMatchMode } from 'primeng/api';
import { routes } from './app.routes';
import { TokenInterceptor} from './core/interceptors/token.interceptor';
import { IndexPreset }  from './core/theme/index.preset';
import { authInitializer} from './core/init/auth.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNoopAnimations(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: IndexPreset,
        options: {
          darkModeSelector: false,
          colorScheme: 'light',
          prefix: 'pui',
          componentDefaults: {
            size: 'small'
          }
        }
      },
      filterMatchModeOptions: {
        text: [FilterMatchMode.CONTAINS, FilterMatchMode.NOT_CONTAINS],
        numeric: [FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS, FilterMatchMode.LESS_THAN, FilterMatchMode.GREATER_THAN],
        date: [FilterMatchMode.DATE_IS, FilterMatchMode.DATE_BEFORE, FilterMatchMode.DATE_AFTER]
      }
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    provideAppInitializer(authInitializer),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
  ],

};
