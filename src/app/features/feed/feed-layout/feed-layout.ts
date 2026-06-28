import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { ShellLayout } from '../../../shared/components/shell-layout/shell-layout';
import { FeedSidebar } from '../components/feed-sidebar/feed-sidebar';
import { FeedTrends } from '../components/feed-trends/feed-trends';
import { FeedLayoutState } from './feed-layout.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, ShellLayout, FeedSidebar, FeedTrends],
  templateUrl: './feed-layout.html',
  styleUrl: './feed-layout.css',
})
export class FeedLayout {
  private readonly router = inject(Router);
  protected readonly state = inject(FeedLayoutState);
  protected readonly loading = signal(false);

  constructor() {
    const url = this.router.url;
    const path = url.replace('/feed', '').replace(/^\//, '');
    this.state.showRight.set(path === '');

    this.router.events.pipe(
      filter((e): e is NavigationStart => e instanceof NavigationStart),
    ).subscribe(event => {
      if (!event.url.startsWith('/feed')) return;
      const p = event.url.replace('/feed', '').replace(/^\//, '');
      this.state.showRight.set(p === '');
      this.loading.set(true);
    });

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe(() => this.loading.set(false));
  }
}
