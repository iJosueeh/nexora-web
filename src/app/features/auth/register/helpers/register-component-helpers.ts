import { RegisterContext, RegisterIdentityRequest, RegisterPreferencesRequest, RegisterDraft, RegisterFormValue } from '../../../../interfaces/auth';

export function buildIdentityPayload(ctx: RegisterContext): RegisterIdentityRequest {
  return {
    email: ctx.accountForm.controls.email.value.trim(),
    username: ctx.identityForm.controls.username.value.trim(),
    fullName: ctx.identityForm.controls.fullName.value.trim(),
    career: ctx.identityForm.controls.career.value,
  };
}

export function buildPreferencesPayload(ctx: RegisterContext): RegisterPreferencesRequest {
  return {
    email: ctx.accountForm.controls.email.value.trim(),
    bio: ctx.preferencesForm.controls.bio.value.trim(),
    academicInterests: [...ctx.preferencesForm.controls.selectedInterests.value],
    isActive: ctx.preferencesForm.controls.isActive.value,
    acceptedTerms: ctx.preferencesForm.controls.acceptedTerms.value,
  };
}

export function buildFallbackUser(ctx: RegisterContext): { email: string; fullName: string; username: string } {
  return {
    email: ctx.accountForm.controls.email.value.trim(),
    fullName: ctx.identityForm.controls.fullName.value.trim(),
    username: ctx.identityForm.controls.username.value.trim(),
  };
}

export function patchDraftToForm(ctx: RegisterContext, draft: RegisterDraft): void {
  ctx.form.patchValue(
    {
      account: { email: draft.email, password: draft.password, confirmPassword: draft.confirmPassword },
      identity: { username: draft.firstName, fullName: draft.lastName, career: draft.career },
      preferences: {
        bio: draft.bio,
        selectedInterests: draft.selectedInterests,
        isActive: draft.isActive,
        acceptedTerms: draft.acceptedTerms,
      },
    },
    { emitEvent: false }
  );
}

export function buildDraftPayload(ctx: RegisterContext, raw: RegisterFormValue): RegisterDraft {
  return {
    email: raw.account.email,
    password: raw.account.password,
    confirmPassword: raw.account.confirmPassword,
    isEmailGuideVisible: ctx.showEmailInboxGuide(),
    firstName: raw.identity.username,
    lastName: raw.identity.fullName,
    career: raw.identity.career,
    bio: raw.preferences.bio,
    selectedInterests: raw.preferences.selectedInterests,
    isActive: raw.preferences.isActive,
    acceptedTerms: raw.preferences.acceptedTerms,
    currentStep: ctx.currentStep(),
    expiresAt: ctx.draftExpiresAt(),
  };
}

export function resetFormWithDefaults(ctx: RegisterContext): void {
  ctx.form.reset(
    {
      account: { email: '', password: '', confirmPassword: '' },
      identity: { username: '', fullName: '', career: '' },
      preferences: { bio: '', selectedInterests: [], isActive: true, acceptedTerms: false },
    },
    { emitEvent: false }
  );

  ctx.form.markAsPristine();
  ctx.form.markAsUntouched();
}

