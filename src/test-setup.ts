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

  // define as global variable so bare references succeed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = MockIntersectionObserver;
  // also set on globalThis for completeness
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

if (typeof globalThis.Event === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Event = class Event {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  } as unknown as typeof Event;
}

if (typeof globalThis.WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).WebSocket = class MockWebSocket {
    onopen: ((ev?: Event) => any) | null = null;
    onmessage: ((ev?: MessageEvent) => any) | null = null;
    onerror: ((ev?: Event) => any) | null = null;
    onclose: ((ev?: CloseEvent) => any) | null = null;
    readyState = 1;
    constructor() {}
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  } as any;
}

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Register ApolloTestingModule globally so services depending on Apollo are provided
getTestBed().configureTestingModule({
  imports: [ApolloTestingModule],
  providers: [
    {
      provide: Apollo,
      useValue: {
        // minimal mock: query returns observable with empty data
        query: () => of({ data: {} }),
        watchQuery: () => ({ valueChanges: of({ data: {} }) })
      }
    }
  ]
});
