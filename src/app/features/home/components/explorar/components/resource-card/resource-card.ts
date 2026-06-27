import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AcademicResource, RESOURCE_TYPE_LABELS } from '../../../../../../interfaces/resources';
import { RatingWidget } from '../../../../../../shared/components/rating-widget/rating-widget';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [CommonModule, RouterModule, RatingWidget],
  templateUrl: './resource-card.html',
  styleUrl: './resource-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceCard {
  readonly resource = input.required<AcademicResource>();
  readonly resourceTypeLabels = RESOURCE_TYPE_LABELS;

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
