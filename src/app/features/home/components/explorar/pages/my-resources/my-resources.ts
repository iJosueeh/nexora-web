import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ResourceService } from '../../services/resource.service';
import { ResourceCard } from '../../components/resource-card/resource-card';
import { ResourceCreateForm } from '../../components/resource-create-form/resource-create-form';
import { AcademicResource } from '../../../../../../interfaces/resources';

@Component({
  selector: 'app-my-resources',
  standalone: true,
  imports: [CommonModule, RouterModule, ResourceCard, ResourceCreateForm],
  templateUrl: './my-resources.html',
  styleUrl: './my-resources.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyResourcesPage implements OnInit {
  private readonly resourceService = inject(ResourceService);

  readonly resources = signal<AcademicResource[]>([]);
  readonly isLoading = signal(true);
  readonly showCreateForm = signal(false);

  ngOnInit(): void {
    this.loadMyResources();
  }

  private loadMyResources(): void {
    this.isLoading.set(true);
    this.resourceService.getMyResources().subscribe({
      next: (data) => {
        this.resources.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
  }

  onResourceCreated(): void {
    this.showCreateForm.set(false);
    this.loadMyResources();
  }

  onCancelCreate(): void {
    this.showCreateForm.set(false);
  }
}
