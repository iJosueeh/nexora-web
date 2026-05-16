import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthSession } from '../../../core/services/auth-session';
import { SupabaseAuthService } from '../../../core/services/supabase-auth.service';
import { Loading } from '../../../shared/components/loading/loading';
import { LOADING_MESSAGES } from '../../../shared/constants/loading-messages';
import { AuthApiService } from '../services/auth-api.service';
import { normalizeEmail } from '../../../utils/email-normalization.util';

import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgClass, Loading],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private static readonly LOGIN_TIMEOUT_MS = 12_000;
  private static readonly LOADING_FAILSAFE_MS = 20_000;

  activeTab: 'login' | 'signup' = 'login';

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = signal(false);
  isSubmitting = false;
  readonly loadingMessage = LOADING_MESSAGES.AUTH.LOGIN_VALIDATING;

  private loadingFailsafeId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    private readonly authApi: AuthApiService,
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly toastr: ToastrService,
    private readonly authSession: AuthSession,
    private readonly permissionService: PermissionService
  ) { }

  goToSignUp(): void {
    if (this.isSubmitting) return;
    this.router.navigate(['/register']);
  }

  setLoginTab(): void {
    if (this.isSubmitting) return;
    this.activeTab = 'login';
  }

  toggleShowPassword(): void {
    if (this.isSubmitting) return;
    this.showPassword = !this.showPassword;
  }

  toggleRememberMe(): void {
    if (this.isSubmitting) return;
    this.rememberMe = !this.rememberMe;
  }

  async onLogin(): Promise<void> {
    if (!this.email || !this.password || this.isSubmitting) return;

    const email = normalizeEmail(this.email);
    const password = this.password;
    this.email = email;

    this.isSubmitting = true;
    this.setLoading(true);
    let sessionStarted = false;
    try {
      const supabaseSession = await this.withTimeout(
        this.supabaseAuth.signInWithEmail(email, password),
        Login.LOGIN_TIMEOUT_MS,
        'LOGIN_TIMEOUT'
      );

      this.authSession.start(
        {
          user: supabaseSession.user,
          tokens: supabaseSession.tokens,
        },
        this.rememberMe
      );
      sessionStarted = true;

      const response = await firstValueFrom(
        this.authApi.getSessionProfile().pipe(
          timeout(8000),
          catchError((error) => {
            console.error('Error fetching session profile:', error);
            return of(null);
          })
        )
      );

      if (!response) {
        if (sessionStarted) {
          this.authSession.clear();
          await this.supabaseAuth.signOut().catch(() => undefined);
          sessionStarted = false;
        }

        this.toastr.error(
          'No se pudo validar tu perfil con el servidor. Intenta nuevamente en unos segundos.',
          'Acceso denegado temporalmente'
        );
        return;
      }

      this.authSession.mergeUser(
        {
          ...supabaseSession.user,
          ...(response.user ?? { email: response.email ?? email }),
        },
        this.rememberMe
      );

      const isManagementUser = this.permissionService.isOfficialOrAdmin();

      if (response.user?.profileComplete === false && !isManagementUser) {
        this.toastr.info('Completa tu perfil academico para continuar.', 'Perfil incompleto');
        this.router.navigate(['/register']);
        return;
      }

      this.toastr.success('Inicio de sesión exitoso.', 'Bienvenido');
      
      // Prioritize management dashboard for admins and officials
      if (isManagementUser) {
        this.router.navigate(['/management']);
      } else {
        this.router.navigate(['/feed']);
      }
    } catch (error: any) {
      if (sessionStarted) {
        this.authSession.clear();
      }

      const isTimeoutError = error instanceof Error && error.message === 'LOGIN_TIMEOUT';
      
      // Detailed error logging for debugging
      console.error('Login error:', error);

      let message = this.supabaseAuth.toHumanErrorMessage(error);
      
      if (isTimeoutError) {
        message = 'La validacion tardo demasiado. Revisa tu conexion e intenta nuevamente.';
      } else if (this.supabaseAuth.isEmailNotConfirmedError(error)) {
        message = 'Debes confirmar tu correo institucional antes de iniciar sesión.';
      } else if (error?.status === 400 || error?.message?.includes('Invalid login credentials')) {
        message = 'Correo o contraseña incorrectos. Verifica tus datos.';
      }

      this.toastr.error(message, 'Error de acceso');
    } finally {
      this.setLoading(false);
      this.isSubmitting = false;
    }
  }

  private setLoading(value: boolean): void {
    this.isLoading.set(value);

    if (this.loadingFailsafeId) {
      clearTimeout(this.loadingFailsafeId);
      this.loadingFailsafeId = null;
    }

    if (value) {
      this.loadingFailsafeId = setTimeout(() => {
        this.isLoading.set(false);
      }, Login.LOADING_FAILSAFE_MS);
    }
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorCode: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error(errorCode)), timeoutMs);

      promise
        .then((value) => {
          clearTimeout(timeoutId);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
}
