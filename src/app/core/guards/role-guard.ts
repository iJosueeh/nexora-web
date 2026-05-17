import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from '../services/auth-session';

/**
 * Guard that restricts access to routes based on user roles.
 * Expects 'allowedRoles' in the route data.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authSession = inject(AuthSession);
  const router = inject(Router);

  const allowedRoles = route.data['allowedRoles'] as string[];

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const userRoles = authSession.user()?.roles ?? [];
  const hasAccess = allowedRoles.some(role => userRoles.includes(role));

  if (hasAccess) {
    return true;
  }

  // Redirect to home or a forbidden page if the user doesn't have access
  return router.createUrlTree(['/']);
};
