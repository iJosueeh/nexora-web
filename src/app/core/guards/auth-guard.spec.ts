import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthSession } from '../services/auth-session';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { vi } from 'vitest';

describe('authGuard', () => {
  let authSessionSpy: { isAuthenticated: ReturnType<typeof vi.fn> };
  let routerSpy: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSessionSpy = {
      isAuthenticated: vi.fn(),
    };
    routerSpy = {
      createUrlTree: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthSession, useValue: authSessionSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  const executeGuard = (
    route: ActivatedRouteSnapshot = {} as unknown as ActivatedRouteSnapshot, 
    state: RouterStateSnapshot = {} as unknown as RouterStateSnapshot
  ) => {
    return TestBed.runInInjectionContext(() => authGuard(route, state));
  };

  it('should return true if user is authenticated', () => {
    authSessionSpy.isAuthenticated.mockReturnValue(true);

    const result = executeGuard();

    expect(result).toBe(true);
    expect(authSessionSpy.isAuthenticated).toHaveBeenCalled();
  });

  it('should return a UrlTree to /login if user is not authenticated', () => {
    authSessionSpy.isAuthenticated.mockReturnValue(false);
    const mockUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(mockUrlTree);

    const result = executeGuard();

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});

