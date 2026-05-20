import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

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

  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

class MockWebSocket {
  // Static readyState constants expected on the constructor
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  // Instance properties
  readonly url: string;
  readonly protocol: string = '';
  readonly extensions: string = '';
  readonly bufferedAmount: number = 0;
  readyState: number = MockWebSocket.OPEN;
  binaryType: string = 'blob';

  // Use looser types to avoid strict DOM typings in tests
  onopen: any = null;
  onmessage: any = null;
  onerror: any = null;
  onclose: any = null;

  constructor(url: string | URL, protocols?: string | string[]) {
    this.url = typeof url === 'string' ? url : url.toString();
    // protocols ignored in mock
  }

  // Minimal API surface for tests
  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose.call(this, new CloseEvent('close'));
  }

  send(_data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    // no-op in mock
  }

  addEventListener(_type: string, _listener?: EventListenerOrEventListenerObject | null): void {
    // noop
  }

  removeEventListener(_type: string, _listener?: EventListenerOrEventListenerObject | null): void {
    // noop
  }

  dispatchEvent(_event: Event): boolean {
    return true;
  }
}

// Assign mock constructor to global WebSocket
(globalThis as any).WebSocket = MockWebSocket as any;

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);