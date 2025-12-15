import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserProfile } from '../models/user.model';

// Simple initializer to call AuthService.init() once during app startup (SSR or CSR)
let initialized = false;

export function authInitializer(): Promise<UserProfile | null> {
  const auth = inject(AuthService);
  const id = Math.random().toString(36).slice(2);

  if (initialized) {
    console.debug(`[AuthInitializer:${id}] Already initialized, skipping`);
    return Promise.resolve(auth['userSubject'].value);
  }
  initialized = true;
  console.debug(`[AuthInitializer:${id}] Initializing authentication status`);
  return auth.init();
}
