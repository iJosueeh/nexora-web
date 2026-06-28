import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthSession } from '../../../../core/services/auth-session';
import { ResourceService } from './services/resource.service';
import { ResourceCard } from './components/resource-card/resource-card';
import { ResourceFilters, ResourceFiltersValue } from './components/resource-filters/resource-filters';
import { AcademicResource, ResourceCategory } from '../../../../interfaces/resources';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, ResourceCard, ResourceFilters],
  templateUrl: './explorar.html',
  styleUrl: './explorar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorarPage implements AfterViewInit, OnDestroy {
  private readonly resourceService = inject(ResourceService);
  private observer: IntersectionObserver | null = null;

  readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');

  readonly resources = signal<AcademicResource[]>([]);
  readonly categories = signal<ResourceCategory[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly hasMore = signal(true);
  readonly filters = signal<ResourceFiltersValue>({
    query: '',
    categoryId: null,
    type: null,
    minRating: null,
  });

  private offset = 0;

  constructor() {
    effect(() => {
      this.offset = 0;
      this.hasMore.set(true);
      this.loadResources(true);
    }, { allowSignalWrites: true });

    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.isLoadingMore() && this.hasMore()) {
          this.loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    const el = this.sentinel()?.nativeElement;
    if (el) {
      this.observer.observe(el);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  loadResources(replace = false): void {
    const current = this.filters();
    const filter = {
      ...(current.categoryId ? { categoryId: current.categoryId } : {}),
      ...(current.type ? { type: current.type } : {}),
      ...(current.minRating ? { minRating: current.minRating } : {}),
      ...(current.query ? { query: current.query } : {}),
    };

    this.isLoading.set(true);
    this.resourceService.getResources(PAGE_SIZE, this.offset, filter).subscribe({
      next: (data) => {
        if (replace) {
          this.resources.set(data);
        } else {
          this.resources.update((prev) => [...prev, ...data]);
        }
        this.hasMore.set(data.length === PAGE_SIZE);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadMore(): void {
    this.offset += PAGE_SIZE;
    this.isLoadingMore.set(true);
    this.loadResources(false);
    this.isLoadingMore.set(false);
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
