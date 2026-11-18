import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AppConfigService } from '../services/app-config.service';
import { MessageBufferService } from '../services/message-buffer.service';

/**
 * Blocks a route unless `appName` is in the runtime installedApps config
 * (AppConfigService.hasApp), so a disabled feature is actually unreachable
 * by direct URL, not just hidden from the nav.
 */
export const appEnabledGuard = (appName: string): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const configService = inject(AppConfigService);
    const messageBuffer = inject(MessageBufferService);
    if (configService.hasApp(appName)) {
      return true;
    }
    messageBuffer.add(`${state.url} is not enabled on this deployment.`, 'Close', {
      duration: 5000,
      panelClass: ['bg-amber-500', 'text-white'],
    });
    return router.parseUrl('/');
  };
};
