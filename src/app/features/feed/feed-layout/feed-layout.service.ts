import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeedLayoutState {
  readonly showRight = signal(false);
}
