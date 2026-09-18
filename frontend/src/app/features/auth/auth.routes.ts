import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LoginCallbackComponent } from './components/login-callback/login-callback.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

export const authRoutes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'login/callback', component: LoginCallbackComponent, title: 'Login' },
  { path: 'user/profile', component: UserProfileComponent, title: 'User Profile' },
];
