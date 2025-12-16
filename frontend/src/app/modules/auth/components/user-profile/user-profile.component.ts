import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
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
  private router = inject(Router);

  // expose reactive streams
  user$: Observable<UserProfile | null> = this.authService.user$;
  token$: Observable<string | null> = this.authService.token$;

  loadingToken = false;

  // trigger token load
  loadToken(): void {
    this.loadingToken = true;
    this.authService
      .getUserToken()
      .pipe(
        tap({
          next: () => (this.loadingToken = false),
          error: () => (this.loadingToken = false),
        }),
      )
      .subscribe();
  }
}
