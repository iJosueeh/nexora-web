import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FeedTagsService } from '../../services/feed-tags.service';
import { FeedService } from '../../services/feed.service';
import { Trend, SuggestedUser } from '../../models/trend.model';
import { ProfileService } from '../../../profile/services/profile.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feed-trends',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feed-trends.html',
  styleUrl: './feed-trends.css'
})
export class FeedTrends {
  private readonly feedTags = inject(FeedTagsService);
  private readonly subs = new Subscription();
  private readonly router = inject(Router);

  loading = signal(true);
  error = signal('');

  trends = signal<Trend[]>([]);
  suggestedUsers = signal<SuggestedUser[]>([]);

  private readonly feedService = inject(FeedService);
  private readonly profileService = inject(ProfileService);
  private readonly toastService = inject(ToastService);

  constructor() {
    // Subscribe to trends exposed by the tags service (reusable mapping)
    this.subs.add(
      this.feedTags.getTrends('', 6).subscribe(
        (mapped) => {
          this.trends.set(mapped.slice(0, 3));
          this.loading.set(false);
        },
        (err) => {
          console.error('Error loading trends', err);
          this.error.set('No fue posible cargar tendencias');
          this.loading.set(false);
        }
      )
    );

    // Load suggested users dynamically from recent posts' authors
    this.subs.add(
      this.feedService.getPosts(20, 0).subscribe({
        next: (posts) => {
          const seen = new Set<string>();
          const users: SuggestedUser[] = [];
          for (const p of posts) {
            const username = p.author.username ?? String(p.author.id ?? '');
            if (!username || seen.has(username)) continue;
            seen.add(username);
            const avatar = p.author.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
            users.push({
              id: String(p.author.id ?? username),
              name: p.author.fullName || username,
              role: (p.author as any).role || 'Investigador',
              avatar,
              isFollowing: (p.author as any).isFollowing ?? false
            });
            if (users.length >= 3) break;
          }
          this.suggestedUsers.set(users);
        },
        error: (err) => {
          console.error('Error loading suggested users', err);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onToggleFollow(user: SuggestedUser, event: MouseEvent): void {
    event.stopPropagation();

    const current = this.suggestedUsers();
    const idx = current.findIndex(u => u.id === user.id);
    if (idx === -1) return;

    // Optimistic update
    const updated = current.map(u => ({ ...u }));
    const prev = !!updated[idx].isFollowing;
    updated[idx].isFollowing = !prev;
    this.suggestedUsers.set(updated);

    this.profileService.toggleFollow(user.id).subscribe({
      next: (ok) => {
        if (!ok) {
          // rollback
          updated[idx].isFollowing = prev;
          this.suggestedUsers.set(updated);
          this.toastService.show('No se pudo actualizar seguimiento', 'error');
        } else {
          this.toastService.show(updated[idx].isFollowing ? 'Ahora sigues a ' + updated[idx].name : 'Has dejado de seguir a ' + updated[idx].name, 'success');
        }
      },
      error: (err) => {
        console.error('Error toggling follow', err);
        updated[idx].isFollowing = prev;
        this.suggestedUsers.set(updated);
        this.toastService.show('Error al cambiar seguimiento', 'error');
      }
    });
  }

  openTrend(title: string): void {
    const tag = title.replace(/^#/, '').trim();
    void this.router.navigate(['/feed'], { queryParams: { tag } });
  }
}
