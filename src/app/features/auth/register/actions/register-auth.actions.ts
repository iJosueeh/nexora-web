import { finalize, firstValueFrom } from 'rxjs';
import { normalizeEmail } from '../../../../utils/email-normalization.util';
import { RegisterContext, LoginResponse } from '../../../../interfaces/auth';

export async function submitAccountStep(ctx: RegisterContext): Promise<void> {
  if (ctx.accountForm.invalid) {
    ctx.markGroupTouched(ctx.accountForm);
    ctx.showStepValidationToast();
    return;
  }

  const email = normalizeEmail(ctx.accountForm.controls.email.value);
  const password = ctx.accountForm.controls.password.value;

  ctx.isLoading.set(true);
  try {
    await ctx.supabaseAuth.signUpWithEmail(email, password);

    ctx.showEmailInboxGuide.set(true);
    ctx.emailVerificationError.set('');
    ctx.verificationCode.set('');
    ctx.queueDraftSave();
    ctx.toastr.success('Revisa tu correo para validar la cuenta y continuar.', 'Correo enviado');
  } catch (error) {
    // Usuario ya registrado: intentar login y saltar a completar perfil
    if (ctx.supabaseAuth.isUserAlreadyConfirmedOrRegisteredError(error)) {
      await handleAlreadyRegisteredUser(ctx, email, password);
      return;
    }

    ctx.toastr.error(ctx.supabaseAuth.toHumanErrorMessage(error), 'Registro detenido');
  } finally {
    ctx.isLoading.set(false);
  }
}

async function handleAlreadyRegisteredUser(
  ctx: RegisterContext,
  email: string,
  password: string
): Promise<void> {
  try {
    const result = await ctx.supabaseAuth.signInWithEmail(email, password);
    ctx.authSession.start({ user: result.user, tokens: result.tokens }, false);

    const response = await firstValueFrom(ctx.authApi.getSessionProfile());
    if (response?.user?.profileComplete === false) {
      // Pre-poblar con datos existentes y saltar al paso de identidad
      const user = response.user;
      if (user.username) ctx.identityForm.controls.username.setValue(user.username);
      if (user.fullName) ctx.identityForm.controls.fullName.setValue(user.fullName);
      if (user.career) ctx.identityForm.controls.career.setValue(user.career);
      if (user.bio) ctx.preferencesForm.controls.bio.setValue(user.bio);
      if (user.academicInterests?.length) {
        ctx.preferencesForm.controls.selectedInterests.setValue([...user.academicInterests]);
      }
      ctx.currentStep.set(2);
      ctx.toastr.info('Completa tu perfil académico para continuar.', 'Perfil incompleto');
      return;
    }

    // Perfil ya completo: redirigir a feed
    ctx.toastr.success('Tu cuenta ya estaba registrada.', 'Bienvenido de nuevo');
    ctx.router.navigate(['/feed']);
  } catch {
    ctx.toastr.info(
      'Este correo ya está registrado. Inicia sesión para continuar.',
      'Cuenta existente'
    );
    ctx.router.navigate(['/login']);
  }
}

export async function onVerifyEmailCode(ctx: RegisterContext, token = ctx.verificationCode()): Promise<void> {
  const email = normalizeEmail(ctx.accountForm.controls.email.value);
  const cleanToken = token.replace(/\D/g, '').slice(0, 8);

  if (cleanToken.length !== 8) {
    ctx.emailVerificationError.set('Completa los 8 dígitos antes de verificar.');
    return;
  }

  ctx.isVerifyingEmailOtp.set(true);
  ctx.emailVerificationError.set('');
  let sessionStarted = false;

  try {
    const supabaseSession = await ctx.supabaseAuth.verifySignupOtp(email, cleanToken);

    ctx.authSession.start({ user: supabaseSession.user, tokens: supabaseSession.tokens }, false);
    sessionStarted = true;

    const sessionResponse: LoginResponse = await firstValueFrom(ctx.authApi.getSessionProfile());
    ctx.authSession.start(
      {
        user: {
          ...supabaseSession.user,
          ...(sessionResponse.user ?? { email: sessionResponse.email ?? email }),
        },
        tokens: supabaseSession.tokens,
      },
      false
    );

    if (sessionResponse.user?.profileComplete === true) {
      ctx.toastr.success('Tu cuenta ya tiene perfil completo.', 'Bienvenido');
      ctx.router.navigate(['/feed']);
      return;
    }

    ctx.showEmailInboxGuide.set(false);
    ctx.emailVerificationError.set('');
    ctx.verificationCode.set('');
    ctx.currentStep.set(2);
    ctx.queueDraftSave();
  } catch (error) {
    if (sessionStarted) {
      ctx.authSession.clear();
    }

    ctx.emailVerificationError.set(ctx.supabaseAuth.toHumanErrorMessage(error));
  } finally {
    ctx.isVerifyingEmailOtp.set(false);
  }
}

export async function onResendValidationEmail(ctx: RegisterContext): Promise<void> {
  if (ctx.accountForm.invalid || ctx.isResendingEmail() || ctx.resendCooldownSeconds() > 0) return;

  const email = normalizeEmail(ctx.accountForm.controls.email.value);
  ctx.isResendingEmail.set(true);
  ctx.emailVerificationError.set('');

  try {
    await ctx.supabaseAuth.resendSignupEmail(email);
    ctx.verificationCode.set('');
    ctx.otpResetNonce.update((value: number) => value + 1);
    ctx.resendCooldownSeconds.set(45);
    ctx.toastr.success('Te reenviamos el correo de verificación.', 'Correo reenviado');
  } catch (error) {
    if (ctx.supabaseAuth.isResendRateLimitedError(error)) {
      ctx.resendCooldownSeconds.set(60);
      ctx.emailVerificationError.set('Espera un minuto antes de solicitar otro código.');
      ctx.toastr.info('Espera unos segundos antes de reenviar nuevamente.', 'Límite temporal');
    } else if (ctx.supabaseAuth.isUserAlreadyConfirmedOrRegisteredError(error)) {
      ctx.toastr.info('Tu correo ya está confirmado. Inicia sesión para continuar.', 'Cuenta verificada');
      ctx.router.navigate(['/login']);
    } else {
      ctx.toastr.error(ctx.supabaseAuth.toHumanErrorMessage(error), 'Error');
    }
  } finally {
    ctx.isResendingEmail.set(false);
  }
}

export function submitIdentityStep(ctx: RegisterContext): void {
  if (ctx.identityForm.invalid) {
    ctx.markGroupTouched(ctx.identityForm);
    ctx.showStepValidationToast();
    return;
  }

  const payload = ctx.buildIdentityPayload();

  ctx.isLoading.set(true);
  ctx.authApi
    .completeRegistrationIdentity(payload)
    .pipe(finalize(() => ctx.isLoading.set(false)))
    .subscribe({
      next: () => {
        ctx.currentStep.set(3);
        ctx.queueDraftSave();
        ctx.toastr.success('Tu identidad académica fue guardada.', 'Paso 2 completado');
      },
      error: () => ctx.toastr.error('No se pudo guardar tu identidad. Intenta nuevamente.', 'Error'),
    });
}

