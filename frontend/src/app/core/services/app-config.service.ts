import { Injectable } from '@angular/core';
import { AppConfig } from '../models/app-config.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config: AppConfig = {
    apiUrl: environment.apiUrl,
  };

  // merge runtime config with defaults
  setConfig(config: Partial<AppConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // read-only access to API URL
  get apiUrl(): string {
    return this.config.apiUrl;
  }

  // general getter for other config
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
}
