import { Injectable, inject } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';

import { AuthSession } from './auth-session';
import { environment } from '../../../environments/environment';
import { normalizeEmail } from '../../utils/email-normalization.util';
import {
  buildSupabaseSessionResult,
  isEmailNotConfirmedError,
  toHumanSupabaseErrorMessage,
  SupabaseSignInResult,
  isResendRateLimitedError,
  isUserAlreadyConfirmedOrRegisteredError,
} from './helpers';
import { mapSupabaseSessionToTokens, isTokenExpired } from './helpers/auth-token-utils';

@Injectable({
  providedIn: 'root',
})
export class SupabaseAuthService {
  private client: SupabaseClient | null = null;
  private readonly authSession = inject(AuthSession);
  private readonly router = inject(Router);

  private normalizeEmail(email: string): string {
    return normalizeEmail(email);
  }

  toHumanErrorMessage(error: unknown): string {
    return toHumanSupabaseErrorMessage(error);
  }

  isEmailNotConfirmedError(error: unknown): boolean {
    return isEmailNotConfirmedError(error);
  }

  isResendRateLimitedError(error: unknown): boolean {
    return isResendRateLimitedError(error);
  }

  isUserAlreadyConfirmedOrRegisteredError(error: unknown): boolean {
    return isUserAlreadyConfirmedOrRegisteredError(error);
  }

  async signUpWithEmail(email: string, password: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    const { error } = await this.getClient().auth.signUp({
      email: normalizedEmail,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) throw error;
  }

  async resendSignupEmail(email: string): Promise<void> {
    const { error } = await this.getClient().auth.resend({
      type: 'signup',
      email: this.normalizeEmail(email),
    });
    if (error) throw error;
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await this.getClient().auth.resetPasswordForEmail(this.normalizeEmail(email), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  async hasActiveSession(): Promise<boolean> {
    const { data, error } = await this.getClient().auth.getSession();
    if (error) throw error;
    return !!data.session;
  }

  async getCurrentTokens(): Promise<SupabaseSignInResult['tokens'] | null> {
    const { data, error } = await this.getClient().auth.getSession();
    if (error || !data.session) return null;
    return mapSupabaseSessionToTokens(data.session);
  }

  async getValidTokens(): Promise<SupabaseSignInResult['tokens'] | null> {
    const { data, error } = await this.getClient().auth.getSession();
    if (error || !data.session) return null;

    if (!isTokenExpired(data.session.expires_at)) {
      return mapSupabaseSessionToTokens(data.session);
    }

    const refreshed = await this.getClient().auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      await this.expireSessionAndRedirect();
      return null;
    }

    const tokens = mapSupabaseSessionToTokens(refreshed.data.session);
    this.authSession.start({
      user: this.authSession.getUser() ?? {
        id: refreshed.data.user?.id,
        email: refreshed.data.user?.email ?? '',
      },
      tokens,
    });

    return tokens;
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.getClient().auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await this.getClient().auth.signOut();
    if (error) throw error;
  }

  async expireSessionAndRedirect(): Promise<void> {
    this.authSession.clear();
    await this.getClient().auth.signOut().catch(() => undefined);
    if (this.router.url !== '/login') {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  async signInWithEmail(email: string, password: string): Promise<SupabaseSignInResult> {
    const normalizedEmail = this.normalizeEmail(email);
    const { data, error } = await this.getClient().auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) throw error;
    if (!data.user?.email_confirmed_at) throw new Error('EMAIL_NOT_CONFIRMED');

    return buildSupabaseSessionResult(data.user.id, data.user.email ?? normalizedEmail, data.session);
  }

  async verifySignupOtp(email: string, token: string): Promise<SupabaseSignInResult> {
    const normalizedEmail = this.normalizeEmail(email);
    const { data, error } = await this.getClient().auth.verifyOtp({
      email: normalizedEmail,
      token,
      type: 'signup',
    });

    if (error) throw error;
    if (!data.user || !data.session) throw new Error('OTP_VERIFICATION_FAILED');

    return buildSupabaseSessionResult(data.user.id, data.user.email ?? normalizedEmail, data.session);
  }

  async verifyRecoveryOtp(email: string, token: string): Promise<SupabaseSignInResult> {
    const normalizedEmail = this.normalizeEmail(email);
    const { data, error } = await this.getClient().auth.verifyOtp({
      email: normalizedEmail,
      token,
      type: 'recovery',
    });

    if (error) throw error;
    if (!data.user || !data.session) throw new Error('RECOVERY_OTP_VERIFICATION_FAILED');

    return buildSupabaseSessionResult(data.user.id, data.user.email ?? normalizedEmail, data.session);
  }

  public getClient(): SupabaseClient {
    if (this.client) return this.client;
    const { supabaseUrl, supabaseAnonKey } = environment;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Falta configurar Supabase. Ejecuta "npm run sync:environment".');
    }

    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: `sb-${supabaseUrl.split('.')[0].split('//')[1]}-auth-token`
      },
    });
    return this.client;
  }
}
