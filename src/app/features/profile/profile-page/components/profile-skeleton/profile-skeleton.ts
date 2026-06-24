import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './profile-skeleton.html',
  styleUrl: './profile-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSkeleton {}