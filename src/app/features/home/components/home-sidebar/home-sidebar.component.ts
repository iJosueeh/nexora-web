import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { Trend, UserSuggestion } from './discovery.model';
import { DiscoveryService } from './services/discovery.service';

@Component({
  selector: 'app-home-sidebar',
  standalone: true,
  templateUrl: './home-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeSidebarComponent implements OnInit {
  private readonly discoveryService = inject(DiscoveryService);

  readonly trends = signal<Trend[]>([]);
  readonly suggestions = signal<UserSuggestion[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.discoveryService.getSidebarData().subscribe({
      next: ({ trends, suggestions }) => {
        this.trends.set(trends);
        this.suggestions.set(suggestions);
        this.loading.set(false);
      },
      error: () => {
        this.trends.set([]);
        this.suggestions.set([]);
        this.loading.set(false);
      },
    });
  }

  formatPostsCount(postsCount: number): string {
    return new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 }).format(postsCount);
  }
}
