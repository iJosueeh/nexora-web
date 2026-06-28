import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { AuthSession } from '../../core/services/auth-session';
import { FeedSidebar } from '../feed/components/feed-sidebar/feed-sidebar';
import { ShellLayout } from '../../shared/components/shell-layout/shell-layout';
import { GroupService } from './services/group.service';
import { GroupCard } from './components/group-card/group-card';
import { GroupCreateForm } from './components/group-create-form/group-create-form';
import { StudyGroup } from './interfaces/group.model';

@Component({
  selector: 'app-groups-page',
  standalone: true,
  imports: [CommonModule, FeedSidebar, ShellLayout, GroupCard, GroupCreateForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './groups-page.html',
  styleUrl: './groups-page.css',
})
export class GroupsPage implements OnInit {
  private readonly groupService = inject(GroupService);
  private readonly auth = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly groups = signal<StudyGroup[]>([]);
  readonly isLoading = signal(true);
  readonly showCreateForm = signal(false);
  readonly selectedCategory = signal('Todos');

  readonly categories = signal([
    'Todos', 'Programacion', 'Matematicas', 'Fisica', 'Diseno', 'General'
  ]);

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.isLoading.set(true);
    const category = this.selectedCategory();
    this.groupService.getGroups(20, 0, category === 'Todos' ? undefined : category)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (groups) => {
          this.groups.set(groups);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.loadGroups();
  }

  toggleCreateForm(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.showCreateForm.set(!this.showCreateForm());
  }

  onGroupCreated(): void {
    this.showCreateForm.set(false);
    this.loadGroups();
  }
}
