import { Injectable, computed, signal, inject } from '@angular/core';

import { AuthTokens, AuthUser, SessionPayload } from '../../interfaces/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthSession {
  private readonly sessionStorageKey = 'nexora.auth.session';
  private readonly rememberStorageKey = 'nexora.auth.remember';

  readonly session = signal<SessionPayload | null>(null);
  readonly user = computed(() => this.session()?.user ?? null);

  constructor() {
    this.session.set(
      this.loadFromStorage(this.rememberStorageKey)
        ?? this.loadFromStorage(this.sessionStorageKey)
    );
  }

  start(payload: SessionPayload, rememberMe = false): void {
    this.session.set(payload);
    this.persistSession(payload, rememberMe);
  }

  mergeUser(userPatch: Partial<AuthUser> & { email?: string }, rememberMe?: boolean): void {
    const current = this.session();
    const fallbackEmail = current?.user?.email ?? userPatch.email;
    if (!fallbackEmail) return;

    const mergedUser = {
      ...(current?.user ?? { email: fallbackEmail }),
      ...userPatch,
      email: (userPatch.email ?? fallbackEmail).trim(),
    };

    // Clean up empty strings or nulls to ensure consistent behavior
    if (userPatch.avatarUrl === null || userPatch.avatarUrl === '') mergedUser.avatarUrl = undefined;
    if (userPatch.bannerUrl === null || userPatch.bannerUrl === '') mergedUser.bannerUrl = undefined;

    const payload: SessionPayload = {
      user: mergedUser.id ? mergedUser as AuthUser : { ...mergedUser, id: '' } as AuthUser,
      tokens: current?.tokens,
    };

    this.session.set(payload);
    this.persistSession(payload, rememberMe);
  }

  clear(): void {
    this.session.set(null);
    sessionStorage.removeItem(this.sessionStorageKey);
    localStorage.removeItem(this.rememberStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.session()?.user?.email;
  }

  getUser(): AuthUser | null {
    return this.user();
  }

  getTokens(): AuthTokens | null {
    return this.session()?.tokens ?? null;
  }

  hasHydratedProfile(user = this.getUser()): boolean {
    if (!user) return false;

    return !!(
      user.fullName
      || user.username
      || user.bio
      || user.career
      || user.avatarUrl
      || user.bannerUrl
      || user.academicInterests?.length
      || user.profileComplete !== undefined
    );
  }

  private persistSession(payload: SessionPayload, rememberMe?: boolean): void {
    const serialized = JSON.stringify(payload);
    const shouldRemember = rememberMe ?? this.isRememberedSession();

    if (shouldRemember) {
      localStorage.setItem(this.rememberStorageKey, serialized);
      sessionStorage.removeItem(this.sessionStorageKey);
      return;
    }

    sessionStorage.setItem(this.sessionStorageKey, serialized);
    localStorage.removeItem(this.rememberStorageKey);
  }

  private isRememberedSession(): boolean {
    return !!localStorage.getItem(this.rememberStorageKey);
  }

  private loadFromStorage(storageKey: string): SessionPayload | null {
    try {
      const raw = storageKey === this.rememberStorageKey
        ? localStorage.getItem(storageKey)
        : sessionStorage.getItem(storageKey);

      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return null;
      }

      const record = parsed as Record<string, unknown>;
      const user = record['user'];
      if (typeof user !== 'object' || user === null || Array.isArray(user)) {
        return null;
      }

      const userRecord = user as Record<string, unknown>;
      const email = userRecord['email'];
      const id = userRecord['id'];
      if (typeof email !== 'string' || !email.trim() || typeof id !== 'string') {
        return null;
      }

      return {
        user: {
          ...userRecord,
          email,
          id,
        } as AuthUser,
        tokens: (record['tokens'] as AuthTokens | undefined) ?? undefined,
      };
    } catch {
      return null;
    }
  }
}
