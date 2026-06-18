import { ChangeDetectionStrategy, Component, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CreateEventInput } from '../../interfaces/event.model';
import { AuthSession } from '../../../../../../core/services/auth-session';

@Component({
  selector: 'app-event-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-create-form.html',
  styleUrl: './event-create-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCreateForm {
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthSession);

  readonly cancelled = output<void>();
  readonly created = output<void>();

  readonly title = signal('');
  readonly description = signal('');
  readonly date = signal('');
  readonly location = signal('');
  readonly category = signal('Taller');
  readonly image = signal('');
  readonly organizerName = signal('');
  readonly organizerRole = signal('');
  readonly whatsapp = signal('');
  readonly telegram = signal('');
  readonly discord = signal('');

  readonly categories = signal(['Debate', 'Taller', 'Feria', 'Conferencia']);
  readonly isSubmitting = signal(false);
  readonly error = signal('');

  submit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.title() || !this.date()) {
      this.error.set('El título y la fecha son obligatorios');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    const input: CreateEventInput = {
      title: this.title(),
      description: this.description() || undefined,
      date: this.date(),
      location: this.location() || undefined,
      category: this.category(),
      image: this.image() || undefined,
      organizerName: this.organizerName() || undefined,
      organizerRole: this.organizerRole() || undefined,
      whatsapp: this.whatsapp() || undefined,
      telegram: this.telegram() || undefined,
      discord: this.discord() || undefined,
    };

    this.eventService.createEvent(input).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.created.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err?.message || 'Error al crear el evento');
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
