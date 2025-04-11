import {Routes} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {LoginCallbackComponent} from './pages/login-callback/login-callback.component';
import {UserProfileComponent} from './pages/user-profile/user-profile.component';
import {LogoutComponent} from './pages/logout/logout.component';

export const authRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'login/callback', component: LoginCallbackComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'user/profile', component: UserProfileComponent}
];
