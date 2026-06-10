import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { MobileBottomNavComponent } from '../../shared/components/mobile-bottom-nav/mobile-bottom-nav';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Footer, MobileBottomNavComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private readonly router = inject(Router);
  private readonly currentPath = signal(this.router.url);

  readonly shouldShowFooter = computed(() => {
    const path = this.currentPath();
    return !(path.startsWith('/feed') || path.startsWith('/publicar') || 
             path.startsWith('/settings') || path.startsWith('/profile') || 
             path.startsWith('/u/'));
  });

  readonly shouldShowBottomNav = computed(() => {
    const path = this.currentPath();
    return path.startsWith('/feed') || path.startsWith('/publicar') || 
           path.startsWith('/settings') || path.startsWith('/profile') || 
           path.startsWith('/u/');
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.currentPath.set(event.urlAfterRedirects));
  }
}