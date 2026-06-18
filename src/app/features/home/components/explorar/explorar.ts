import { ChangeDetectionStrategy, Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResearchCard } from './components/research-card/research-card';
import { ResourceCreateForm } from './components/resource-create-form/resource-create-form';
import { ResearchPaper } from './interfaces/research-paper.model';
import { ResearchService } from './services/research.service';
import { AuthSession } from '../../../../core/services/auth-session';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, ResearchCard, ResourceCreateForm],
  templateUrl: './explorar.html',
  styleUrl: './explorar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorarPage {
  private readonly researchService = inject(ResearchService);
  private readonly auth = inject(AuthSession);

  readonly categories = signal(['Todos', 'Sistemas', 'Software', 'Industrial', 'Arquitectura', 'Administración', 'Marketing']);
  readonly selectedCategory = signal('Todos');
  readonly papers = signal<ResearchPaper[]>([]);
  readonly isLoading = signal(false);
  readonly showCreateForm = signal(false);

  constructor() {
    effect(() => {
      this.loadPapers();
    }, { allowSignalWrites: true });
  }

  loadPapers(): void {
    const category = this.selectedCategory();
    const facultyFilter = category === 'Todos' ? undefined : category;

    this.isLoading.set(true);
    this.researchService.getResearchPapers(20, 0, facultyFilter).subscribe({
      next: (data) => {
        this.papers.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  toggleCreateForm(): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    this.showCreateForm.set(!this.showCreateForm());
  }

  onPaperCreated(): void {
    this.showCreateForm.set(false);
    this.loadPapers();
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
}
