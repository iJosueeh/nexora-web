import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-widget.html',
  styleUrl: './rating-widget.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingWidget {
  readonly rating = input.required<number>();
  readonly userRating = input<number | null>(null);
  readonly ratingsCount = input<number>(0);
  readonly readonly = input<boolean>(false);
  readonly showCount = input<boolean>(true);
  readonly isSubmitting = input<boolean>(false);

  readonly rate = output<number>();

  readonly hoverRating = signal(0);
  readonly stars = [1, 2, 3, 4, 5];

  readonly displayRating = computed(() => {
    if (this.hoverRating() > 0) {
      return this.hoverRating();
    }
    return this.userRating() ?? this.rating();
  });

  onRate(value: number): void {
    if (this.readonly() || this.isSubmitting()) {
      return;
    }
    this.rate.emit(value);
  }
}
