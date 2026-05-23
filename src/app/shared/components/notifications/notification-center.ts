import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.css'
})
export class NotificationCenterComponent {
  private readonly elementRef = inject(ElementRef);
  readonly notificationService = inject(NotificationService);
  
  isOpen = signal(false);

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.notificationService.fetchHistory(10, 0);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }
}
