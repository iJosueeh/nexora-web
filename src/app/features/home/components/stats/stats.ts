import { ChangeDetectionStrategy, Component, signal, afterNextRender, ElementRef, viewChild } from '@angular/core';
import { STATS_MOCK } from './mocks/stats.mock';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stats {
  private readonly sectionRef = viewChild<ElementRef<HTMLElement>>('statsSection');

  readonly stats = signal(STATS_MOCK);
  readonly displayValues = signal<number[]>([0, 0, 0]);
  readonly hasAnimated = signal(false);

  constructor() {
    afterNextRender({
      write: () => {
        const el = this.sectionRef()?.nativeElement;
        if (!el) return;

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              this.startCounterAnimation();
              observer.disconnect();
            }
          },
          { threshold: 0.3 },
        );

        observer.observe(el);
      },
    });
  }

  private startCounterAnimation(): void {
    if (this.hasAnimated()) return;
    this.hasAnimated.set(true);

    const targets = STATS_MOCK.map((s) => s.numericValue);
    const duration = 1600;
    const steps = 50;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayValues.set(targets.map((t) => Math.round(t * eased)));

      if (currentStep >= steps) {
        clearInterval(timer);
        this.displayValues.set(targets);
      }
    }, interval);
  }
}
