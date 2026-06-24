import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { DatePipe } from '@angular/common';
import { Notification } from '../../../../interfaces/notification.model';

type FilterType = 'all' | 'mentions' | 'followers';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.css',
  providers: [DatePipe]
})
export class NotificationsPage implements OnInit {
  readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly datePipe = inject(DatePipe);

  activeFilter = signal<FilterType>('all');

  notifications = computed(() => this.notificationService.notifications());

  filteredNotifications = computed(() => {
    const filter = this.activeFilter();
    const notifs = this.notifications();

    switch (filter) {
      case 'mentions':
        return notifs.filter(n => ['LIKE', 'COMMENT', 'COMMENT_REPLY', 'RSVP'].includes(n.type));
      case 'followers':
        return notifs.filter(n => n.type === 'FOLLOW');
      default:
        return notifs;
    }
  });

  unreadCount = computed(() => this.notificationService.unreadCount());

  filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'mentions', label: 'Menciones' },
    { key: 'followers', label: 'Seguidores' }
  ];

  ngOnInit(): void {
    this.notificationService.fetchHistory(50, 0);
    setTimeout(() => {
      this.notificationService.markAllAsRead();
    }, 2000);
  }

  setFilter(filter: FilterType): void {
    this.activeFilter.set(filter);
  }

  markAsRead(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id);
  }

  navigateToUser(senderUsername: string | undefined): void {
    if (senderUsername) {
      this.router.navigate(['/u', senderUsername]);
    }
  }

  getNotificationMessage(type: string): string {
    switch (type) {
      case 'LIKE': return 'le dio me gusta a tu publicación';
      case 'COMMENT': return 'comentó tu publicación';
      case 'COMMENT_REPLY': return 'respondió a tu comentario';
      case 'RSVP': return 'respondió a tu evento';
      case 'FOLLOW': return 'comenzó a seguirte';
      default: return 'interactuó contigo';
    }
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'short') || '';
  }

  getIcon(type: string): string {
    switch (type) {
      case 'LIKE': return 'heart';
      case 'COMMENT': return 'comment';
      case 'COMMENT_REPLY': return 'reply';
      case 'RSVP': return 'calendar';
      case 'FOLLOW': return 'user-plus';
      default: return 'bell';
    }
  }
}