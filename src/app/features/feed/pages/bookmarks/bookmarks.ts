import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookmarksService } from '../../services/bookmarks.service';
import { PostCardComponent } from '../../components/post-card/post-card';
import { Post } from '../../../../interfaces/feed';
import { AuthSession } from '../../../../core/services/auth-session';

@Component({
  selector: 'app-bookmarks-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent],
  templateUrl: './bookmarks.html',
  styleUrl: './bookmarks.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksPage implements OnInit {
  private readonly bookmarksService = inject(BookmarksService);
  private readonly auth = inject(AuthSession);

  readonly bookmarks = signal<Post[]>([]);
  readonly isLoading = signal(true);
  readonly isLoadingMore = signal(false);
  readonly hasMore = signal(true);

  private readonly pageSize = 20;

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) return;
    this.loadBookmarks();
  }

  loadBookmarks(): void {
    this.isLoading.set(true);
    this.bookmarksService.getBookmarks(this.pageSize, 0).subscribe({
      next: (posts) => {
        this.bookmarks.set(posts);
        this.hasMore.set(posts.length >= this.pageSize);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadMore(): void {
    if (this.isLoadingMore() || !this.hasMore()) return;
    this.isLoadingMore.set(true);
    this.bookmarksService.getBookmarks(this.pageSize, this.bookmarks().length).subscribe({
      next: (posts) => {
        this.bookmarks.update(list => [...list, ...posts]);
        this.hasMore.set(posts.length >= this.pageSize);
        this.isLoadingMore.set(false);
      },
      error: () => this.isLoadingMore.set(false)
    });
  }

  onPostDeleted(postId: string): void {
    this.bookmarks.update(list => list.filter(p => p.id !== postId));
  }
}
