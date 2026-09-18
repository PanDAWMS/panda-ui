import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { concatMap, Observable, Subject, take } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile } from '../../../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { OptionObject } from '../../../../shared/models/option.model';

@Component({
  selector: 'app-user-profile',
  imports: [AsyncPipe, CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './user-profile.component.html',
  standalone: true,
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  private authService = inject(AuthService);

  private loadAction$ = new Subject<string | null>();
  user$: Observable<UserProfile | null> = this.authService.user$;
  token$ = this.loadAction$.asObservable();

  loadingToken: boolean = false;

  displayedColumns: string[] = ['label', 'value'];

  // Transform UserProfile object into key-value rows for mat-table
  dataSource$: Observable<OptionObject[]> = this.user$.pipe(
    map((u) => {
      if (!u) return [];

      return [
        { label: 'Username', value: u.username || '—' },
        { label: 'First name', value: u.first_name || '—' },
        { label: 'Family name', value: u.last_name || '—' },
        { label: 'Email', value: u.email || '—' },
        { label: 'Groups', value: u.groups?.length ? u.groups.join(', ') : '—' },
      ];
    }),
  );

  loadToken(): void {
    this.loadingToken = true;
    this.authService
      .getUserToken()
      .pipe(concatMap(() => this.authService.token$.pipe(take(1))))
      .subscribe({
        next: (tokenValue) => {
          this.loadingToken = false;
          this.loadAction$.next(tokenValue);
        },
        error: () => (this.loadingToken = false),
      });
  }
}
