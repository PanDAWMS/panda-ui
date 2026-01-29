import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../services/app-config.service';
import { AppConfig } from '../models/app-config.model';
import { environment } from '../../../environments/environment';

export function appConfigInitializer(): Promise<void> {
  const httpClient = inject(HttpClient);
  const configService = inject(AppConfigService);

  if (!environment.production) {
    console.debug('[appConfigInitializer] This is not production, getting config from environment');
    return Promise.resolve();
  }

  return firstValueFrom(httpClient.get<Partial<AppConfig>>('/assets/app-config.json'))
    .then((config) => {
      if (config && Object.keys(config).length > 0) {
        configService.setConfig(config);
      }
    })
    .catch(() => {
      // Fail gracefully, local dev will use environment.ts
      console.info('[AppConfig] No runtime config found, using defaults.');
    });
}
