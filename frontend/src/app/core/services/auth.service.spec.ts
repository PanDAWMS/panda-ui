import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { AppConfigService } from './app-config.service';
import { LoggingService } from './logging.service';
import { UserProfile } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  const mockApiUrl = 'https://mock-api.local/api/v1/';
  const expectedAuthUrl = 'https://mock-api.local/api/oauth/';

  const mockUserProfile: UserProfile = {
    username: 'jpanda',
    first_name: 'John',
    last_name: 'Panda',
    email: 'jpanda@cern.ch',
    initials: 'JP',
    groups: ['atlas', 'panda-users'],
    permissions: ['read', 'write'],
  };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AppConfigService,
          useValue: { apiUrl: mockApiUrl },
        },
        {
          provide: LoggingService,
          useValue: {
            forContext: () => ({
              debug: vi.fn(),
              error: vi.fn(),
              info: vi.fn(),
            }),
          },
        },
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init()', () => {
    it('should fetch user info and token on initial call and set state', async () => {
      const initPromise = service.init();

      // 1. Flush userinfo endpoint
      const userinfoReq = httpMock.expectOne(`${expectedAuthUrl}userinfo/`);
      expect(userinfoReq.request.method).toBe('GET');
      userinfoReq.flush(mockUserProfile);

      // 2. Flush usertoken endpoint (triggered by switchMap)
      const tokenReq = httpMock.expectOne(`${expectedAuthUrl}usertoken/`);
      expect(tokenReq.request.method).toBe('GET');
      tokenReq.flush({ token: 'mock-jwt-token-123' });

      const user = await initPromise;

      expect(user).toEqual(mockUserProfile);

      // Verify state updated
      const currentUser = await firstValueFrom(service.user$);
      const currentToken = await firstValueFrom(service.token$);
      expect(currentUser).toEqual(mockUserProfile);
      expect(currentToken).toBe('mock-jwt-token-123');
    });

    it('should handle token fetch failure gracefully during init', async () => {
      const initPromise = service.init();

      const userinfoReq = httpMock.expectOne(`${expectedAuthUrl}userinfo/`);
      userinfoReq.flush(mockUserProfile);

      const tokenReq = httpMock.expectOne(`${expectedAuthUrl}usertoken/`);
      tokenReq.flush({ message: 'Token error' }, { status: 500, statusText: 'Server Error' });

      const user = await initPromise;

      // User info is retained even if getting token fails
      expect(user).toEqual(mockUserProfile);
      const currentToken = await firstValueFrom(service.token$);
      expect(currentToken).toBeNull();
    });

    it('should return null and clear state if userinfo endpoint fails', async () => {
      const initPromise = service.init();

      const userinfoReq = httpMock.expectOne(`${expectedAuthUrl}userinfo/`);
      userinfoReq.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const user = await initPromise;

      expect(user).toBeNull();
      const currentUser = await firstValueFrom(service.user$);
      expect(currentUser).toBeNull();
    });

    it('should return cached user if already initialized', async () => {
      // First initialization
      const initPromise1 = service.init();
      httpMock.expectOne(`${expectedAuthUrl}userinfo/`).flush(mockUserProfile);
      httpMock.expectOne(`${expectedAuthUrl}usertoken/`).flush({ token: 'mock-token' });
      await initPromise1;

      // Second initialization call
      const initPromise2 = service.init();
      // Should not trigger any new HTTP requests
      httpMock.expectNone(`${expectedAuthUrl}userinfo/`);

      const user = await initPromise2;
      expect(user).toEqual(mockUserProfile);
    });
  });

  describe('getUserToken()', () => {
    it('should fetch token and update tokenSubject', async () => {
      const tokenPromise = firstValueFrom(service.getUserToken());

      const req = httpMock.expectOne(`${expectedAuthUrl}usertoken/`);
      expect(req.request.method).toBe('GET');
      req.flush({ token: 'new-auth-token' });

      const token = await tokenPromise;
      expect(token).toBe('new-auth-token');

      const currentToken = await firstValueFrom(service.getToken());
      expect(currentToken).toBe('new-auth-token');
    });

    it('should handle 403 error in handleError', async () => {
      let capturedError: Error | undefined;

      service.getUserToken().subscribe({
        error: (err) => (capturedError = err),
      });

      const req = httpMock.expectOne(`${expectedAuthUrl}usertoken/`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(capturedError?.message).toBe('You are not authorized to perform this action.');
    });
  });

  describe('logout()', () => {
    it('should clear session immediately, call logout endpoint with credentials, and navigate', async () => {
      // Seed initial logged-in state
      service.setUser(mockUserProfile);
      service.setToken('active-token');

      service.logout();

      // Verify local session cleared immediately
      const currentUser = await firstValueFrom(service.user$);
      const currentToken = await firstValueFrom(service.token$);
      expect(currentUser).toBeNull();
      expect(currentToken).toBeNull();

      // Verify HTTP request
      const req = httpMock.expectOne(`${expectedAuthUrl}logout/`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);

      req.flush(null);

      // Verify router navigation
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('login()', () => {
    it('should open window redirecting to IAM login', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      service.login();

      expect(openSpy).toHaveBeenCalledWith(`${expectedAuthUrl}login/iam/`, '_self');
      openSpy.mockRestore();
    });
  });
});
