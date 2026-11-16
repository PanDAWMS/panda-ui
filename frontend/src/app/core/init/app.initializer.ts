import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { AppConfigService } from '../services/app-config.service';
import { VersionService } from '../services/version.service';
import { AuthService } from '../services/auth.service';
import { LoggingService } from '../services/logging.service';
import { AppConfig } from '../../shared/models/app-config.model';
import { environment } from '../../../environments/environment';

const CONFIG_URL = 'assets/app-config.json';
const VERSION_URL = 'assets/version.json';
const ASSET_TIMEOUT_MS = 5_000;
const AUTH_TIMEOUT_MS = 10_000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let handle: ReturnType<typeof setTimeout>;
  const timer = new Promise<never>((_, reject) => {
    handle = setTimeout(() => reject(new Error(`${label} timed out after ${ms} ms`)), ms);
  });
  return Promise.race([promise, timer]).finally(() => clearTimeout(handle));
}

export async function appInitializer(): Promise<void> {
  const platformId = inject(PLATFORM_ID);
  const log = inject(LoggingService).forContext('AppInitializer');
  const configService = inject(AppConfigService);
  const versionService = inject(VersionService);
  const auth = inject(AuthService);
  // Bypass interceptors: they may depend on the config we're about to load.
  const rawHttp = new HttpClient(inject(HttpBackend));
  const id = Math.random().toString(36).slice(2);

  // SSR: no session cookies and no reachable relative URLs on the server.
  // The browser runs the full init after hydration.
  if (isPlatformServer(platformId)) {
    log.debug(`[${id}] Server platform, skipping runtime init`);
    return;
  }

  log.debug(`[${id}] Starting initialization`);

  // always revalidate (304 if unchanged)
  const fetchAsset = (url: string): Promise<unknown> =>
    firstValueFrom(rawHttp.get<unknown>(url, { cache: 'no-cache' }).pipe(timeout(ASSET_TIMEOUT_MS)));

  // prod: runtime config from the ConfigMap-mounted JSON; dev: environment.ts defaults
  const configLoad = environment.production
    ? fetchAsset(CONFIG_URL)
        .then((config) => {
          if (!isPlainObject(config) || Object.keys(config).length === 0) {
            log.warn(`[${id}] Runtime config empty or malformed, using defaults`);
            return;
          }
          configService.setConfig(config as Partial<AppConfig>);
          log.debug(`[${id}] Loaded runtime config keys`, Object.keys(config));
        })
        .catch((err: unknown) => {
          log.warn(`[${id}] Failed to load runtime config, using defaults`, err);
        })
    : Promise.resolve();

  const versionLoad = fetchAsset(VERSION_URL)
    .then((v) => {
      if (!isPlainObject(v) || typeof v['version'] !== 'string') {
        log.warn(`[${id}] version.json malformed, using default`);
        return;
      }
      versionService.setVersion(v['version']);
      log.debug(`[${id}] Loaded version ${v['version']}`);
    })
    .catch((err: unknown) => {
      log.warn(`[${id}] Failed to load version, using default`, err);
    });

  await Promise.all([configLoad, versionLoad]);

  // A rejected initializer aborts bootstrap (blank page), so never let auth throw.
  try {
    log.debug(`[${id}] Initializing AuthService`);
    await withTimeout(auth.init(), AUTH_TIMEOUT_MS, 'auth.init');
    log.debug(`[${id}] Initialization complete`);
  } catch (err: unknown) {
    log.warn(`[${id}] Session check failed, continuing unauthenticated`, err);
  }
}
