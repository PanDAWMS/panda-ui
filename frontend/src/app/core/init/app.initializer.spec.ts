import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { appInitializer, resetInitializedForTesting } from './app.initializer';
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
    resetInitializedForTesting();

    authService = jasmine.createSpyObj<AuthService>('AuthService', ['init']);
    // Mock the property 'userSubject' as a BehaviorSubject
    (authService as any)['userSubject'] = { value: null };

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

    // handle the version.json request if it's fired on service init
    const versionReq = httpMock.match('/assets/version.json');
    if (versionReq.length > 0) {
      versionReq.forEach((req) => req.flush({ version: '0.0.0' }));
    }
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads runtime config and initializes auth (production)', async () => {
    environment.production = true;

    const mockConfig: AppConfig = {
      apiUrl: 'https://mock-api.local/api',
      logLevel: 'WARN',
      production: true,
      vo: '',
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

    // Handle the background version.json call first
    const versionReqs = httpMock.match('/assets/version.json');
    versionReqs.forEach((req) => req.flush({ version: '0.0.0' }));

    const configReqs = httpMock.match('/assets/app-config.json');
    if (configReqs.length > 0) {
      configReqs[0].flush(mockConfig);
    } else {
      // If we reach here, the 'if(initialized)' block likely triggered an early return
      console.warn('The initializer returned early and did not request app-config.json');
    }

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

    const promise = TestBed.runInInjectionContext(() => appInitializer());
    // handle the unexpected version.json request that's firing automatically
    httpMock.match('/assets/version.json').forEach((req) => req.flush({ version: '0.0.0' }));
    // verify that the app-config.json was NOT called (as per your test logic)
    httpMock.expectNone('/assets/app-config.json');

    const user = await promise;
    expect(user).toEqual(mockUser);
    expect(authService.init).toHaveBeenCalledTimes(1);
  });
});
