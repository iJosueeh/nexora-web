import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StudyGroup } from '../../interfaces/group.model';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-card.html',
  styleUrl: './group-card.css',
})
export class GroupCard {
  readonly group = input.required<StudyGroup>();
  readonly isHovered = signal(false);

  constructor(private readonly router: Router) {}

  navigateToGroup(): void {
    void this.router.navigate(['/groups', this.group().slug]);
  }
}
