import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export function authInitializer() {
  const auth = inject(AuthService);
  return firstValueFrom(auth.checkAuth());
}
