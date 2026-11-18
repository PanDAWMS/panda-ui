import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { UserProfile } from '../../../../shared/models/user.model';
import { MenuItem } from '../../../../shared/models/menu-item';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  auth = inject(AuthService);
  private configService = inject(AppConfigService);

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
    const items: MenuItem[] = [{ label: 'Profile', icon: 'person', routerLink: 'user/profile' }];
    if (this.configService.hasApp('notification')) {
      items.push({ label: 'My Notifications', icon: 'notifications', routerLink: 'notifications' });
    }
    items.push({ label: 'Logout', icon: 'logout', command: () => this.logout() });
    return items;
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }
}
