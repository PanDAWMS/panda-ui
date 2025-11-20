import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../../core/services/auth.service';
import {Router} from '@angular/router';
import {UserProfile} from '../../../../core/models/user.model';


@Component({
  selector: 'app-login-callback',
  standalone: true,
  imports: [],
  templateUrl: './login-callback.component.html',
  styleUrl: './login-callback.component.scss'
})
export class LoginCallbackComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.checkAuth().subscribe({
      next: (user) => {
        console.debug('User info loaded:', user);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Failed to fetch user info:', error);
        this.router.navigate(['/']);
      },
    });
  }
}
