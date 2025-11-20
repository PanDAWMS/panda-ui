import {Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {LoginCallbackComponent} from './components/login-callback/login-callback.component';
import {UserProfileComponent} from './components/user-profile/user-profile.component';
import {LogoutComponent} from './components/logout/logout.component';

export const authRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'login/callback', component: LoginCallbackComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'user/profile', component: UserProfileComponent}
];
