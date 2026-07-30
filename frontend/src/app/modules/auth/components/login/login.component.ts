import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfile } from '../../../../core/models/user.model';
import { MenuItem } from '../../../../core/models/menu-item';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  auth = inject(AuthService);

  user$!: Observable<UserProfile | null>;
  userMenu: MenuItem[] = [];

  constructor() {
    this.user$ = this.auth.user$;
    this.user$.subscribe((user) => {
      if (user) {
        this.userMenu = this.buildUserMenu();
      } else {
        this.userMenu = [];
      }
    });
  }

  buildUserMenu(): MenuItem[] {
    return [
      { label: 'Profile', icon: 'person', routerLink: 'user/profile' },
      { label: 'Logout', icon: 'logout', command: () => this.logout() },
    ];
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }
}
