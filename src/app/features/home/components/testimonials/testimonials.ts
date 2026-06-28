import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TESTIMONIALS_MOCK } from './mocks/testimonials.mock';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Testimonials {
  readonly testimonials = signal(TESTIMONIALS_MOCK);
  readonly activeIndex = signal(0);
  readonly expandedId = signal<number | null>(null);
  readonly tiltMap = signal<Record<number, { rx: number; ry: number }>>({});

  prev(): void {
    const len = this.testimonials().length;
    this.activeIndex.update((i) => (i - 1 + len) % len);
  }

  next(): void {
    this.activeIndex.update((i) => (i + 1) % this.testimonials().length);
  }

  setActive(index: number): void {
    this.activeIndex.set(index);
  }

  toggleExpand(id: number): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  onTilt(id: number, event: MouseEvent): void {
    const card = (event.currentTarget as HTMLElement);
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rx = ((y - rect.height / 2) / rect.height) * -16;
    const ry = ((x - rect.width / 2) / rect.width) * 16;

    this.tiltMap.update((m) => ({ ...m, [id]: { rx, ry } }));
  }

  resetTilt(id: number): void {
    this.tiltMap.update((m) => ({ ...m, [id]: { rx: 0, ry: 0 } }));
  }

  getTilt(id: number): string {
    const t = this.tiltMap()[id];
    if (!t || (t.rx === 0 && t.ry === 0)) {
      return 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    }
    return `perspective(800px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale3d(1.02,1.02,1.02)`;
  }
}
