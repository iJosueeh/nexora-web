import { ChangeDetectionStrategy, Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCard } from './components/event-card/event-card';
import { UniversityEvent } from './interfaces/event.model';
import { EventService } from './services/event.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, EventCard],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventosPage {
  private readonly eventService = inject(EventService);

  readonly categories = signal(['Todos', 'Debate', 'Taller', 'Feria', 'Conferencia']);
  readonly selectedCategory = signal('Todos');
  readonly events = signal<UniversityEvent[]>([]);
  readonly isLoading = signal(true);

  constructor() {
    effect(() => {
      this.loadEvents();
    }, { allowSignalWrites: true });
  }

  loadEvents(): void {
    const category = this.selectedCategory();
    const categoryFilter = category === 'Todos' ? undefined : category;

    this.isLoading.set(true);
    this.eventService.getEvents(20, 0, categoryFilter).subscribe({
      next: (data) => {
        this.events.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }
}
