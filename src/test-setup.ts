// Polyfills must run before any Angular or zone.js imports
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '0px';
    readonly thresholds: readonly number[] = [];
    readonly scrollMargin = '0px';

    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) { /* No-op for test */ }

    observe(_target: Element): void { /* No-op for test */ }
    unobserve(_target: Element): void { /* No-op for test */ }
    disconnect(): void { /* No-op for test */ }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = MockIntersectionObserver;
}

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { beforeEach, vi } from 'vitest';

// Fix for "event" argument must be an instance of Event
// This happens when JSDOM's Event conflicts with Node's Event in some libraries like undici
// We ensure that the global Event is the one from JSDOM when running in Vitest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).Event === 'function') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsdom = (globalThis as any).require('jsdom');
    const JSDOMEvent = new jsdom.JSDOM('').window.Event;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((globalThis as any).Event !== JSDOMEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).Event = JSDOMEvent;
    }
  } catch (_e) {
    // Ignore if jsdom is not available or other issues
  }
}

// Global WebSocket mock to prevent undici/Node from trying to use real WebSockets
// which causes the "instance of Event" error when it receives a JSDOM event.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).WebSocket = vi.fn(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  send: vi.fn(),
  dispatchEvent: vi.fn(),
  readyState: 0, // CONNECTING
}));


// Mock global de Supabase para evitar inicializaciones reales en tests
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithEmail: vi.fn(),
      signOut: vi.fn().mockResolvedValue({}),
      refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn().mockResolvedValue({}),
  })),
}));

// Cleanup global before each test
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
