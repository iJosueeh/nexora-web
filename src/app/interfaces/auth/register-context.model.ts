import { DestroyRef, WritableSignal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SupabaseAuthService } from '../../core/services/supabase-auth.service';
import { AuthSession } from '../../core/services/auth-session';
import { AuthApiService } from '../../features/auth/services/auth-api.service';
import { RegisterDraftStorageService } from '../../features/auth/register/services/register-draft-storage.service';
import { RegisterForm, RegisterAccountForm, RegisterIdentityForm, RegisterPreferencesForm, RegisterFormValue } from './register-form.model';
import { RegisterIdentityRequest } from './register-identity-request.model';
import { RegisterPreferencesRequest } from './register-preferences-request.model';
import { RegisterDraft } from './register-draft.model';

export interface RegisterStepFlow {
  prevStep(current: number): number;
  resolveStep(target: number, current: number, total: number, step1Valid: boolean, step2Valid: boolean): number;
}

export interface RegisterContext {
  readonly form: FormGroup<RegisterForm>;
  readonly accountForm: FormGroup<RegisterAccountForm>;
  readonly identityForm: FormGroup<RegisterIdentityForm>;
  readonly preferencesForm: FormGroup<RegisterPreferencesForm>;

  readonly currentStep: WritableSignal<number>;
  readonly isLoading: WritableSignal<boolean>;
  readonly isResendingEmail: WritableSignal<boolean>;
  readonly isVerifyingEmailOtp: WritableSignal<boolean>;
  readonly showEmailInboxGuide: WritableSignal<boolean>;
  readonly emailVerificationError: WritableSignal<string>;
  readonly verificationCode: WritableSignal<string>;
  readonly otpResetNonce: WritableSignal<number>;
  readonly resendCooldownSeconds: WritableSignal<number>;
  readonly draftExpiresAt: WritableSignal<number>;
  readonly draftRemainingMs: WritableSignal<number>;
  readonly careerOptions: WritableSignal<string[]>;
  readonly interestOptions: WritableSignal<string[]>;

  readonly supabaseAuth: SupabaseAuthService;
  readonly authSession: AuthSession;
  readonly authApi: AuthApiService;
  readonly toastr: ToastrService;
  readonly router: Router;
  readonly registerStepFlow: RegisterStepFlow;
  readonly registerDraftStorage: RegisterDraftStorageService;
  readonly destroyRef: DestroyRef;
  readonly draftSave$: Subject<void>;

  queueDraftSave(): void;
  markGroupTouched(group: AbstractControl): void;
  showStepValidationToast(): void;
  buildIdentityPayload(): RegisterIdentityRequest;
  buildPreferencesPayload(): RegisterPreferencesRequest;
  buildFallbackUser(): { email: string; fullName: string; username: string };
  patchDraftToForm(draft: RegisterDraft): void;
  buildDraftPayload(raw: RegisterFormValue): RegisterDraft;
  hasActiveDraft(): boolean;
  resetFormWithDefaults(): void;
  onVerifyEmailCode(token?: string): Promise<void>;
  submitAccountStep(): Promise<void>;
  submitIdentityStep(): void;
  submitPreferencesStep(): void;
}
