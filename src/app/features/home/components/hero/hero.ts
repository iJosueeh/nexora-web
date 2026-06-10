import { ChangeDetectionStrategy, Component, signal, afterNextRender, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  readonly scrollProgress = signal(0);
  readonly isContentVisible = signal(false);

  constructor() {
    afterNextRender({
      write: () => {
        setTimeout(() => this.isContentVisible.set(true), 200);
      },
    });
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    this.scrollProgress.set(Math.round(progress));
  }

  scrollDown(): void {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  }
}
