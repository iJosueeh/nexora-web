import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthSession } from '../../../../core/services/auth-session';
import { ResourceService } from './services/resource.service';
import { ResourceCard } from './components/resource-card/resource-card';
import { ResourceFilters, ResourceFiltersValue } from './components/resource-filters/resource-filters';
import { AcademicResource, ResourceCategory } from '../../../../interfaces/resources';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, ResourceCard, ResourceFilters],
  templateUrl: './explorar.html',
  styleUrl: './explorar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorarPage {
  private readonly resourceService = inject(ResourceService);

  readonly resources = signal<AcademicResource[]>([]);
  readonly categories = signal<ResourceCategory[]>([]);
  readonly isLoading = signal(false);
  readonly filters = signal<ResourceFiltersValue>({
    query: '',
    categoryId: null,
    type: null,
    minRating: null,
  });

  constructor() {
    effect(() => {
      this.loadResources();
    }, { allowSignalWrites: true });

    this.loadCategories();
  }

  loadResources(): void {
    const current = this.filters();
    const filter = {
      ...(current.categoryId ? { categoryId: current.categoryId } : {}),
      ...(current.type ? { type: current.type } : {}),
      ...(current.minRating ? { minRating: current.minRating } : {}),
      ...(current.query ? { query: current.query } : {}),
    };

    this.isLoading.set(true);
    this.resourceService.getResources(20, 0, filter).subscribe({
      next: (data) => {
        this.resources.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadCategories(): void {
    this.resourceService.getResourceCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.categories.set([]),
    });
  }

  updateFilters(updated: ResourceFiltersValue): void {
    this.filters.set(updated);
  }
}
