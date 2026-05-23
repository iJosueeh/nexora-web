import { ChangeDetectionStrategy, Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResearchCard } from './components/research-card/research-card';
import { ResearchPaper } from './interfaces/research-paper.model';
import { ResearchService } from './services/research.service';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, ResearchCard],
  templateUrl: './explorar.html',
  styleUrl: './explorar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorarPage {
  private readonly researchService = inject(ResearchService);

  readonly categories = signal(['Todos', 'Sistemas', 'Software', 'Industrial', 'Arquitectura', 'Administración', 'Marketing']);
  readonly selectedCategory = signal('Todos');
  readonly papers = signal<ResearchPaper[]>([]);
  readonly isLoading = signal(false);

  constructor() {
    // Recargar datos cuando cambie la categoría
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
}
