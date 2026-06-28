import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthSession } from '../../../../core/services/auth-session';
import { NotificationService } from '../../../../core/services/notification.service';
import { buildAvatarUrl } from '../../../profile/profile-page/profile-page.helpers';

interface MenuItem {
  label: string;
  link: string | (() => string[]);
  icon: string;
  exact?: boolean;
}

interface MenuGroup {
  category: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-feed-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './feed-sidebar.html',
  styleUrl: './feed-sidebar.css'
})
export class FeedSidebar {
  private readonly authSession = inject(AuthSession);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  unreadCount = this.notificationService.unreadCount;

  userAvatar = computed(() => {
    const user = this.authSession.user();
    return user?.avatarUrl || buildAvatarUrl(user?.username || user?.email || 'nexora');
  });

  profileLink = computed(() => {
    const username = this.authSession.getUser()?.username?.trim();
    return username ? ['/u', username] : ['/profile'];
  });

  menuGroups = signal<MenuGroup[]>([
    {
      category: 'Explorar',
      items: [
        { label: 'Inicio', link: '/feed', icon: 'home', exact: true },
        { label: 'Exploración', link: '/feed/explore', icon: 'explore' },
        { label: 'Eventos', link: '/eventos', icon: 'events' },
        { label: 'Recursos', link: '/explorar', icon: 'resources' },
      ]
    },
    {
      category: 'Mi Actividad',
      items: [
        { label: 'Mis Recursos', link: '/mis-recursos', icon: 'my-resources' },
        { label: 'Guardados', link: '/feed/bookmarks', icon: 'bookmark' },
        { label: 'Grupos', link: '/groups', icon: 'groups' },
      ]
    },
    {
      category: 'Social',
      items: [
        { label: 'Notificaciones', link: '/feed/notifications', icon: 'notifications' },
        { label: 'Perfil', link: () => this.profileLink(), icon: 'profile' },
      ]
    }
  ]);

  goToProfile(event: MouseEvent): void {
    event.preventDefault();
    const username = this.authSession.getUser()?.username?.trim();
    if (username) {
      void this.router.navigate(['/u', username]);
      return;
    }
    if (this.authSession.isAuthenticated()) {
      void this.router.navigate(['/profile']);
      return;
    }
    void this.router.navigate(['/login']);
  }

  goToPublication(event: MouseEvent): void {
    event.preventDefault();
    void this.router.navigate(['/feed', 'publicar']);
  }

  getLinkUrl(item: MenuItem): string | string[] {
    if (typeof item.link === 'function') {
      return item.link();
    }
    return item.link;
  }
}