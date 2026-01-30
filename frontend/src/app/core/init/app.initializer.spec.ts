import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { appInitializer } from './app.initializer';
import { AppConfigService } from '../services/app-config.service';
import { AuthService } from '../services/auth.service';
import { AppConfig } from '../models/app-config.model';
import { UserProfile } from '../models/user.model';
import { environment } from '../../../environments/environment';

describe('appInitializer', () => {
  let configService: AppConfigService;
  let authService: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['init']);

    TestBed.configureTestingModule({
      providers: [
        AppConfigService,
        { provide: AuthService, useValue: authService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    configService = TestBed.inject(AppConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads runtime config and initializes auth (production)', async () => {
    environment.production = true;

    const mockConfig: AppConfig = {
      apiUrl: 'https://mock-api.local/api',
      production: true,
    };

    const mockUser: UserProfile = {
      username: 'test_user',
      first_name: 'Test',
      last_name: 'User',
      initials: 'TU',
      email: 'test@example.com',
      permissions: [],
      groups: [],
    };

    authService.init.and.resolveTo(mockUser);

    const promise = TestBed.runInInjectionContext(() => appInitializer());

    const req = httpMock.expectOne('/assets/app-config.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);

    const user = await promise;

    expect(user).toEqual(mockUser);
    expect(authService.init).toHaveBeenCalledTimes(1);

    // Optional: verify config was applied
    expect((configService as any).config).toEqual(mockConfig);
  });

  it('skips config load in development mode', async () => {
    environment.production = false;

    const mockUser: UserProfile = {
      username: 'dev_user',
      first_name: 'Dev',
      last_name: 'User',
      initials: 'DU',
      email: 'dev@example.com',
      permissions: [],
      groups: [],
    };

    authService.init.and.resolveTo(mockUser);

    const user = await TestBed.runInInjectionContext(() => appInitializer());

    httpMock.expectNone('/assets/app-config.json');
    expect(user).toEqual(mockUser);
    expect(authService.init).toHaveBeenCalledTimes(1);
  });
});
