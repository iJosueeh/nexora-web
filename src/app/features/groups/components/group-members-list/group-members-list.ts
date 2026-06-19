import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { MemberService, GroupMember } from '../../services/member.service';

@Component({
  selector: 'app-group-members-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-members-list.html',
  styleUrl: './group-members-list.css',
})
export class GroupMembersListComponent implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly destroyRef = inject(DestroyRef);

  readonly groupId = input.required<string>();
  readonly currentUserId = input<string>('');

  readonly members = signal<GroupMember[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly error = signal('');
  readonly showRoleMenuFor = signal<string | null>(null);
  readonly showRemoveConfirmFor = signal<string | null>(null);

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.isLoading.set(true);
    this.memberService.getGroupMembers(this.groupId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (members) => {
          this.members.set(members);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  openRoleMenu(userId: string): void {
    this.showRoleMenuFor.set(userId);
    this.error.set('');
  }

  closeRoleMenu(): void {
    this.showRoleMenuFor.set(null);
  }

  changeRole(targetUserId: string, newRole: string): void {
    this.closeRoleMenu();
    this.isSubmitting.set(true);
    this.memberService.updateMemberRole(this.groupId(), targetUserId, newRole)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadMembers();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al cambiar rol');
        },
      });
  }

  openRemoveConfirm(userId: string): void {
    this.showRemoveConfirmFor.set(userId);
    this.error.set('');
  }

  closeRemoveConfirm(): void {
    this.showRemoveConfirmFor.set(null);
  }

  removeMember(targetUserId: string): void {
    this.closeRemoveConfirm();
    this.isSubmitting.set(true);
    this.memberService.removeMember(this.groupId(), targetUserId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (success) => {
          this.isSubmitting.set(false);
          if (success) {
            this.loadMembers();
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al remover miembro');
        },
      });
  }

  buildAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }

  isOwnerOrModerator(): boolean {
    const myRole = this.members().find(m => m.userId === this.currentUserId())?.role;
    return myRole === 'OWNER' || myRole === 'MODERATOR';
  }

  isOwnMembership(userId: string): boolean {
    return userId === this.currentUserId();
  }

  roleLabel(role: string): string {
    switch (role) {
      case 'OWNER': return 'Propietario';
      case 'MODERATOR': return 'Moderador';
      case 'MEMBER': return 'Miembro';
      default: return role;
    }
  }

  roleColor(role: string): string {
    switch (role) {
      case 'OWNER': return 'text-[#df3432]';
      case 'MODERATOR': return 'text-yellow-400';
      default: return 'text-white/50';
    }
  }
}
