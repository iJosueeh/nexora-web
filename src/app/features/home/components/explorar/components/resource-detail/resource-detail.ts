import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { AuthSession } from '../../../../../../core/services/auth-session';
import { ResourceService } from '../../services/resource.service';
import { RatingWidget } from '../../../../../../shared/components/rating-widget/rating-widget';
import { AcademicResource, RESOURCE_TYPE_LABELS } from '../../../../../../interfaces/resources';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RatingWidget],
  templateUrl: './resource-detail.html',
  styleUrl: './resource-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthSession);
  private readonly resourceService = inject(ResourceService);
  private readonly destroyRef = inject(DestroyRef);

  readonly resource = signal<AcademicResource | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly isSubmittingRating = signal(false);
  readonly isDownloading = signal(false);
  readonly error = signal('');

  readonly resourceTypeLabels = RESOURCE_TYPE_LABELS;

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadResource(id);
    } else {
      this.route.params.pipe(take(1)).subscribe((params) => {
        const routeId = params['id'];
        if (routeId) {
          this.loadResource(routeId);
        } else {
          this.router.navigate(['/explorar']);
        }
      });
    }
  }

  private loadResource(id: string): void {
    this.isLoading.set(true);
    this.error.set('');
    this.resourceService.getResourceById(id).subscribe({
      next: (data) => {
        this.resource.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el recurso');
        this.isLoading.set(false);
      },
    });
  }

  onRate(rating: number): void {
    const resource = this.resource();
    if (!resource || !this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.isSubmittingRating.set(true);
    this.resourceService.rateResource(resource.id, rating).subscribe({
      next: () => {
        this.isSubmittingRating.set(false);
        this.refreshResource(resource.id);
      },
      error: (err) => {
        this.isSubmittingRating.set(false);
        this.error.set(err?.message || 'Error al calificar');
      },
    });
  }

  download(): void {
    const resource = this.resource();
    if (!resource) return;

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.isDownloading.set(true);
    this.resourceService.getResourceDownloadUrl(resource.id).subscribe({
      next: (url) => {
        this.isDownloading.set(false);
        window.open(url, '_blank');
      },
      error: (err) => {
        this.isDownloading.set(false);
        this.error.set(err?.message || 'Error al generar el enlace de descarga');
      },
    });
  }

  private refreshResource(id: string): void {
    this.resourceService.getResourceById(id).subscribe({
      next: (data) => this.resource.set(data),
      error: () => undefined,
    });
  }
}
