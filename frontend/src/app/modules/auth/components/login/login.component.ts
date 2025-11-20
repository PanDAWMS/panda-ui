import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AvatarModule} from 'primeng/avatar';
import {MenuModule} from 'primeng/menu';
import {ButtonModule} from 'primeng/button';
import {AuthService} from '../../../../core/services/auth.service';
import {UserProfile} from '../../../../core/models/user.model';
import {MenuItem} from 'primeng/api';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, AvatarModule, MenuModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  user$!: Observable<UserProfile | null>;
  userMenu: MenuItem[] = [];

  constructor(public auth: AuthService) {
    this.user$ = this.auth.user$;
    this.user$.subscribe(user => {
      if (user) {
        this.userMenu = this.buildUserMenu();
      } else {
        this.userMenu = []
      }
    })
  }

  buildUserMenu(): MenuItem[] {
    return [
      { label: 'Profile', icon: 'pi pi-user', routerLink: ['/user/profile'] },
      { label: 'Logout', icon: 'pi pi-sign-out', routerLink: ['/logout'] }
    ]
  }


  login() {
    this.auth.login();
  }
}

