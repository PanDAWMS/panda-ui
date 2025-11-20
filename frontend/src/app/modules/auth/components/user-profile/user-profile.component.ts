import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../../core/services/auth.service';
import {Observable} from 'rxjs';
import {UserProfile} from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import {tap} from 'rxjs/operators';
import { TableModule} from 'primeng/table';
import { ButtonModule} from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ButtonModule, TableModule, SkeletonModule],
  templateUrl: './user-profile.component.html',
  standalone: true,
  styleUrl: './user-profile.component.scss'
})
// export class UserProfileComponent {
//   user$!: Observable<UserProfile | null>;
//   token$: Observable<string | null>;
//   loadingToken: boolean = false;
//
//   constructor(private router: Router, private authService: AuthService) {
//     this.user$ = this.authService.getUser();
//     this.token$ = this.authService.token$;
//   }
//
//   loadToken() {
//     this.loadingToken = true;
//     this.authService.getUserToken().subscribe({
//       next: () => {
//         this.loadingToken = false;
//       },
//       error: (err) => {
//         console.error("Failed to load token", err);
//         this.loadingToken = false;
//       }
//     });
//   }
// }
export class UserProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Expose reactive streams
  user$: Observable<UserProfile | null> = this.authService.user$;
  token$: Observable<string | null> = this.authService.token$;

  loadingToken = false;

  // Trigger token load
  loadToken() {
    this.loadingToken = true;
    this.authService.getUserToken().pipe(
      tap({
        next: () => this.loadingToken = false,
        error: () => this.loadingToken = false
      })
    ).subscribe();
  }
}
