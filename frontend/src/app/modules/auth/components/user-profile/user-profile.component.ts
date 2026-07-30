import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { concatMap, Observable, Subject, take } from 'rxjs';
import { UserProfile } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';

import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-profile',
  imports: [AsyncPipe, CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-profile.component.html',
  standalone: true,
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  private authService = inject(AuthService);

  private loadAction$ = new Subject<string | null>();
  user$: Observable<UserProfile | null> = this.authService.user$;
  token$ = this.loadAction$.asObservable();

  loadingToken = false;

  loadToken(): void {
    this.loadingToken = true;
    this.authService
      .getUserToken()
      .pipe(concatMap(() => this.authService.token$.pipe(take(1))))
      .subscribe({
        next: (tokenValue) => {
          this.loadingToken = false;
          this.loadAction$.next(tokenValue);
        },
        error: () => (this.loadingToken = false),
      });
  }
}
