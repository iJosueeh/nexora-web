import { AbstractControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, firstValueFrom, interval } from 'rxjs';
import { RegisterContext } from '../../../../interfaces/auth';

export function submitPreferencesStep(ctx: RegisterContext): void {
  if (ctx.preferencesForm.invalid) {
    markGroupTouched(ctx.preferencesForm);
    showStepValidationToast(ctx);
    return;
  }

  const payload = ctx.buildPreferencesPayload();
  const fallbackUser = (ctx as any).buildFallbackUser();

  ctx.isLoading.set(true);
  ctx.authApi
    .completeRegistrationPreferences(payload)
    .pipe(finalize(() => ctx.isLoading.set(false)))
    .subscribe({
      next: (response: any) => {
        const email = ctx.accountForm.controls.email.value.trim();
        const existingTokens = ctx.authSession.getTokens() ?? undefined;
        const existingUser = ctx.authSession.getUser() ?? { email };

        ctx.authSession.start(
          {
            user: { ...existingUser, ...(response.user ?? fallbackUser), profileComplete: true },
            tokens: existingTokens!,
          },
          false
        );

        (ctx as any).registerDraftStorage.clear();
        ctx.draftExpiresAt.set(0);
        ctx.draftRemainingMs.set(0);
        resetFormState(ctx);
        ctx.toastr.success('Tu perfil académico quedó listo.', 'Registro completado');
        ctx.router.navigate(['/feed']);
      },
      error: () => ctx.toastr.error('No se pudo completar el perfil. Intenta nuevamente.', 'Error'),
    });
}

export async function loadRegistrationCatalogs(ctx: RegisterContext): Promise<void> {
  try {
    const catalogs: any = await firstValueFrom(ctx.authApi.getRegistrationCatalogs());
    if (catalogs.careers.length > 0) (ctx as any).careerOptions.set(catalogs.careers);
    if (catalogs.academicInterests.length > 0) (ctx as any).interestOptions.set(catalogs.academicInterests);
  } catch {
    // Keep local fallback lists if catalogs cannot be loaded.
  }
}

export function restoreDraft(ctx: RegisterContext): void {
  const draft = (ctx as any).registerDraftStorage.load();
  if (!draft) return;

  ctx.patchDraftToForm(draft);
  const maxStep = 3;

  ctx.currentStep.set(Math.min(Math.max(draft.currentStep, 1), maxStep));
  ctx.showEmailInboxGuide.set(draft.isEmailGuideVisible && draft.currentStep === 1);
  ctx.verificationCode.set('');
  ctx.emailVerificationError.set('');
  ctx.draftExpiresAt.set(draft.expiresAt);
  updateDraftRemainingMs(ctx);

  if ((ctx as any).hasActiveDraft()) {
    ctx.toastr.info('Se restauró tu borrador de registro.', 'Draft recuperado');
  }
}

export function persistDraft(ctx: RegisterContext): void {
  const raw = ctx.form.getRawValue();
  ctx.draftExpiresAt.set((ctx as any).registerDraftStorage.save(ctx.buildDraftPayload(raw)));
  updateDraftRemainingMs(ctx);
}

export function startDraftCountdown(ctx: RegisterContext): void {
  interval(1000)
    .pipe(takeUntilDestroyed((ctx as any).destroyRef))
    .subscribe(() => handleDraftTick(ctx));
}

export function queueDraftSave(ctx: RegisterContext): void {
  (ctx as any).draftSave$.next();
}

export function markGroupTouched(group: AbstractControl): void {
  group.markAllAsTouched();
}

export function showStepValidationToast(ctx: RegisterContext): void {
  switch (ctx.currentStep()) {
    case 1:
      if (isControlInvalid(ctx.accountForm.controls.email)) {
        ctx.toastr.error('Usa un correo institucional válido con dominio @utp.edu.pe.', 'Correo inválido');
        return;
      }

      if (ctx.accountForm.errors?.['passwordMismatch']) {
        ctx.toastr.error('Las contraseñas no coinciden.', 'Contraseña inválida');
        return;
      }

      ctx.toastr.error('Completa el correo y la contraseña para continuar.', 'Faltan datos');
      return;
    case 2:
      ctx.toastr.error('Completa tu nombre de usuario y nombre completo para seguir.', 'Faltan datos');
      return;
    default:
      ctx.toastr.error('Selecciona tus intereses y acepta los términos para finalizar.', 'Faltan datos');
  }
}

function handleDraftTick(ctx: RegisterContext): void {
  if (ctx.resendCooldownSeconds() > 0) {
    ctx.resendCooldownSeconds.update((value: number) => Math.max(0, value - 1));
  }

  if (!ctx.draftExpiresAt()) return;
  updateDraftRemainingMs(ctx);
  if (ctx.draftRemainingMs() > 0) return;

  (ctx as any).registerDraftStorage.clear();
  ctx.draftExpiresAt.set(0);
  ctx.toastr.warning('El borrador del registro expiró tras 30 minutos.', 'Draft expirado');
}

function updateDraftRemainingMs(ctx: RegisterContext): void {
  ctx.draftRemainingMs.set(Math.max(ctx.draftExpiresAt() - Date.now(), 0));
}

function resetFormState(ctx: RegisterContext): void {
  (ctx as any).resetFormWithDefaults();
  ctx.currentStep.set(1);
  ctx.showEmailInboxGuide.set(false);
  ctx.verificationCode.set('');
  ctx.emailVerificationError.set('');
}

function isControlInvalid(control: AbstractControl | null): boolean {
  return !!control && control.invalid && (control.dirty || control.touched);
}

