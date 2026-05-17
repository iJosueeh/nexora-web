import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

import { AuthSession } from '../../../core/services/auth-session';
import { AuthApiService } from '../../auth/services/auth-api.service';
import { FeedService } from '../../feed/services/feed.service';
import { ProfileService } from '../services/profile.service';
import { FeedSidebar } from '../../feed/components/feed-sidebar/feed-sidebar';
import { ShellLayout } from '../../../shared/components/shell-layout/shell-layout';
import { ProfileMenu } from './components/profile-menu/profile-menu';
import {
  ProfileCard,
  ProfileTab,
  ProfileViewModel,
  buildAvatarUrl,
  buildBannerUrl,
  buildProfileViewModel,
  formatCompact,
  mapFeedPostsToProfileCards,
} from './profile-page.helpers';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FeedSidebar, ShellLayout, ProfileMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  private readonly anonymousLockTriggerPx = 520;
  private readonly profilePostsPageSize = 12;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authSession = inject(AuthSession);
  private readonly authApiService = inject(AuthApiService);
  private readonly feedService = inject(FeedService);
  private readonly profileService = inject(ProfileService);

  readonly isLoading = signal(true);
  readonly isGuest = signal(false);
  readonly isPublicView = signal(false);
  readonly isOwnProfile = signal(false);
  readonly isProfileNotFound = signal(false);
  readonly isFollowing = signal(false);
  readonly copiedShare = signal(false);
  readonly isProfileMenuOpen = signal(false);
  readonly isLoadingMorePosts = signal(false);
  readonly hasMorePosts = signal(false);
  readonly activeTab = signal<ProfileTab>('posts');
  readonly profile = signal<ProfileViewModel | null>(null);
  readonly posts = signal<ProfileCard[]>([]);
  readonly isAuthenticated = computed(() => this.authSession.isAuthenticated());
  readonly showAnonymousLock = signal(false);
  readonly currentPath = signal(this.router.url);

  readonly displayName = computed(() => this.profile()?.displayName ?? 'Perfil');
  readonly handle = computed(() => this.profile()?.handle ?? '@nexora');
  readonly bio = computed(() => this.profile()?.bio ?? '');
  readonly bannerUrl = computed(() => this.profile()?.bannerUrl ?? buildBannerUrl());
  readonly avatarUrl = computed(() => this.profile()?.avatarUrl ?? buildAvatarUrl());
  readonly featuredInterests = computed(() => this.profile()?.featuredInterests ?? ['Machine Learning', 'UI Design', 'Logic']);
  readonly stats = computed(() => {
    const profile = this.profile();
    return [
      { label: 'Seguidores', value: formatCompact(profile?.followersCount ?? 0) },
      { label: 'Seguidos', value: formatCompact(profile?.followingCount ?? 0) },
      { label: 'Posts', value: formatCompact(profile?.postsCount ?? 0) },
    ];
  });
  readonly visibleCards = computed(() => {
    const cards = this.posts();
    const isPreview = this.isPublicView() && !this.isAuthenticated();
    const previewLimit = 2;

    const limitIfPreview = (items: ProfileCard[]) => (isPreview ? items.slice(0, previewLimit) : items);

    switch (this.activeTab()) {
      case 'media':
        return limitIfPreview(cards.filter((card) => card.variant === 'image'));
      case 'likes':
        return limitIfPreview([...cards].sort((a, b) => Number(b.likes ?? 0) - Number(a.likes ?? 0)));
      default:
        return limitIfPreview(cards);
    }
  });
  readonly showSkeleton = computed(() => this.isLoading() || this.isGuest());
  readonly isAnonymousPreview = computed(() => this.isPublicView() && !this.isAuthenticated());
  readonly canFollow = computed(() => !this.isOwnProfile() && this.isAuthenticated());
  readonly canShare = computed(() => !!this.profile()?.handle);
  readonly shareLabel = computed(() => this.copiedShare() ? 'Enlace copiado' : 'Compartir perfil');

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.currentPath.set(event.urlAfterRedirects);
      });
  }

  ngOnInit(): void {
    const routeHandle = this.normalizeHandle(this.route.snapshot.paramMap.get('handle'));
    const sessionHandle = this.resolvePreferredHandle(this.authSession.getUser());

    if (!routeHandle && sessionHandle) {
      void this.router.navigate(['/u', sessionHandle], { replaceUrl: true });
      return;
    }

    if (routeHandle && sessionHandle && routeHandle === sessionHandle) {
      this.loadFromSession();
      return;
    }

    if (routeHandle) {
      this.isPublicView.set(true);
      this.loadPublicProfile(routeHandle);
      return;
    }

    if (!this.authSession.isAuthenticated()) {
      this.isGuest.set(true);
      this.isLoading.set(false);
      this.updateAnonymousLockState();
      return;
    }

    this.loadFromSession();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateAnonymousLockState();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isProfileMenuOpen()) {
      this.isProfileMenuOpen.set(false);
    }
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }

  goToRegister(): void {
    void this.router.navigate(['/register']);
  }

  copyProfileLink(): void {
    if (!this.canShare()) return;

    const profileHandle = this.normalizeHandle(this.profile()?.handle);
    if (!profileHandle) return;

    const sharedUrl = `${window.location.origin}/u/${profileHandle}`;

    void navigator.clipboard.writeText(sharedUrl).then(() => {
      this.copiedShare.set(true);
      setTimeout(() => this.copiedShare.set(false), 2000);
    });
  }

  toggleFollow(): void {
    const profile = this.profile();
    if (!profile?.id || this.isLoading()) return;

    const previousFollowing = this.isFollowing();
    const previousFollowers = profile.followersCount;
    
    const currentUser = this.authSession.getUser();
    const previousGlobalFollowing = currentUser?.followingCount ?? 0;

    // Optimistic update for viewed profile
    this.isFollowing.set(!previousFollowing);
    this.profile.set({
      ...profile,
      followersCount: previousFollowing ? previousFollowers - 1 : previousFollowers + 1,
    });

    // Optimistic update for global session state
    const newGlobalFollowing = previousFollowing 
      ? Math.max(0, previousGlobalFollowing - 1) 
      : previousGlobalFollowing + 1;
      
    this.authSession.mergeUser({ followingCount: newGlobalFollowing });

    this.profileService.toggleFollow(profile.id).subscribe({
      error: () => {
        // Rollback on error
        this.isFollowing.set(previousFollowing);
        this.profile.set({
          ...profile,
          followersCount: previousFollowers,
        });
        
        // Rollback global session state
        this.authSession.mergeUser({ followingCount: previousGlobalFollowing });
      },
    });
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen.update((open) => !open);
  }

  goToEditProfile(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.set(false);
    void this.router.navigate(['/settings']);
  }

  goToPublicProfile(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.set(false);

    const profileHandle = this.normalizeHandle(this.profile()?.handle);
    if (!profileHandle) return;

    void this.router.navigate(['/u', profileHandle]);
  }

  copyProfileLinkFromMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.set(false);
    this.copyProfileLink();
  }

  signOutFromProfile(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.set(false);
    this.authSession.clear();
    void this.router.navigate(['/login']);
  }

  goToHome(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.set(false);
    void this.router.navigate(['/home']);
  }

  goToExplore(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.set(false);
    void this.router.navigate(['/feed/explore']);
  }

  goToNotifications(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.set(false);
    void this.router.navigate(['/feed/notifications']);
  }

  setTab(tab: ProfileTab): void {
    if (this.isAnonymousPreview()) return;
    this.activeTab.set(tab);
  }

  loadMorePosts(): void {
    const profileHandle = this.normalizeHandle(this.profile()?.handle);
    if (!profileHandle || this.isLoadingMorePosts() || !this.hasMorePosts()) {
      return;
    }

    this.loadProfilePosts(profileHandle, false);
  }

  isMenuRoute(pathPrefix: string): boolean {
    return this.currentPath().startsWith(pathPrefix);
  }

  private loadFromSession(): void {
    const sessionUser = this.authSession.getUser();
    const sessionHandle = this.resolvePreferredHandle(sessionUser);

    this.isPublicView.set(false);
    this.isOwnProfile.set(true);
    this.isProfileNotFound.set(false);
    this.profile.set(buildProfileViewModel(sessionUser ?? undefined));
    this.posts.set([]);
    this.isFollowing.set(false);

    if (!sessionHandle) {
      this.isLoading.set(false);
      this.updateAnonymousLockState();
      return;
    }

    this.loadProfilePosts(sessionHandle, true);
  }

  private loadPublicProfile(handle: string): void {
    this.isGuest.set(false);
    this.isOwnProfile.set(false);
    this.isProfileNotFound.set(false);
    this.isLoading.set(true);

    this.authApiService.getPublicProfile(handle)
      .pipe(
        catchError(() => of(null)),
      )
      .subscribe((response) => {
        const user = response?.user;
        if (!user) {
          this.profile.set(null);
          this.posts.set([]);
          this.isProfileNotFound.set(true);
          this.isLoading.set(false);
          this.updateAnonymousLockState();
          return;
        }

        const sessionUser = this.authSession.getUser();
        const sessionHandle = this.normalizeHandle(sessionUser?.username);
        const currentHandle = this.normalizeHandle(user.username);
        
        this.isOwnProfile.set(!!sessionHandle && sessionHandle === currentHandle);
        this.profile.set(buildProfileViewModel(user));
        this.isFollowing.set(user.isFollowing ?? false);
        this.posts.set([]);

        const profileHandle = this.normalizeHandle(user.username) || handle;
        this.loadProfilePosts(profileHandle, true);
      });
  }

  private loadProfilePosts(profileHandle: string, reset: boolean): void {
    const safeHandle = this.normalizeHandle(profileHandle);
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
          this.profile.set({
            ...currentProfile,
            postsCount: cards.length,
          });
        }

        this.isLoading.set(false);
        this.isLoadingMorePosts.set(false);
        this.updateAnonymousLockState();
      });
  }

  private normalizeHandle(handle: string | null | undefined): string {
    if (!handle) return '';
    return handle.replace(/^@/, '').trim().toLowerCase();
  }

  private resolvePreferredHandle(user: { username?: string; email?: string } | null | undefined): string {
    const username = this.normalizeHandle(user?.username);
    if (username) {
      return username;
    }

    const emailPrefix = user?.email?.split('@')[0] ?? '';
    return this.normalizeHandle(emailPrefix);
  }

  private updateAnonymousLockState(): void {
    if (!this.isAnonymousPreview()) {
      this.showAnonymousLock.set(false);
      return;
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    this.showAnonymousLock.set(scrollTop >= this.anonymousLockTriggerPx);
  }
}
