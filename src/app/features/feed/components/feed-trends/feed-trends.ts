import { Component, signal, inject, OnInit, DestroyRef, Directive } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeedTagsService } from '../../services/feed-tags.service';
import { FeedService } from '../../services/feed.service';
import { Trend, SuggestedUser } from '../../models/trend.model';
import { ProfileService } from '../../../profile/services/profile.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthSession } from '../../../../core/services/auth-session';
import { InvitationService } from '../../../groups/services/invitation.service';

@Directive()
export abstract class FeedTrendsBase implements OnInit {
  protected readonly feedTags = inject(FeedTagsService);
  protected readonly router = inject(Router);
  protected readonly feedService = inject(FeedService);
  protected readonly profileService = inject(ProfileService);
  protected readonly toastService = inject(ToastService);
  protected readonly authSession = inject(AuthSession);
  protected readonly invitationService = inject(InvitationService);
  protected readonly destroyRef = inject(DestroyRef);

  loading = signal(true);
  loadingSuggestions = signal(true);
  error = signal('');
  trends = signal<Trend[]>([]);
  suggestedUsers = signal<SuggestedUser[]>([]);

  ngOnInit(): void {
    // Subscribe to trends
    this.feedTags.getTrends('', 6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (mapped) => {
          this.trends.set(mapped.slice(0, 5));
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading trends', err);
          this.error.set('No fue posible cargar tendencias');
          this.loading.set(false);
        }
      });

    // Load suggested users with accurate following check
    this.loadSuggestions();
  }

  protected loadSuggestions(): void {
    const user = this.authSession.getUser();
    const currentUserId = user?.id;

    if (!currentUserId) {
      this.loadingSuggestions.set(false);
      return;
    }

    this.loadingSuggestions.set(true);

    forkJoin({
      posts: this.feedService.getPosts(50, 0).pipe(catchError(() => of([]))),
      following: this.profileService.getFollowing(currentUserId).pipe(catchError(() => of([])))
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: ({ posts, following }) => {
        const followingIds = new Set(following.map(u => u.id));
        const seen = new Set<string>();
        const users: SuggestedUser[] = [];
        
        for (const p of posts) {
          const author = p.author;
          const username = author.username ?? String(author.id ?? '');
          
          // Exclude: self, already followed (from our fresh list), and duplicates
          if (!username || seen.has(username)) continue;
          if (author.id === currentUserId) continue;
          if (followingIds.has(author.id)) continue;
          
          seen.add(username);
          const avatar = author.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
          
          users.push({
            id: String(author.id ?? username),
            name: author.fullName || username,
            role: author.role || 'Investigador',
            avatar,
            isFollowing: false
          });
          
          if (users.length >= 3) break;
        }

        if (users.length > 0) {
          this.suggestedUsers.set(users);
          this.loadingSuggestions.set(false);
          return;
        }

        // Fallback: discover users from backend when posts don't yield suggestions
        const excludeIds = Array.from(followingIds).concat(currentUserId).filter((id): id is string => !!id);
        this.invitationService.discoverUsers(excludeIds).subscribe({
          next: (discovered) => {
            const fallback: SuggestedUser[] = discovered.slice(0, 3).map(u => ({
              id: u.userId,
              name: u.fullName || u.username,
              role: 'Investigador',
              avatar: u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.username)}`,
              isFollowing: false
            }));
            this.suggestedUsers.set(fallback);
            this.loadingSuggestions.set(false);
          },
          error: () => {
            this.suggestedUsers.set([]);
            this.loadingSuggestions.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error loading suggested users', err);
        this.loadingSuggestions.set(false);
      }
    });
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

@Component({
  selector: 'app-feed-trends',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feed-trends.html',
  styleUrl: './feed-trends.css'
})
export class FeedTrends extends FeedTrendsBase {}
