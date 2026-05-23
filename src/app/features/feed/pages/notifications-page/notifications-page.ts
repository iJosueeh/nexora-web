import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';
import { DatePipe } from '@angular/common';
import { ShellLayout } from '../../../../shared/components/shell-layout/shell-layout';
import { FeedSidebar } from '../../components/feed-sidebar/feed-sidebar';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, ShellLayout, FeedSidebar],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.css',
  providers: [DatePipe]
})
export class NotificationsPage implements OnInit {
  readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.notificationService.fetchHistory(50, 0);
    // Al entrar a la página, marcamos todas como leídas después de un breve delay
    setTimeout(() => {
      this.notificationService.markAllAsRead();
    }, 2000);
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }
}
