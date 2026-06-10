import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuggestedUser } from '../../../../../feed/models/trend.model';

@Component({
  selector: 'app-user-suggest-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-suggest-card.html',
  styleUrl: './user-suggest-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSuggestCard {
  readonly user = input.required<SuggestedUser>();
  readonly followToggle = output<SuggestedUser>();

  onFollow(): void {
    this.followToggle.emit(this.user());
  }
}