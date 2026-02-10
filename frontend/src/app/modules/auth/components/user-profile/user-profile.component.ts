import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { concatMap, Observable, Subject, switchMap, take } from 'rxjs';
import { UserProfile } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ButtonModule, TableModule, SkeletonModule],
  templateUrl: './user-profile.component.html',
  standalone: true,
  styleUrl: './user-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
