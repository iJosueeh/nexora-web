import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ResourceCategory, ResourceType, RESOURCE_TYPE_LABELS } from '../../../../../../interfaces/resources';

export interface ResourceFiltersValue {
  query: string;
  categoryId: string | null;
  type: ResourceType | null;
  minRating: number | null;
}

@Component({
  selector: 'app-resource-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-filters.html',
  styleUrl: './resource-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceFilters {
  readonly categories = input.required<ResourceCategory[]>();
  readonly filters = input.required<ResourceFiltersValue>();
  readonly filtersChange = output<ResourceFiltersValue>();

  readonly resourceTypes = Object.values(ResourceType);
  readonly resourceTypeLabels = RESOURCE_TYPE_LABELS;
  readonly ratingOptions = [0, 1, 2, 3, 4];

  update<K extends keyof ResourceFiltersValue>(key: K, value: ResourceFiltersValue[K]): void {
    this.filtersChange.emit({ ...this.filters(), [key]: value });
  }
}
