import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { LoggingService } from '../../../../core/services/logging.service';

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
  private log = inject(LoggingService).forContext('LoginCallback');
  private router = inject(Router);

  ngOnInit(): void {
    setTimeout(() => {
      this.authService
        .init()
        .then((user) => {
          this.log.debug('User info loaded:', user);
          this.router.navigate(['/']);
        })
        .catch((error) => {
          this.log.error('Failed to fetch user info:', error);
          this.router.navigate(['/']);
        });
    }, 50);
  }
}
