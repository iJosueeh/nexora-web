import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PermissionService } from '../../core/services/permission.service';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './management.html',
  styleUrls: ['./management.css'],
})
export class ManagementPage {
  readonly permissionService = inject(PermissionService);

  readonly menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: './dashboard' },
    { label: 'Usuarios', icon: 'people', path: './users', roles: ['ROLE_ADMIN'] },
    { label: 'Publicaciones', icon: 'article', path: './posts' },
    { label: 'Eventos', icon: 'event', path: './events' },
    { label: 'Mantenimiento', icon: 'settings', path: './maintenance', roles: ['ROLE_ADMIN'] },
  ];

  filterMenuItems() {
    return this.menuItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.some(role => this.permissionService.hasRole(role));
    });
  }
}
