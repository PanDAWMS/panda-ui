import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import { environment } from '../../../environments/environment';
import {UserProfile} from '../models/user.model';
import { map, tap, catchError } from "rxjs/operators";
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = `${environment.apiUrl}oauth/`; // DRF endpoint returns the IAM login URL
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<UserProfile | null>(null);


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unexpected error occurred.';
    if (error.status === 403) {
      errorMessage = 'You are not authorized to perform this action.';
    }
    return throwError(() => new Error(errorMessage));
  }

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    // Redirect to IAM login page keeping session in the same tab
    window.open(`${this.authUrl}login/iam/`, "_self");
  }

  checkAuth(): Observable<UserProfile | null> {
    // Check if the user is already authenticated to avoid unnecessary calls
    const currentUser = this.userSubject.value;
    if (currentUser) {
      return of(currentUser);
    }
    // Check if the user is authenticated by calling the userinfo endpoint
    return this.http.get<UserProfile>(`${this.authUrl}userinfo/`).pipe(
      map(response => ({
        username: response.username,
        first_name: response.first_name,
        last_name: response.last_name,
        email: response.email,
        initials: ((response.first_name?.[0] || '') + (response.last_name?.[0] || '')).toUpperCase(),
        groups: response.groups,
        permissions: response.permissions,
      })),
      tap(user => this.setUser(user)),
      catchError(error => {
        this.setUser(null);
        return of(null);
      })
    );
  }

  setUser(user: UserProfile | null): void {
    this.userSubject.next(user);
  }

  getUser(): Observable<UserProfile|null> {
    return this.userSubject.asObservable();
  }

  getUserToken(): Observable<string> {
    return this.http.get<{ token: string }>(`${this.authUrl}usertoken/`).pipe(
      map(response => {
        this.setToken(response.token);
        return response.token;
      }),
      catchError(this.handleError)
    );
  }

  setToken(token: string): void {
    return this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }
  token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  logout(): void {
    this.http.get(`${this.authUrl}logout/`, {}).pipe(catchError(this.handleError)).subscribe(
      () => {
        this.clearSession();
        // Redirect to the home page
        this.router.navigate(['/']);
      }
    );
  }

  clearSession(): void {
    // Clear the user and the token in the subject
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

}
