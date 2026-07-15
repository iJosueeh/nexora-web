import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PermissionService } from '../../core/services/permission.service';
import { SupabaseAuthService } from '../../core/services/supabase-auth.service';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './management.html',
  styleUrls: ['./management.css'],
})
export class ManagementPage {
  readonly permissionService = inject(PermissionService);
  private readonly router = inject(Router);
  private readonly authService = inject(SupabaseAuthService);

  readonly isSidebarOpen = signal(false);
  readonly currentPath = signal(this.router.url);

  readonly menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: './dashboard' },
    { label: 'Usuarios', icon: 'people', path: './users', roles: ['ROLE_ADMIN'] },
    { label: 'Publicaciones', icon: 'article', path: './posts' },
    { label: 'Eventos', icon: 'event', path: './events' },
    { label: 'Mantenimiento', icon: 'settings', path: './maintenance', roles: ['ROLE_ADMIN'] },
  ];

  readonly currentLabel = computed(() => {
    const path = this.currentPath();
    const item = this.menuItems.find(i => path.includes(i.path.replace('./', '')));
    return item?.label ?? 'Dashboard';
  });

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.currentPath.set(e.urlAfterRedirects));
  }

  filterMenuItems() {
    return this.menuItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.some(role => this.permissionService.hasRole(role));
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
