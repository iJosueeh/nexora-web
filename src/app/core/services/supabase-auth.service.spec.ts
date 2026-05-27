import { TestBed } from '@angular/core/testing';
import { SupabaseAuthService } from './supabase-auth.service';
import { AuthSession } from './auth-session';
import { Router } from '@angular/router';
import { vi, Mock } from 'vitest';

describe('SupabaseAuthService', () => {
  let service: SupabaseAuthService;
  let authSessionSpy: { 
    clear: ReturnType<typeof vi.fn>; 
    getUser: ReturnType<typeof vi.fn>; 
    start: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
  };
  let routerSpy: { navigateByUrl: ReturnType<typeof vi.fn>; url: string };

  const mockSupabaseClient = {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resend: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      verifyOtp: vi.fn()
    }
  };

  beforeEach(() => {
    authSessionSpy = {
      clear: vi.fn(),
      getUser: vi.fn(),
      start: vi.fn(),
      isAuthenticated: vi.fn(),
    };
    routerSpy = {
      navigateByUrl: vi.fn(),
      url: '/'
    };

    TestBed.configureTestingModule({
      providers: [
        SupabaseAuthService,
        { provide: AuthSession, useValue: authSessionSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(SupabaseAuthService);
    
    // Override getClient to return our mock
    vi.spyOn(service, 'getClient').mockReturnValue(mockSupabaseClient as unknown as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should normalize email to institutional format (UPPERCASE local part for UTP)', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({ data: {}, error: null });
    
    await service.signUpWithEmail('u23226864@utp.edu.pe', 'password');
    
    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'U23226864@utp.edu.pe'
    }));
  });

  it('should lowercase other domains', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({ data: {}, error: null });
    
    await service.signUpWithEmail('Test.User@gmail.com', 'password');
    
    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test.user@gmail.com'
    }));
  });

  it('should handle sign in and check email confirmation', async () => {
    const mockUser = { id: '123', email_confirmed_at: '2024-01-01', email: 'test@utp.edu.pe' };
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'abc', refresh_token: 'def' } },
      error: null
    });

    const result = await service.signInWithEmail('test@utp.edu.pe', 'password');
    expect(result.user.id).toBe('123');
    expect(result.tokens.accessToken).toBe('abc');
  });

  it('should throw error if email not confirmed', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { email_confirmed_at: null }, session: null },
      error: null
    });

    await expect(service.signInWithEmail('test@utp.edu.pe', 'password')).rejects.toThrow('EMAIL_NOT_CONFIRMED');
  });
});
