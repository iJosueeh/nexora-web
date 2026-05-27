import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { SupabaseAuthService } from '../../../core/services/supabase-auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly supabaseAuth = inject(SupabaseAuthService);

  email = '';
  otpCode = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  isSendingCode = false;
  canReset = false;
  private sentFromQuery = false;
  private verifyInProgress = false;

  ngOnInit(): void {
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    this.sentFromQuery = this.route.snapshot.queryParamMap.get('sent') === '1';
    if (emailFromQuery) {
      this.email = emailFromQuery;
    }

    if (this.sentFromQuery) {
      this.toastr.success('Codigo enviado. Revisa tu correo y pegalo aqui.', 'Correo enviado');
    }

    this.toastr.info('Ingresa tu correo y el codigo que recibiste para continuar.', 'Verificacion requerida');
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting || !this.canReset) {
      return;
    }

    if (!this.password || this.password.length < 8) {
      this.toastr.error('La contrasena debe tener al menos 8 caracteres.', 'Contrasena invalida');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastr.error('Las contrasenas no coinciden.', 'Contrasena invalida');
      return;
    }

    this.isSubmitting = true;
    try {
      await this.supabaseAuth.updatePassword(this.password);
      await this.supabaseAuth.signOut();
      this.toastr.success('Tu contrasena fue actualizada. Inicia sesion con la nueva clave.', 'Contrasena actualizada');
      this.router.navigate(['/login']);
    } catch (error) {
      this.toastr.error(this.supabaseAuth.toHumanErrorMessage(error), 'No se pudo actualizar la contrasena');
    } finally {
      this.isSubmitting = false;
    }
  }

  async onVerifyRecoveryCode(): Promise<void> {
    if (this.verifyInProgress || this.canReset) {
      return;
    }

    const email = this.email.trim();
    const token = this.otpCode.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toastr.error('Ingresa un correo valido.', 'Correo invalido');
      return;
    }

    if (!/^\d{6,8}$/.test(token)) {
      this.toastr.error('Ingresa el codigo de recuperacion (6 a 8 digitos).', 'Codigo invalido');
      return;
    }

    this.verifyInProgress = true;
    try {
      await this.supabaseAuth.verifyRecoveryOtp(email, token);
      this.canReset = true;
    } catch (error) {
      this.toastr.error(this.supabaseAuth.toHumanErrorMessage(error), 'No se pudo verificar el codigo');
    } finally {
      this.verifyInProgress = false;
    }
  }

  async onResendRecoveryCode(): Promise<void> {
    if (this.isSendingCode) {
      return;
    }

    const email = this.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toastr.error('Ingresa un correo valido para reenviar el codigo.', 'Correo invalido');
      return;
    }

    this.isSendingCode = true;
    try {
      await this.supabaseAuth.sendPasswordResetEmail(email);
      this.toastr.success('Te enviamos un nuevo codigo/enlace de recuperacion.', 'Correo enviado');
    } catch (error) {
      this.toastr.error(this.supabaseAuth.toHumanErrorMessage(error), 'No se pudo reenviar el codigo');
    } finally {
      this.isSendingCode = false;
    }
  }

}
