import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MemberService, PendingMember } from '../../services/member.service';

@Component({
  selector: 'app-group-pending-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-pending-list.html',
  styleUrl: './group-pending-list.css',
})
export class GroupPendingListComponent implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly destroyRef = inject(DestroyRef);

  readonly groupId = input.required<string>();

  readonly pending = signal<PendingMember[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.isLoading.set(true);
    this.memberService.getPendingMembers(this.groupId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pending) => {
          this.pending.set(pending);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err?.message || 'Error al cargar solicitudes');
        },
      });
  }

  approve(membershipId: string): void {
    this.isSubmitting.set(true);
    this.memberService.approveMembership(this.groupId(), membershipId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadPending();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al aprobar');
        },
      });
  }

  reject(membershipId: string): void {
    this.isSubmitting.set(true);
    this.memberService.removeMember(this.groupId(), membershipId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadPending();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al rechazar');
        },
      });
  }

  buildAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }
}
