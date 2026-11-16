import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../../core/services/auth.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { Option } from '../../../../shared/models/option.model';
import { UserProfile } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-profile',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly log = inject(LoggingService).forContext('UserProfile');

  readonly user: Signal<UserProfile | null> = toSignal(this.authService.user$, { initialValue: null });
  readonly token: Signal<string | null> = toSignal(this.authService.token$, { initialValue: null });

  readonly showToken: WritableSignal<boolean> = signal(false);
  readonly loadingToken: WritableSignal<boolean> = signal(false);
  readonly tokenError: WritableSignal<string | null> = signal<string | null>(null);

  readonly displayedColumns = ['label', 'value'];

  // UserProfile → key-value rows for mat-table
  readonly rows = computed<Option[]>(() => {
    const u = this.user();
    if (!u) return [];
    return [
      { label: 'Username', value: u.username || '—' },
      { label: 'First name', value: u.first_name || '—' },
      { label: 'Family name', value: u.last_name || '—' },
      { label: 'Email', value: u.email || '—' },
      { label: 'Groups', value: u.groups?.length ? u.groups.join(', ') : '—' },
    ];
  });

  loadToken(): void {
    this.tokenError.set(null);

    // Already loaded during app init: just reveal it
    if (this.token()) {
      this.showToken.set(true);
      return;
    }

    this.loadingToken.set(true);
    this.authService
      .getUserToken()
      .pipe(finalize(() => this.loadingToken.set(false)))
      .subscribe({
        next: () => this.showToken.set(true), // token() updates via token$
        error: (err: Error) => {
          this.log.warn('Token load failed', err.message);
          this.tokenError.set(err.message);
        },
      });
  }
}
