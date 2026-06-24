import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AuthSession } from '../../../core/services/auth-session';
import { AuthApiService } from '../../auth/services/auth-api.service';
import { FeedService } from '../../feed/services/feed.service';
import { ProfileService } from '../services/profile.service';
import { BookmarksService } from '../../feed/services/bookmarks.service';
import {
  ProfileCard,
  ProfileTab,
  ProfileViewModel,
  buildProfileViewModel,
  mapFeedPostsToProfileCards,
  normalizeHandle,
  resolvePreferredHandle
} from './profile-page.helpers';

@Injectable()
export class ProfilePageState {
  private readonly profilePostsPageSize = 12;
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSession);
  private readonly authApiService = inject(AuthApiService);
  private readonly feedService = inject(FeedService);
  private readonly profileService = inject(ProfileService);
  private readonly bookmarksService = inject(BookmarksService);

  readonly isLoading = signal(true);
  readonly isGuest = signal(false);
  readonly isPublicView = signal(false);
  readonly isOwnProfile = signal(false);
  readonly isProfileNotFound = signal(false);
  readonly isFollowing = signal(false);
  readonly isLoadingMorePosts = signal(false);
  readonly hasMorePosts = signal(false);
  readonly activeTab = signal<ProfileTab>('posts');
  readonly profile = signal<ProfileViewModel | null>(null);
  readonly posts = signal<ProfileCard[]>([]);
  readonly bookmarks = signal<ProfileCard[]>([]);
  readonly isLoadingBookmarks = signal(false);

  readonly isAuthenticated = computed(() => this.authSession.isAuthenticated());
  readonly isAnonymousPreview = computed(() => this.isPublicView() && !this.isAuthenticated());

  setTab(tab: ProfileTab): void {
    if (this.isAnonymousPreview()) return;
    this.activeTab.set(tab);
    if (tab === 'bookmarks' && this.bookmarks().length === 0) {
      this.loadBookmarks();
    }
  }

  loadFromSession(): void {
    const sessionUser = this.authSession.getUser();
    const sessionHandle = resolvePreferredHandle(sessionUser);

    this.isPublicView.set(false);
    this.isOwnProfile.set(true);
    this.isProfileNotFound.set(false);
    this.profile.set(buildProfileViewModel(sessionUser ?? undefined));
    this.posts.set([]);
    this.isFollowing.set(false);

    if (!sessionHandle) {
      this.isLoading.set(false);
      return;
    }

    this.loadProfilePosts(sessionHandle, true);
  }

  loadPublicProfile(handle: string): void {
    this.isGuest.set(false);
    this.isOwnProfile.set(false);
    this.isProfileNotFound.set(false);
    this.isLoading.set(true);

    this.authApiService.getPublicProfile(handle)
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        const user = response?.user;
        if (!user) {
          this.profile.set(null);
          this.posts.set([]);
          this.isProfileNotFound.set(true);
          this.isLoading.set(false);
          return;
        }

        const sessionUser = this.authSession.getUser();
        const sessionHandle = normalizeHandle(sessionUser?.username);
        const currentHandle = normalizeHandle(user.username);
        
        this.isOwnProfile.set(!!sessionHandle && sessionHandle === currentHandle);
        this.profile.set(buildProfileViewModel(user));
        this.isFollowing.set(user.isFollowing ?? false);
        this.posts.set([]);

        const profileHandle = normalizeHandle(user.username) || handle;
        this.loadProfilePosts(profileHandle, true);
      });
  }

  loadMorePosts(): void {
    const profileHandle = normalizeHandle(this.profile()?.handle);
    if (!profileHandle || this.isLoadingMorePosts() || !this.hasMorePosts()) {
      return;
    }

    this.loadProfilePosts(profileHandle, false);
  }

  toggleFollow(): void {
    const profile = this.profile();
    if (!profile?.id || this.isLoading()) return;

    const previousFollowing = this.isFollowing();
    const previousFollowers = profile.followersCount;
    const currentUser = this.authSession.getUser();
    const previousGlobalFollowing = currentUser?.followingCount ?? 0;

    // Optimistic Update
    this.isFollowing.set(!previousFollowing);
    this.profile.set({
      ...profile,
      followersCount: previousFollowing ? Math.max(0, previousFollowers - 1) : previousFollowers + 1,
    });

    const newGlobalFollowing = previousFollowing ? Math.max(0, previousGlobalFollowing - 1) : previousGlobalFollowing + 1;
    this.authSession.mergeUser({ followingCount: newGlobalFollowing });

    this.profileService.toggleFollow(profile.id).subscribe({
      next: (isFollowing) => {
        this.isFollowing.set(isFollowing);
        this.refreshProfile(profile.handle, isFollowing);
      },
      error: () => {
        this.isFollowing.set(previousFollowing);
        this.profile.set({ ...profile, followersCount: previousFollowers });
        this.authSession.mergeUser({ followingCount: previousGlobalFollowing });
      },
    });
  }

  refreshProfile(handle: string, defaultFollowing: boolean): void {
    const safeHandle = normalizeHandle(handle);
    if (!safeHandle) return;

    this.authApiService.getPublicProfile(safeHandle).subscribe((response) => {
      const user = response?.user;
      if (user) {
        this.profile.set(buildProfileViewModel(user));
        this.isFollowing.set(user.isFollowing ?? defaultFollowing);
      }
    });
  }

  private loadProfilePosts(profileHandle: string, reset: boolean): void {
    const safeHandle = normalizeHandle(profileHandle);
    const currentCards = reset ? [] : this.posts();
    const offset = reset ? 0 : currentCards.length;

    if (reset) {
      this.isLoading.set(true);
      this.posts.set([]);
      this.hasMorePosts.set(false);
    } else {
      this.isLoadingMorePosts.set(true);
    }

    this.feedService.getPostsByUsername(safeHandle, this.profilePostsPageSize, offset)
      .pipe(catchError(() => of([])))
      .subscribe((posts) => {
        const fetchedCards = mapFeedPostsToProfileCards(posts);
        const cards = reset ? fetchedCards : [...currentCards, ...fetchedCards];

        this.posts.set(cards);
        this.hasMorePosts.set(fetchedCards.length === this.profilePostsPageSize);

        const currentProfile = this.profile();
        if (currentProfile) {
          this.profile.set({ ...currentProfile, postsCount: cards.length });
        }

        this.isLoading.set(false);
        this.isLoadingMorePosts.set(false);
      });
  }

  private loadBookmarks(): void {
    this.isLoadingBookmarks.set(true);
    this.bookmarksService.getBookmarks(20, 0)
      .pipe(catchError(() => of([])))
      .subscribe((posts) => {
        this.bookmarks.set(mapFeedPostsToProfileCards(posts));
        this.isLoadingBookmarks.set(false);
      });
  }
}
