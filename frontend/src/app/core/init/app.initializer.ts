// App initializer loads config json with backend API URL,
// and checks if a user already has authenticated and has an active session

import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../services/app-config.service';
import { AuthService } from '../services/auth.service';
import { UserProfile } from '../models/user.model';
import { AppConfig } from '../models/app-config.model';
import { environment } from '../../../environments/environment';

let initialized = false;

export function appInitializer(): Promise<UserProfile | null> {
  const http = inject(HttpClient);
  const configService = inject(AppConfigService);
  const auth = inject(AuthService);
  const id = Math.random().toString(36).slice(2);

  if (initialized) {
    console.debug(`[AppInitializer:${id}] Already initialized, skipping`);
    return Promise.resolve(auth['userSubject'].value);
  }
  initialized = true;
  console.debug(`[AppInitializer:${id}] Starting initialization`);

  // prod: load runtime config from ConfigMap-mounted JSON
  const configLoad = environment.production
    ? firstValueFrom(http.get<Partial<AppConfig>>('/assets/app-config.json'))
        .then((config) => {
          if (config && Object.keys(config).length > 0) {
            console.debug(`[AppInitializer:${id}] Loaded runtime config`, config);
            configService.setConfig(config);
          }
        })
        .catch(() => {
          console.warn(`[AppInitializer:${id}] Failed to load runtime config, using defaults`);
        })
    : Promise.resolve(); // dev: use environment.ts defaults

  // initialize auth
  return configLoad
    .then(() => {
      console.debug(`[AppInitializer:${id}] Initializing AuthService`);
      return auth.init();
    })
    .then((user) => {
      console.debug(`[AppInitializer:${id}] Initialization complete`);
      return user;
    });
}
