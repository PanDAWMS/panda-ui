import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-callback',
  standalone: true,
  imports: [],
  templateUrl: './login-callback.component.html',
  styleUrl: './login-callback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    setTimeout(() => {
      this.authService
        .init()
        .then((user) => {
          console.debug('[LoginCallback] User info loaded:', user);
          this.router.navigate(['/']);
        })
        .catch((error) => {
          console.error('[LoginCallback] Failed to fetch user info:', error);
          this.router.navigate(['/']);
        });
    }, 50);
  }
}
