import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {firstValueFrom, of, switchMap} from 'rxjs';
import { UserProfile } from '../models/user.model';

export function authInitializer(): Promise<UserProfile|null> {
  const auth = inject(AuthService);
  return firstValueFrom(auth.checkAuth().pipe(
    switchMap(user => {
      if (user) {
        // fetch token
        return auth.getUserToken().pipe(switchMap(() => of(user)));
      }
      return of(null);
      }
    )
  ));
}
