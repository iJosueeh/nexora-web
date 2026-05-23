import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollToTop } from './shared/components/scroll-to-top/scroll-to-top';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ScrollToTop],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly notificationService = inject(NotificationService);
  protected readonly title = signal('nexora-app');
}
