import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthSession } from '../../../../core/services/auth-session';
import { FeedSidebar } from '../../../feed/components/feed-sidebar/feed-sidebar';
import { ShellLayout } from '../../../../shared/components/shell-layout/shell-layout';
import { GroupService } from '../../services/group.service';
import { GroupMembersListComponent } from '../group-members-list/group-members-list';
import { GroupPendingListComponent } from '../group-pending-list/group-pending-list';
import { StudyGroup, UpdateStudyGroupInput } from '../../interfaces/group.model';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FeedSidebar, ShellLayout, GroupMembersListComponent, GroupPendingListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-detail.html',
  styleUrl: './group-detail.css',
})
export class GroupDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly auth = inject(AuthSession);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly Math = Math;

  readonly group = signal<StudyGroup | null>(null);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly isEditing = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly showMembers = signal(false);
  readonly membersTab = signal<'members' | 'pending'>('members');
  readonly error = signal('');

  readonly editName = signal('');
  readonly editDescription = signal('');
  readonly editCategory = signal('');
  readonly editMaxMembers = signal(50);
  readonly editIsPrivate = signal(false);

  readonly categories = signal([
    'General', 'Programacion', 'Matematicas', 'Fisica', 'Diseno'
  ]);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const slug = params.get('slug');
        if (slug) {
          this.loadGroup(slug);
        }
      });
  }

  loadGroup(slug: string): void {
    this.isLoading.set(true);
    this.groupService.getGroupBySlug(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (group) => {
          this.group.set(group);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.router.navigate(['/groups']);
        },
      });
  }

  startEditing(): void {
    const g = this.group();
    if (!g) return;
    this.editName.set(g.name);
    this.editDescription.set(g.description || '');
    this.editCategory.set(g.category);
    this.editMaxMembers.set(g.maxMembers);
    this.editIsPrivate.set(false);
    this.isEditing.set(true);
    this.error.set('');
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.error.set('');
  }

  saveEdit(): void {
    const g = this.group();
    if (!g) return;

    if (this.editName().length < 3) {
      this.error.set('El nombre debe tener al menos 3 caracteres');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    const input: UpdateStudyGroupInput = {
      name: this.editName(),
      description: this.editDescription() || undefined,
      category: this.editCategory(),
      maxMembers: this.editMaxMembers(),
      isPrivate: this.editIsPrivate(),
    };

    this.groupService.updateGroup(g.id, input)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          if (updated) {
            this.isEditing.set(false);
            this.group.set(updated);
          } else {
            this.error.set('Error al guardar los cambios');
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al guardar los cambios');
        },
      });
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  executeDelete(): void {
    const g = this.group();
    if (!g) return;

    this.isSubmitting.set(true);
    this.error.set('');

    this.groupService.deleteGroup(g.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (success) => {
          this.isSubmitting.set(false);
          if (success) {
            void this.router.navigate(['/groups']);
          } else {
            this.error.set('Error al eliminar el grupo');
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al eliminar el grupo');
        },
      });
  }

  joinGroup(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const g = this.group();
    if (!g) return;

    this.isSubmitting.set(true);
    this.error.set('');

    this.groupService.joinGroup(g.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (membership) => {
          this.isSubmitting.set(false);
          if (membership) {
            this.loadGroup(g.slug);
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al unirse al grupo');
        },
      });
  }

  leaveGroup(): void {
    const g = this.group();
    if (!g) return;

    this.isSubmitting.set(true);
    this.error.set('');

    this.groupService.leaveGroup(g.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadGroup(g.slug);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al salir del grupo');
        },
      });
  }

  goBack(): void {
    void this.router.navigate(['/groups']);
  }

  toggleMembers(): void {
    this.showMembers.update(v => !v);
    this.error.set('');
  }

  setMembersTab(tab: 'members' | 'pending'): void {
    this.membersTab.set(tab);
  }

  currentUserId(): string {
    return this.auth.getUser()?.id || '';
  }
}
