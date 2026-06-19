import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InvitationService } from '../../services/invitation.service';

@Component({
  selector: 'app-group-invite-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-invite-panel.html',
  styleUrl: './group-invite-panel.css',
})
export class GroupInvitePanelComponent {
  readonly groupId = input.required<string>();
  readonly inviterUserId = input<string>('');

  readonly inviteSent = signal(false);
  readonly isSubmitting = signal(false);
  readonly searchUsername = signal('');
  readonly error = signal('');
  readonly successMessage = signal('');

  private readonly invitationService = inject(InvitationService);
  private readonly destroyRef = inject(DestroyRef);

  inviteUser(): void {
    const username = this.searchUsername().trim();
    if (!username) {
      this.error.set('Ingresa un nombre de usuario');
      return;
    }

    if (username.length < 3) {
      this.error.set('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.invitationService.inviteMember(this.groupId(), username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (invitation) => {
          this.isSubmitting.set(false);
          if (invitation) {
            this.successMessage.set(`Invitación enviada a @${username}`);
            this.searchUsername.set('');
            this.inviteSent.set(true);
          } else {
            this.error.set('No se pudo enviar la invitación');
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const message = err?.message || 'Error al enviar la invitación';
          if (message.includes('no encontrado')) {
            this.error.set('Usuario no encontrado');
          } else if (message.includes('ya es miembro')) {
            this.error.set('El usuario ya es miembro del grupo');
          } else if (message.includes('ya existe')) {
            this.error.set('Ya existe una invitación para este usuario');
          } else {
            this.error.set(message);
          }
        },
      });
  }

  clearMessages(): void {
    this.error.set('');
    this.successMessage.set('');
    this.inviteSent.set(false);
  }
}
