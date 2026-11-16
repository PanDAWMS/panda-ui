import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable, of, switchMap, throwError } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { UserProfile } from '../../shared/models/user.model';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly config = inject(AppConfigService);
  private http = inject(HttpClient);
  private log = inject(LoggingService).forContext('AuthService');
  private router = inject(Router);

  private initialized = false;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<UserProfile | null>(null);

  readonly user$ = this.userSubject.asObservable();
  readonly token$ = this.tokenSubject.asObservable();

  readonly isAuthenticated$ = this.userSubject.pipe(map((user) => !!user));

  private get authUrl(): string {
    // DRF endpoint that redirects to the IAM login URL
    const baseApiUrl = this.config.apiUrl.replace(/\/v\d+\/?$/, '');
    return `${baseApiUrl}/oauth/`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred.';
    if (error.status === 403) {
      errorMessage = 'You are not authorized to perform this action.';
    }
    return throwError(() => new Error(errorMessage));
  }

  init(): Promise<UserProfile | null> {
    if (this.initialized) {
      this.log.debug('init: already initialized');
      return Promise.resolve(this.userSubject.value);
    }
    this.initialized = true;
    this.log.debug('init: calling userinfo API to check auth status');

    // try to get user info and token simultaneously
    const user$ = this.http.get<UserProfile>(`${this.authUrl}userinfo/`).pipe(
      map(
        (r): UserProfile => ({
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          email: r.email,
          initials: ((r.first_name?.[0] ?? '') + (r.last_name?.[0] ?? '')).toUpperCase(),
          groups: r.groups,
          permissions: r.permissions,
        }),
      ),
      catchError((err: HttpErrorResponse) => {
        this.log.debug('init: userinfo failed', err.status, err.message);
        return of(null);
      }),
    );

    const token$ = this.http.get<{ token: string }>(`${this.authUrl}usertoken/`).pipe(
      map((r) => r.token),
      catchError((err: HttpErrorResponse) => {
        this.log.debug('init: usertoken failed', err.status, err.message);
        return of(null);
      }),
    );

    return firstValueFrom(
      forkJoin([user$, token$]).pipe(
        map(([user, token]) => {
          this.userSubject.next(user);
          // A token without a user is meaningless; keep state consistent
          this.tokenSubject.next(user ? token : null);
          return user;
        }),
      ),
    );
  }

  login(): void {
    // redirect to IAM login page keeping session in the same tab
    window.open(`${this.authUrl}login/iam/`, '_self');
  }

  setUser(user: UserProfile | null): void {
    this.userSubject.next(user);
  }

  getUserToken(): Observable<string> {
    return this.http.get<{ token: string }>(`${this.authUrl}usertoken/`).pipe(
      map((response) => {
        this.setToken(response.token);
        return response.token;
      }),
      catchError(this.handleError),
    );
  }

  setToken(token: string): void {
    this.tokenSubject.next(token);
  }

  getToken(): Observable<string | null> {
    return this.token$;
  }

  logout(): void {
    // clear local session immediately so UI shows Login button without waiting for network
    this.clearSession();

    // notify backend to clear server session cookie, include credentials
    this.http
      .get(`${this.authUrl}logout/`, { withCredentials: true })
      .pipe(
        catchError((err) => {
          // ignore error but log
          this.log.error('Logout API error', err);
          return of(null);
        }),
      )
      .subscribe(() => {
        try {
          this.router.navigate(['/']);
        } catch (e) {
          // ignore navigation errors
          this.log.debug('Navigation error after logout', e);
        }
      });
  }

  clearSession(): void {
    // Clear the user and the token in the subject
    this.log.debug('clearSession -> clearing client state');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }
}
