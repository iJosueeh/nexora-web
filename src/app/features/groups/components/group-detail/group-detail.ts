import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthSession } from '../../../../core/services/auth-session';
import { FeedSidebar } from '../../../feed/components/feed-sidebar/feed-sidebar';
import { ShellLayout } from '../../../../shared/components/shell-layout/shell-layout';
import { GroupService } from '../../services/group.service';
import { StudyGroup } from '../../interfaces/group.model';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, FeedSidebar, ShellLayout],
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

  readonly group = signal<StudyGroup | null>(null);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly error = signal('');

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
}
