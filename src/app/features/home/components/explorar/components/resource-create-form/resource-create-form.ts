import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthSession } from '../../../../../../core/services/auth-session';
import { ResourceService } from '../../services/resource.service';
import {
  ResourceCategory,
  ResourceType,
  RESOURCE_TYPE_LABELS,
} from '../../../../../../interfaces/resources';

const MAX_FILE_SIZE_MB = 20;
const ALLOWED_FORMATS = ['application/pdf', 'application/epub+zip', 'text/markdown', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

@Component({
  selector: 'app-resource-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-create-form.html',
  styleUrl: './resource-create-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceCreateForm {
  private readonly resourceService = inject(ResourceService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthSession);

  readonly cancelled = output<void>();
  readonly created = output<void>();

  readonly title = signal('');
  readonly description = signal('');
  readonly selectedCategory = signal<ResourceCategory | null>(null);
  readonly selectedType = signal<ResourceType>(ResourceType.OTHER);
  readonly selectedFile = signal<File | null>(null);

  readonly categories = signal<ResourceCategory[]>([]);
  readonly resourceTypes = signal<ResourceType[]>(Object.values(ResourceType));
  readonly resourceTypeLabels = RESOURCE_TYPE_LABELS;
  readonly isSubmitting = signal(false);
  readonly error = signal('');
  readonly uploadProgress = signal(0);

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.resourceService.getResourceCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.error.set('No se pudieron cargar las categorías'),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.error.set('');

    if (!file) {
      return;
    }

    if (!ALLOWED_FORMATS.includes(file.type)) {
      this.error.set('Formato no soportado. Usa PDF, EPUB, MD, PPTX o DOCX.');
      this.selectedFile.set(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      this.error.set(`El archivo excede el límite de ${MAX_FILE_SIZE_MB}MB.`);
      this.selectedFile.set(null);
      return;
    }

    this.selectedFile.set(file);
  }

  submit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const file = this.selectedFile();
    const category = this.selectedCategory();

    if (!this.title() || !this.description() || !category || !file) {
      this.error.set('Completa todos los campos obligatorios y selecciona un archivo.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    this.resourceService
      .uploadResource(file, {
        title: this.title(),
        description: this.description(),
        categoryId: category.id,
        type: this.selectedType(),
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.created.emit();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err?.message || 'Error al subir el recurso');
        },
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
