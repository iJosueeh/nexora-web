import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authTokenInterceptor } from './auth-token.interceptor';
import { AuthSession } from '../services/auth-session';
import { SupabaseAuthService } from '../services/supabase-auth.service';
import { of } from 'rxjs';

describe('authTokenInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authSessionSpy: any;
  let supabaseAuthSpy: any;

  beforeEach(() => {
    authSessionSpy = {
      getTokens: vi.fn(),
    };
    supabaseAuthSpy = {
      getValidTokens: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthSession, useValue: authSessionSpy },
        { provide: SupabaseAuthService, useValue: supabaseAuthSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should not add Authorization header to GraphQL requests', () => {
    supabaseAuthSpy.getValidTokens.mockReturnValue(Promise.resolve({ accessToken: 'valid-token', tokenType: 'Bearer' }));

    httpClient.get('/graphql').subscribe();

    const req = httpMock.expectOne('/graphql');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });

  it('should add Authorization header from getValidTokens', async () => {
    const mockTokens = { accessToken: 'fresh-token', tokenType: 'Bearer' };
    supabaseAuthSpy.getValidTokens.mockReturnValue(Promise.resolve(mockTokens));

    httpClient.get('/api/test').subscribe();

    // Need to wait for the promise inside interceptor
    await new Promise(resolve => setTimeout(resolve, 0));

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fresh-token');
  });

  it('should fallback to AuthSession tokens if getValidTokens returns null', async () => {
    supabaseAuthSpy.getValidTokens.mockReturnValue(Promise.resolve(null));
    authSessionSpy.getTokens.mockReturnValue({ accessToken: 'stored-token', tokenType: 'Bearer' });

    httpClient.get('/api/test').subscribe();

    await new Promise(resolve => setTimeout(resolve, 0));

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer stored-token');
  });

  it('should not add Authorization header if no tokens are available', async () => {
    supabaseAuthSpy.getValidTokens.mockReturnValue(Promise.resolve(null));
    authSessionSpy.getTokens.mockReturnValue(null);

    httpClient.get('/api/test').subscribe();

    await new Promise(resolve => setTimeout(resolve, 0));

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });
});
