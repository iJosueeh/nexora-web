import { ChangeDetectionStrategy, Component, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import { AuthSession } from '../../../../../../core/services/auth-session';

@Component({
  selector: 'app-resource-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-create-form.html',
  styleUrl: './resource-create-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceCreateForm {
  private readonly researchService = inject(ResearchService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthSession);

  readonly cancelled = output<void>();
  readonly created = output<void>();

  readonly title = signal('');
  readonly summary = signal('');
  readonly faculty = signal('Sistemas');
  readonly pdfUrl = signal('');

  readonly faculties = signal([
    'Sistemas', 'Software', 'Industrial', 'Arquitectura',
    'Administración', 'Marketing'
  ]);
  readonly isSubmitting = signal(false);
  readonly error = signal('');

  submit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.title() || !this.summary()) {
      this.error.set('El título y el resumen son obligatorios');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    this.researchService.createPaper({
      title: this.title(),
      summary: this.summary(),
      faculty: this.faculty(),
      pdfUrl: this.pdfUrl() || undefined,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.created.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err?.message || 'Error al crear el recurso');
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
