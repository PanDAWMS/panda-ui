// App initializer loads config json with backend API URL,
// and checks if a user already has authenticated and has an active session

import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../services/app-config.service';
import { VersionService } from '../services/version.service';
import { AuthService } from '../services/auth.service';
import { UserProfile } from '../models/user.model';
import { AppConfig } from '../models/app-config.model';
import { LoggingService } from '../services/logging.service';
import { environment } from '../../../environments/environment';

let initialized = false;
export const resetInitializedForTesting = (): boolean => (initialized = false);

export function appInitializer(): Promise<UserProfile | null> {
  const http = inject(HttpClient);
  const log = inject(LoggingService).forContext('AppInitializer');
  const configService = inject(AppConfigService);
  const versionService = inject(VersionService);
  const auth = inject(AuthService);
  const id = Math.random().toString(36).slice(2);

  if (initialized) {
    log.debug(`[${id}] Already initialized, skipping`);
    return Promise.resolve(auth['userSubject'].value);
  }
  initialized = true;
  log.debug(`[${id}] Starting initialization`);

  // prod: load runtime config from ConfigMap-mounted JSON
  const configLoad = environment.production
    ? firstValueFrom(http.get<Partial<AppConfig>>('/assets/app-config.json'))
        .then((config) => {
          if (config && Object.keys(config).length > 0) {
            log.debug(`[${id}] Loaded runtime config`, config);
            configService.setConfig(config);
          }
        })
        .catch(() => {
          log.warn(`[${id}] Failed to load runtime config, using defaults`);
        })
    : Promise.resolve(); // dev: use environment.ts defaults

  // load version from assets
  const versionLoad = firstValueFrom(http.get<{ version: string }>('/assets/version.json'))
    .then((v) => {
      versionService.setVersion(v.version);
      log.debug(`[${id}] Loaded version ${v.version}`);
    })
    .catch(() => {
      log.warn(`[${id}] Failed to load version, using default`);
    });

  // initialize auth
  return Promise.all([configLoad, versionLoad])
    .then(() => {
      log.debug(`[${id}] Initializing AuthService`);
      return auth.init();
    })
    .then((user) => {
      log.debug(`[${id}] Initialization complete`);
      return user;
    });
}
