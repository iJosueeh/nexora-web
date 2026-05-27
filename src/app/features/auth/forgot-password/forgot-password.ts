import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { SupabaseAuthService } from '../../../core/services/supabase-auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly supabaseAuth = inject(SupabaseAuthService);

  email = '';
  isSubmitting = false;

  async onSubmit(): Promise<void> {
    if (!this.email || this.isSubmitting) {
      return;
    }

    const email = this.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toastr.error('Ingresa un correo valido para continuar.', 'Correo invalido');
      return;
    }

    this.isSubmitting = true;
    try {
      await this.supabaseAuth.sendPasswordResetEmail(email);
      await this.router.navigate(['/reset-password'], {
        queryParams: {
          email,
          sent: '1',
        },
      });
    } catch (error) {
      this.toastr.error(this.supabaseAuth.toHumanErrorMessage(error), 'No se pudo enviar el correo');
    } finally {
      this.isSubmitting = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
