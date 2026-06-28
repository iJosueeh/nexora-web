import { ChangeDetectionStrategy, Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCard } from './components/event-card/event-card';
import { EventCreateForm } from './components/event-create-form/event-create-form';
import { UniversityEvent } from './interfaces/event.model';
import { EventService } from './services/event.service';
import { AuthSession } from '../../../../core/services/auth-session';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, EventCard, EventCreateForm],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventosPage {
  private readonly eventService = inject(EventService);
  private readonly auth = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly categories = signal(['Todos', 'Debate', 'Taller', 'Feria', 'Conferencia']);
  readonly selectedCategory = signal('Todos');
  readonly events = signal<UniversityEvent[]>([]);
  readonly isLoading = signal(true);
  readonly showCreateForm = signal(false);
  readonly loadError = signal('');

  constructor() {
    effect(() => {
      this.loadEvents();
    }, { allowSignalWrites: true });
  }

  loadEvents(): void {
    const category = this.selectedCategory();
    const categoryFilter = category === 'Todos' ? undefined : category;

    this.isLoading.set(true);
    this.loadError.set('');
    this.eventService.getEvents(20, 0, categoryFilter).subscribe({
      next: (data) => {
        this.events.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[EventosPage] Error loading events:', err);
        this.loadError.set(err?.message || 'Error al cargar eventos');
        this.events.set([]);
        this.isLoading.set(false);
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  toggleCreateForm(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.showCreateForm.update(v => !v);
  }

  onEventCreated(): void {
    this.showCreateForm.set(false);
    this.toastr.success('Evento creado exitosamente');
    this.loadEvents();
  }

  onDeleteEvent(eventId: string): void {
    this.events.update(events => events.filter(e => e.id !== eventId));
    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.toastr.success('Evento eliminado');
      },
      error: (err) => {
        console.error('[EventosPage] Error deleting event:', err);
        this.toastr.error(err?.message || 'Error al eliminar el evento', 'Error');
        this.loadEvents();
      }
    });
  }
}
