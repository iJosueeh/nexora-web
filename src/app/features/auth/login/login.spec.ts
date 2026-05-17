import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { API_BASE_URL, GRAPHQL_URL } from '../../../core/tokens/api-endpoints.token';
import { SupabaseAuthService } from '../../../core/services/supabase-auth.service';
import { AuthApiService } from '../services/auth-api.service';
import { AuthSession } from '../../../core/services/auth-session';
import { of, throwError } from 'rxjs';
import { PermissionService } from '../../../core/services/permission.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let supabaseAuthSpy: any;
  let authApiSpy: any;
  let authSessionSpy: any;
  let permissionServiceSpy: any;
  let router: Router;
  let toastrSpy: any;

  beforeEach(async () => {
    supabaseAuthSpy = {
      signInWithEmail: vi.fn(),
      signOut: vi.fn(),
      toHumanErrorMessage: vi.fn().mockReturnValue('Error message'),
      isEmailNotConfirmedError: vi.fn().mockReturnValue(false),
    };

    authApiSpy = {
      getSessionProfile: vi.fn().mockReturnValue(of({ user: { profileComplete: true }, email: 'test@utp.edu.pe' })),
    };

    authSessionSpy = {
      start: vi.fn(),
      mergeUser: vi.fn(),
      clear: vi.fn(),
    };

    permissionServiceSpy = {
      isOfficialOrAdmin: vi.fn().mockReturnValue(false),
    };

    toastrSpy = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login, ToastrModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        { provide: GRAPHQL_URL, useValue: 'http://graphql.test' },
        { provide: SupabaseAuthService, useValue: supabaseAuthSpy },
        { provide: AuthApiService, useValue: authApiSpy },
        { provide: AuthSession, useValue: authSessionSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call supabaseAuth.signInWithEmail on valid submission', async () => {
    component.email = 'test@utp.edu.pe';
    component.password = 'Password123!';
    
    supabaseAuthSpy.signInWithEmail.mockResolvedValue({
      user: { id: '123', email: 'test@utp.edu.pe' },
      tokens: { accessToken: 'token' }
    });

    await component.onLogin();

    expect(supabaseAuthSpy.signInWithEmail).toHaveBeenCalledWith('TEST@utp.edu.pe', 'Password123!');
    expect(authSessionSpy.start).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/feed']);
  });

  it('should handle profile fetch failure after login', async () => {
    component.email = 'test@utp.edu.pe';
    component.password = 'Password123!';
    
    supabaseAuthSpy.signInWithEmail.mockResolvedValue({
      user: { id: '123', email: 'test@utp.edu.pe' },
      tokens: { accessToken: 'token' }
    });

    authApiSpy.getSessionProfile.mockReturnValue(of(null));
    supabaseAuthSpy.signOut.mockResolvedValue(undefined);

    await component.onLogin();

    expect(authSessionSpy.clear).toHaveBeenCalled();
    expect(supabaseAuthSpy.signOut).toHaveBeenCalled();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('No se pudo validar tu perfil'),
      expect.any(String)
    );
  });

  it('should redirect to register if profile is incomplete', async () => {
    component.email = 'test@utp.edu.pe';
    component.password = 'Password123!';
    
    supabaseAuthSpy.signInWithEmail.mockResolvedValue({
      user: { id: '123', email: 'test@utp.edu.pe' },
      tokens: { accessToken: 'token' }
    });

    authApiSpy.getSessionProfile.mockReturnValue(of({ user: { profileComplete: false } }));

    await component.onLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/register']);
    expect(toastrSpy.info).toHaveBeenCalledWith(expect.any(String), 'Perfil incompleto');
  });

  it('should handle login error', async () => {
    component.email = 'test@utp.edu.pe';
    component.password = 'wrong';
    
    supabaseAuthSpy.signInWithEmail.mockRejectedValue(new Error('Invalid credentials'));
    supabaseAuthSpy.toHumanErrorMessage.mockReturnValue('Correo o contraseña incorrectos');

    await component.onLogin();

    expect(toastrSpy.error).toHaveBeenCalledWith('Correo o contraseña incorrectos', 'Error de acceso');
    expect(component.isSubmitting).toBe(false);
  });
});
