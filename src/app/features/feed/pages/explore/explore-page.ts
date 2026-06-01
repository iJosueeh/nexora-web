import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { FeedTagsService } from '../../services/feed-tags.service';
import { FeedService } from '../../services/feed.service';
import { FeedPaginationQueueService } from '../../services/feed-pagination-queue.service';
import { Trend, SuggestedUser } from '../../models/trend.model';
import { Post } from '../../../../interfaces/feed';
import { PostCardComponent } from '../../components/post-card/post-card';
import { ShellLayout } from '../../../../shared/components/shell-layout/shell-layout';
import { FeedSidebar } from '../../components/feed-sidebar/feed-sidebar';
import { AuthSession } from '../../../../core/services/auth-session';
import { ProfileService } from '../../../profile/services/profile.service';

export abstract class ExplorePageBase implements OnInit {
  protected readonly feedTags = inject(FeedTagsService);
  protected readonly feedService = inject(FeedService);
  protected readonly paginationQueue = inject(FeedPaginationQueueService);
  protected readonly authSession = inject(AuthSession);
  protected readonly profileService = inject(ProfileService);
  protected readonly destroyRef = inject(DestroyRef);

  activeTab = signal<'todos' | 'multimedia' | 'articulos'>('todos');
  loading = signal(true);
  trends = signal<Trend[]>([]);
  suggestedUsers = signal<SuggestedUser[]>([]);
  relatedPosts = signal<Post[]>([]);
  selectedTrend = signal<string | null>(null);
  showAllTrends = signal(false);

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading.set(true);
    
    forkJoin({
      trends: this.feedTags.getTrends('', 10),
      posts: this.feedService.getPosts(20, 0)
    }).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: ({ trends, posts }) => {
        this.trends.set(trends);
        this.relatedPosts.set(posts);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading explore data', err);
        this.loading.set(false);
      }
    });

    this.loadSuggestions();
  }

  setTab(tab: 'todos' | 'multimedia' | 'articulos'): void {
    this.activeTab.set(tab);
  }

  toggleTrends(): void {
    this.showAllTrends.update(v => !v);
  }

  selectTrend(trend: Trend): void {
    const tag = trend.title.replace(/^#/, '').trim();
    this.selectedTrend.set(tag);
    this.loading.set(true);
    
    this.paginationQueue.enqueue(15, 0, tag)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (posts) => {
          this.relatedPosts.set(posts);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  private loadSuggestions(): void {
    const user = this.authSession.getUser();
    if (!user || !user.id) return;

    this.profileService.getFollowing(user.id).subscribe(following => {
      const followingIds = new Set(following.map(u => u.id).filter((id): id is string => !!id));
      this.feedService.getPosts(50, 0).subscribe(posts => {
        const seen = new Set<string>();
        const users: SuggestedUser[] = [];
        for (const p of posts) {
          if (users.length >= 5) break;
          const author = p.author;
          if (!author.id || author.id === user.id || followingIds.has(author.id) || seen.has(author.id)) continue;
          
          seen.add(author.id);
          users.push({
            id: author.id,
            name: author.fullName || author.username || 'Usuario',
            role: author.role || 'Investigador',
            avatar: author.avatar || author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.id}`,
            isFollowing: false
          });
        }
        this.suggestedUsers.set(users);
      });
    });
  }
}

@Component({
  selector: 'app-explore-page',
  standalone: true,
  imports: [CommonModule, PostCardComponent, ShellLayout, FeedSidebar],
  templateUrl: './explore-page.html',
  styleUrl: './explore-page.css'
})
export class ExplorePage extends ExplorePageBase {}
