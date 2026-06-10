import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FEATURE_CARDS_MOCK } from './mocks/feature-cards.mock';

@Component({
  selector: 'app-feature-cards',
  standalone: true,
  imports: [],
  templateUrl: './feature-cards.html',
  styleUrl: './feature-cards.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureCards {
  readonly cards = signal(FEATURE_CARDS_MOCK);
  readonly hoveredId = signal<string | null>(null);

  onHover(id: string | null): void {
    this.hoveredId.set(id);
  }
}
