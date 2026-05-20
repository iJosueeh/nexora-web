// Polyfills must run before any Angular or zone.js imports
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '0px';
    readonly thresholds: ReadonlyArray<number> = [];
    readonly scrollMargin = '0px';

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}

    observe(target: Element): void {}
    unobserve(target: Element): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  (globalThis as any).IntersectionObserver = MockIntersectionObserver;
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
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
if (typeof (globalThis as any).Event === 'function') {
  try {
    const { JSDOM } = require('jsdom');
    const JSDOMEvent = new JSDOM('').window.Event;
    if ((globalThis as any).Event !== JSDOMEvent) {
      (globalThis as any).Event = JSDOMEvent;
    }
  } catch (e) {
    // Ignore if jsdom is not available or other issues
  }
}

// Global WebSocket mock to prevent undici/Node from trying to use real WebSockets
// which causes the "instance of Event" error when it receives a JSDOM event.
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
