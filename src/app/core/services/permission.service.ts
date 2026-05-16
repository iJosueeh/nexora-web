import { Injectable, computed, inject } from '@angular/core';
import { AuthSession } from './auth-session';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly authSession = inject(AuthSession);

  /**
   * Public access to the current user signal.
   */
  readonly user = this.authSession.user;

  /**
   * Computed signal that checks if the current user has administrative privileges.
   */
  readonly isAdmin = computed(() => {
    const roles = this.authSession.user()?.roles ?? [];
    return roles.includes('ROLE_ADMIN');
  });

  /**
   * Computed signal that checks if the current user is an official or an admin.
   * Officials can create institutional content and events.
   */
  readonly isOfficialOrAdmin = computed(() => {
    const roles = this.authSession.user()?.roles ?? [];
    return roles.includes('ROLE_ADMIN') || roles.includes('ROLE_OFFICIAL');
  });

  /**
   * Checks if the user can manage a specific resource type.
   */
  canManage(resource: 'users' | 'posts' | 'events'): boolean {
    if (this.isAdmin()) return true;

    if (this.isOfficialOrAdmin()) {
      // Officials can manage posts and events, but not users.
      return resource === 'posts' || resource === 'events';
    }

    return false;
  }

  /**
   * Checks if the user has a specific role.
   */
  hasRole(role: string): boolean {
    const roles = this.authSession.user()?.roles ?? [];
    return roles.includes(role);
  }

  /**
   * Specific permission to mark a post as official.
   */
  readonly canMarkAsOfficial = computed(() => this.isOfficialOrAdmin());
}
