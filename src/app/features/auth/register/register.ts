import { Component, ChangeDetectionStrategy, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthSession } from '../../../core/services/auth-session';
import { SupabaseAuthService } from '../../../core/services/supabase-auth.service';
import { RegisterForm, RegisterDraft, RegisterIdentityRequest, RegisterPreferencesRequest, RegisterFormValue } from '../../../interfaces/auth';
import { Loading } from '../../../shared/components/loading/loading';
import { AuthApiService } from '../services/auth-api.service';
import { RegisterAccountStep } from './components/register-account-step/register-account-step';
import { RegisterEmailCheckStep } from './components/register-email-check-step/register-email-check-step';
import { RegisterIdentityStep } from './components/register-identity-step/register-identity-step';
import { RegisterPreferencesStep } from './components/register-preferences-step/register-preferences-step';
import {
  goToLogin,
  goToStep,
  isCurrentStepValid,
  loadRegistrationCatalogs,
  markGroupTouched,
  nextStep,
  onResendValidationEmail,
  onVerificationCodeChange,
  onVerifyEmailCode,
  persistDraft,
  prevStep,
  queueDraftSave,
  restoreDraft,
  showStepValidationToast,
  startDraftCountdown,
  submitAccountStep,
  submitIdentityStep,
  submitPreferencesStep,
} from './actions';
import { createRegisterState } from './state';
import { RegisterDraftStorageService } from './services/register-draft-storage.service';
import { RegisterStepFlowService } from './services/register-step-flow.service';
import {
  buildDraftPayload,
  buildFallbackUser,
  buildIdentityPayload,
  buildPreferencesPayload,
  patchDraftToForm,
  resetFormWithDefaults,
} from './helpers';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Loading,
    RegisterAccountStep,
    RegisterEmailCheckStep,
    RegisterIdentityStep,
    RegisterPreferencesStep,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  readonly toastr = inject(ToastrService);
  readonly authApi = inject(AuthApiService);
  readonly supabaseAuth = inject(SupabaseAuthService);
  readonly authSession = inject(AuthSession);
  readonly registerDraftStorage = inject(RegisterDraftStorageService);
  readonly registerStepFlow = inject(RegisterStepFlowService);
  readonly destroyRef = inject(DestroyRef);
  readonly draftSave$ = new Subject<void>();

  private readonly state = createRegisterState(this.fb);

  readonly stepLabels = this.state.stepLabels;
  readonly careerOptions = this.state.careerOptions;
  readonly interestOptions = this.state.interestOptions;
  readonly currentStep = this.state.currentStep;
  readonly isLoading = this.state.isLoading;
  readonly isResendingEmail = this.state.isResendingEmail;
  readonly isVerifyingEmailOtp = this.state.isVerifyingEmailOtp;
  readonly showEmailInboxGuide = this.state.showEmailInboxGuide;
  readonly emailVerificationError = this.state.emailVerificationError;
  readonly verificationCode = this.state.verificationCode;
  readonly otpResetNonce = this.state.otpResetNonce;
  readonly resendCooldownSeconds = this.state.resendCooldownSeconds;
  readonly loadingMessage = this.state.loadingMessage;
  readonly form = this.state.form as unknown as FormGroup<RegisterForm>;
  readonly accountForm = this.form.controls.account;
  readonly identityForm = this.form.controls.identity;
  readonly preferencesForm = this.form.controls.preferences;
  readonly draftExpiresAt = this.state.draftExpiresAt;
  readonly draftRemainingMs = this.state.draftRemainingMs;
  readonly hasActiveDraft = this.state.hasActiveDraft;
  readonly draftTimeLeftLabel = this.state.draftTimeLeftLabel;
  readonly primaryActionLabel = this.state.primaryActionLabel;
  readonly backDisabled = this.state.backDisabled;

  ngOnInit(): void {
    void loadRegistrationCatalogs(this);
    restoreDraft(this);
    startDraftCountdown(this);

    this.form.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => persistDraft(this));

    this.draftSave$
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => persistDraft(this));
  }

  nextStep(): void { nextStep(this); }
  prevStep(): void { prevStep(this); }
  goToStep(step: number): void { goToStep(this, step); }
  isCurrentStepValid(): boolean { return isCurrentStepValid(this); }
  goToLogin(): void { goToLogin(this); }
  onVerificationCodeChange(value: string): void { onVerificationCodeChange(this, value); }

  submitAccountStep(): Promise<void> { return submitAccountStep(this); }
  onVerifyEmailCode(token = this.verificationCode()): Promise<void> { return onVerifyEmailCode(this, token); }
  onResendValidationEmail(): Promise<void> { return onResendValidationEmail(this); }
  submitIdentityStep(): void { submitIdentityStep(this); }
  submitPreferencesStep(): void { submitPreferencesStep(this); }

  onEmailGuideEdit(): void {
    this.showEmailInboxGuide.set(false);
    this.verificationCode.set('');
    this.emailVerificationError.set('');
    queueDraftSave(this);
  }

  queueDraftSave(): void { queueDraftSave(this); }
  markGroupTouched(group: AbstractControl): void { markGroupTouched(group); }
  showStepValidationToast(): void { showStepValidationToast(this); }

  buildIdentityPayload(): RegisterIdentityRequest {
    return buildIdentityPayload(this);
  }

  buildPreferencesPayload(): RegisterPreferencesRequest {
    return buildPreferencesPayload(this);
  }

  buildFallbackUser(): { email: string; fullName: string; username: string } {
    return buildFallbackUser(this);
  }

  patchDraftToForm(draft: RegisterDraft): void {
    patchDraftToForm(this, draft);
  }

  buildDraftPayload(raw: RegisterFormValue): RegisterDraft {
    return buildDraftPayload(this, raw);
  }

  resetFormWithDefaults(): void {
    resetFormWithDefaults(this);
  }
}
