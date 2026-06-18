import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { AuthSession } from '../../../core/services/auth-session';
import { FeedSidebar } from '../../feed/components/feed-sidebar/feed-sidebar';
import { ShellLayout } from '../../../shared/components/shell-layout/shell-layout';
import { ProfileMenu } from './components/profile-menu/profile-menu';
import { FollowModal } from './components/follow-modal/follow-modal';
import { ProfilePostCard } from './components/profile-post-card/profile-post-card';
import { ProfileSkeleton } from './components/profile-skeleton/profile-skeleton';
import { ProfilePageState } from './profile-page.state';
import {
  ProfileCard,
  buildAvatarUrl,
  buildBannerUrl,
  formatCompact,
  normalizeHandle,
  resolvePreferredHandle,
} from './profile-page.helpers';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FeedSidebar, ShellLayout, ProfileMenu, FollowModal, ProfilePostCard, ProfileSkeleton],
  providers: [ProfilePageState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private readonly anonymousLockTriggerPx = 520;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authSession = inject(AuthSession);
  readonly state = inject(ProfilePageState);

  readonly copiedShare = signal(false);
  readonly isProfileMenuOpen = signal(false);
  readonly showAnonymousLock = signal(false);
  readonly isFollowModalOpen = signal(false);
  readonly followModalType = signal<'followers' | 'following'>('followers');
  readonly currentPath = signal(this.router.url);

  readonly displayName = computed(() => this.state.profile()?.displayName ?? 'Perfil');
  readonly handle = computed(() => this.state.profile()?.handle ?? '@nexora');
  readonly bio = computed(() => this.state.profile()?.bio ?? '');
  readonly bannerUrl = computed(() => this.state.profile()?.bannerUrl ?? buildBannerUrl());
  readonly avatarUrl = computed(() => this.state.profile()?.avatarUrl ?? buildAvatarUrl());
  readonly stats = computed(() => {
    const p = this.state.profile();
    return [
      { label: 'Seguidores', value: formatCompact(p?.followersCount ?? 0) },
      { label: 'Seguidos', value: formatCompact(p?.followingCount ?? 0) },
      { label: 'Posts', value: formatCompact(p?.postsCount ?? 0) },
    ];
  });
  readonly visibleCards = computed(() => {
    const cards = this.state.posts();
    const isPreview = this.state.isAnonymousPreview();
    const items = this.state.activeTab() === 'media' 
      ? cards.filter((c) => c.variant === 'image')
      : this.state.activeTab() === 'likes'
        ? [...cards].sort((a, b) => Number(b.likes ?? 0) - Number(a.likes ?? 0))
        : cards;
    return isPreview ? items.slice(0, 2) : items;
  });
  readonly shareLabel = computed(() => this.copiedShare() ? 'Enlace copiado' : 'Compartir perfil');
  readonly showSkeleton = computed(() => this.state.isLoading() || this.state.isGuest());
  readonly canFollow = computed(() => !this.state.isOwnProfile() && this.state.isAuthenticated());
  readonly canShare = computed(() => !!this.state.profile()?.handle);
  readonly featuredInterests = computed(() => this.state.profile()?.featuredInterests ?? []);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => this.currentPath.set(e.urlAfterRedirects));
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const routeHandle = normalizeHandle(params.get('handle'));
      const sessionHandle = resolvePreferredHandle(this.authSession.getUser());

      if (!routeHandle && sessionHandle) {
        void this.router.navigate(['/u', sessionHandle], { replaceUrl: true });
        return;
      }

      if (routeHandle && sessionHandle && routeHandle === sessionHandle) {
        this.state.loadFromSession();
      } else if (routeHandle) {
        this.state.loadPublicProfile(routeHandle);
      } else if (!this.authSession.isAuthenticated()) {
        this.state.isGuest.set(true);
        this.state.isLoading.set(false);
      } else {
        this.state.loadFromSession();
      }
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.state.isAnonymousPreview()) {
      const scroll = window.scrollY || document.documentElement.scrollTop || 0;
      this.showAnonymousLock.set(scroll >= this.anonymousLockTriggerPx);
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isProfileMenuOpen.set(false);
  }

  copyProfileLink(event?: Event): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.set(false);
    const h = normalizeHandle(this.state.profile()?.handle);
    if (!h) return;
    void navigator.clipboard.writeText(`${window.location.origin}/u/${h}`).then(() => {
      this.copiedShare.set(true);
      setTimeout(() => this.copiedShare.set(false), 2000);
    });
  }

  openFollowModal(type: 'followers' | 'following', event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    if (!this.state.isAuthenticated()) {
      void this.router.navigate(['/login']);
    } else if (!this.state.isAnonymousPreview()) {
      this.followModalType.set(type);
      this.isFollowModalOpen.set(true);
    }
  }

  closeFollowModal(): void {
    this.isFollowModalOpen.set(false);
    this.state.refreshProfile(this.state.profile()?.handle ?? '', this.state.isFollowing());
  }

  // Simplified navigation helpers
  nav(path: string, event?: Event): void {
    event?.stopPropagation();
    this.isProfileMenuOpen.set(false);
    void this.router.navigate([path]);
  }

  signOut(event?: Event): void {
    event?.stopPropagation();
    this.authSession.clear();
    this.nav('/login');
  }
}
