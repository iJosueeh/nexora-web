import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { AuthSession } from '../../../../core/services/auth-session';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-group-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-create-form.html',
  styleUrl: './group-create-form.css',
})
export class GroupCreateForm {
  private readonly groupService = inject(GroupService);
  private readonly auth = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cancelled = output<void>();
  readonly created = output<void>();

  readonly name = signal('');
  readonly description = signal('');
  readonly category = signal('General');
  readonly isPrivate = signal(false);
  readonly maxMembers = signal(50);
  readonly isSubmitting = signal(false);
  readonly error = signal('');

  readonly categories = signal([
    'General', 'Programacion', 'Matematicas', 'Fisica', 'Diseno'
  ]);

  submit(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.name() || this.name().length < 3) {
      this.error.set('El nombre debe tener al menos 3 caracteres');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    this.groupService.createGroup({
      name: this.name(),
      description: this.description() || undefined,
      category: this.category(),
      isPrivate: this.isPrivate(),
      maxMembers: this.maxMembers(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (group) => {
          this.isSubmitting.set(false);
          if (group) {
            this.created.emit();
          } else {
            this.error.set('Error al crear el grupo');
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al crear el grupo');
        },
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
