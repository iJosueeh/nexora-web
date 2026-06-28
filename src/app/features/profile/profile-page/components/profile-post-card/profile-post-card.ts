import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileCard } from '../../profile-page.helpers';

@Component({
  selector: 'app-profile-post-card',
  standalone: true,
  imports: [],
  templateUrl: './profile-post-card.html',
  styleUrl: './profile-post-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePostCard {
  readonly card = input.required<ProfileCard>();
  readonly featured = input<boolean>(false);

  private readonly router = inject(Router);

  navigateToPost(): void {
    void this.router.navigate(['/feed/post', this.card().id]);
  }
}