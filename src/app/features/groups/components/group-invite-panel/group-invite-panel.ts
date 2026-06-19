import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InvitationService, GroupInvitation, UserSearchResult } from '../../services/invitation.service';

@Component({
  selector: 'app-group-invite-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-invite-panel.html',
  styleUrl: './group-invite-panel.css',
})
export class GroupInvitePanelComponent implements OnInit {
  readonly groupId = input.required<string>();
  readonly inviterUserId = input<string>('');

  readonly pendingInvitations = signal<GroupInvitation[]>([]);
  readonly searchQuery = signal('');
  readonly searchResults = signal<UserSearchResult[]>([]);
  readonly isSearching = signal(false);
  readonly selectedUser = signal<UserSearchResult | null>(null);
  readonly showDropdown = signal(false);
  readonly isSubmitting = signal(false);
  readonly isCancelling = signal(false);
  readonly error = signal('');
  readonly successMessage = signal('');

  private readonly searchInput$ = new Subject<string>();
  private readonly invitationService = inject(InvitationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadPendingInvitations();

    this.invitationService.searchUsersDebounced(this.searchInput$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.isSearching.set(false);
          this.showDropdown.set(results.length > 0 && !this.selectedUser());
        },
        error: () => {
          this.isSearching.set(false);
        },
      });
  }

  loadPendingInvitations(): void {
    this.invitationService.getGroupInvitations(this.groupId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (invitations) => {
          this.pendingInvitations.set(invitations.filter(i => i.status === 'PENDING'));
        },
      });
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.selectedUser.set(null);
    this.error.set('');
    this.successMessage.set('');

    const trimmed = value.trim();
    if (trimmed.length >= 2) {
      this.isSearching.set(true);
      this.searchInput$.next(trimmed);
    } else {
      this.searchResults.set([]);
      this.showDropdown.set(false);
    }
  }

  selectUser(user: UserSearchResult): void {
    this.selectedUser.set(user);
    this.searchQuery.set(user.username);
    this.showDropdown.set(false);
    this.searchResults.set([]);
    this.error.set('');
  }

  clearSelection(): void {
    this.selectedUser.set(null);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showDropdown.set(false);
    this.error.set('');
    this.successMessage.set('');
  }

  inviteUser(): void {
    const user = this.selectedUser();
    if (!user) {
      this.error.set('Selecciona un usuario de la lista');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.invitationService.inviteMember(this.groupId(), user.username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (invitation) => {
          this.isSubmitting.set(false);
          if (invitation) {
            this.successMessage.set(`Invitación enviada a @${user.username}`);
            this.clearSelection();
            this.loadPendingInvitations();
          } else {
            this.error.set('No se pudo enviar la invitación');
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al enviar la invitación');
        },
      });
  }

  cancelInvitation(invitation: GroupInvitation): void {
    this.isCancelling.set(true);
    this.error.set('');

    this.invitationService.cancelInvitation(invitation.invitationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (success) => {
          this.isCancelling.set(false);
          if (success) {
            this.loadPendingInvitations();
          } else {
            this.error.set('Error al cancelar la invitación');
          }
        },
        error: (err) => {
          this.isCancelling.set(false);
          this.error.set(err?.message || 'Error al cancelar la invitación');
        },
      });
  }

  onBlur(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  buildAvatarUrl(username: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
  }
}
