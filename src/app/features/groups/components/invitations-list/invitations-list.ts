import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InvitationService, GroupInvitation } from '../../services/invitation.service';

@Component({
  selector: 'app-invitations-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invitations-list.html',
  styleUrl: './invitations-list.css',
})
export class InvitationsListComponent implements OnInit {
  readonly invitations = signal<GroupInvitation[]>([]);
  readonly isLoading = signal(true);
  readonly processingIds = signal<Set<string>>(new Set());

  private readonly invitationService = inject(InvitationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.isLoading.set(true);
    this.invitationService.getInvitationsReceived('PENDING')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (invitations) => {
          this.invitations.set(invitations);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  acceptInvitation(invitation: GroupInvitation): void {
    this.processingIds.update(ids => new Set(ids).add(invitation.invitationId));

    this.invitationService.acceptInvitation(invitation.invitationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (success) => {
          this.processingIds.update(ids => {
            const newIds = new Set(ids);
            newIds.delete(invitation.invitationId);
            return newIds;
          });
          if (success) {
            this.invitations.update(list =>
              list.filter(i => i.invitationId !== invitation.invitationId)
            );
            void this.router.navigate(['/groups', invitation.groupSlug]);
          }
        },
        error: () => {
          this.processingIds.update(ids => {
            const newIds = new Set(ids);
            newIds.delete(invitation.invitationId);
            return newIds;
          });
        },
      });
  }

  rejectInvitation(invitation: GroupInvitation): void {
    this.processingIds.update(ids => new Set(ids).add(invitation.invitationId));

    this.invitationService.rejectInvitation(invitation.invitationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (success) => {
          this.processingIds.update(ids => {
            const newIds = new Set(ids);
            newIds.delete(invitation.invitationId);
            return newIds;
          });
          if (success) {
            this.invitations.update(list =>
              list.filter(i => i.invitationId !== invitation.invitationId)
            );
          }
        },
        error: () => {
          this.processingIds.update(ids => {
            const newIds = new Set(ids);
            newIds.delete(invitation.invitationId);
            return newIds;
          });
        },
      });
  }

  isProcessing(invitationId: string): boolean {
    return this.processingIds().has(invitationId);
  }

  buildAvatarUrl(username: string | null): string {
    if (!username) return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
  }
}
