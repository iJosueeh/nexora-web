import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TRUST_BADGES_MOCK } from './mocks/trust-badges.mock';

@Component({
  selector: 'app-trust-badges',
  standalone: true,
  imports: [],
  templateUrl: './trust-badges.html',
  styleUrl: './trust-badges.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrustBadges {
  readonly badges = signal(TRUST_BADGES_MOCK);
  readonly hoveredId = signal<string | null>(null);

  onHover(id: string | null): void {
    this.hoveredId.set(id);
  }
}
