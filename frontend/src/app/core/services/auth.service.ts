import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/user.model';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private authUrl = `${environment.apiUrl}/oauth/`; // DRF endpoint returns the IAM login URL
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<UserProfile | null>(null);

  readonly user$ = this.userSubject.asObservable();
  readonly token$ = this.tokenSubject.asObservable();

  readonly isAuthenticated$ = this.userSubject.pipe(map((user) => !!user));

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred.';
    if (error.status === 403) {
      errorMessage = 'You are not authorized to perform this action.';
    }
    return throwError(() => new Error(errorMessage));
  }

  login(): void {
    // redirect to IAM login page keeping session in the same tab
    window.open(`${this.authUrl}login/iam/`, '_self');
  }

  checkAuth(): Observable<UserProfile | null> {
    // check if the user is already authenticated to avoid unnecessary calls
    const currentUser = this.userSubject.value;
    if (currentUser) {
      // we already know the user — ensure loading is false
      console.debug('[AuthService] checkAuth: returning cached user');
      return of(currentUser);
    }
    // check if the user is authenticated by calling the userinfo endpoint
    return this.http.get<UserProfile>(`${this.authUrl}userinfo/`).pipe(
      map((response) => ({
        username: response.username,
        first_name: response.first_name,
        last_name: response.last_name,
        email: response.email,
        initials: ((response.first_name?.[0] || '') + (response.last_name?.[0] || '')).toUpperCase(),
        groups: response.groups,
        permissions: response.permissions,
      })),
      tap((user) => {
        console.debug('[AuthService] checkAuth: got user from userinfo API');
        this.setUser(user);
      }),
      catchError((err) => {
        console.debug('[AuthService] checkAuth: error', err && err.status, err && err.message);
        this.setUser(null);
        return of(null);
      }),
    );
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
          console.error('Logout API error', err);
          return of(null);
        }),
      )
      .subscribe(() => {
        try {
          this.router.navigate(['/']);
        } catch (e) {
          // ignore navigation errors
          console.debug('Navigation error after logout', e);
        }
      });
  }

  clearSession(): void {
    // Clear the user and the token in the subject
    console.debug('[AuthService] clearSession -> clearing client state');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }
}
