import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementService, AdminEvent } from '../../services/management.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-events-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css'],
})
export class EventsView implements OnInit {
  private readonly managementService = inject(ManagementService);
  private readonly toast = inject(ToastService);
  private readonly LIMIT = 12;

  readonly events = this.managementService.events;
  readonly loading = this.managementService.loading;
  readonly currentOffset = signal(0);

  readonly hasMore = computed(() => {
    const list = this.events();
    return list.length > 0 && list.length % this.LIMIT === 0;
  });

  // Modal State
  readonly isModalOpen = signal(false);
  readonly modalEvent = signal<AdminEvent | null>(null);
  readonly modalMode = signal<'create' | 'edit' | 'delete'>('create');

  // Form State
  readonly form = signal({
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    image: '',
    whatsapp: '',
    telegram: '',
    discord: ''
  });

  ngOnInit(): void {
    this.managementService.resetEvents();
    this.loadInitialEvents();
  }

  loadInitialEvents(): void {
    this.currentOffset.set(0);
    this.managementService.loadEvents(this.LIMIT, 0, false);
  }

  loadMoreEvents(): void {
    const nextOffset = this.currentOffset() + this.LIMIT;
    this.currentOffset.set(nextOffset);
    this.managementService.loadEvents(this.LIMIT, nextOffset, true);
  }

  openModal(mode: 'create' | 'edit' | 'delete', event?: AdminEvent): void {
    this.modalMode.set(mode);
    this.modalEvent.set(event || null);
    
    if (mode === 'edit' && event) {
      this.form.set({
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        category: event.category,
        image: event.image || '',
        whatsapp: event.communityLinks?.whatsapp || '',
        telegram: event.communityLinks?.telegram || '',
        discord: event.communityLinks?.discord || ''
      });
    } else {
      this.form.set({
        title: '',
        description: '',
        date: '',
        location: '',
        category: 'Conferencia',
        image: '',
        whatsapp: '',
        telegram: '',
        discord: ''
      });
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.modalEvent.set(null);
  }

  save(): void {
    const mode = this.modalMode();
    const input = this.form();

    if (!input.title || !input.description || !input.date) {
      this.toast.show('Por favor completa los campos obligatorios', 'warning');
      return;
    }

    if (mode === 'create') {
      this.managementService.createEvent(input).subscribe({
        next: () => this.onSuccess('Evento creado con éxito'),
        error: (err) => this.toast.show(err.message || 'Error al crear evento', 'error')
      });
    } else if (mode === 'edit') {
      const event = this.modalEvent();
      if (!event) return;
      this.managementService.updateEvent(event.id, input).subscribe({
        next: () => this.onSuccess('Evento actualizado con éxito'),
        error: (err) => this.toast.show(err.message || 'Error al actualizar evento', 'error')
      });
    }
  }

  confirmDelete(): void {
    const event = this.modalEvent();
    if (!event) return;

    this.managementService.deleteEvent(event.id).subscribe({
      next: () => this.onSuccess('Evento eliminado con éxito'),
      error: (err) => this.toast.show(err.message || 'Error al eliminar evento', 'error')
    });
  }

  private onSuccess(msg: string): void {
    this.toast.show(msg, 'success');
    this.loadInitialEvents();
    this.closeModal();
  }
}
