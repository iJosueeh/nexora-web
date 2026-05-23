import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthSession } from '../../../../core/services/auth-session';
import { NotificationService } from '../../../../core/services/notification.service';

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
  profileLink = computed(() => {
    const username = this.authSession.getUser()?.username?.trim();
    return username ? ['/u', username] : ['/profile'];
  });

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
    void this.router.navigate(['/publicar']);
  }
}
