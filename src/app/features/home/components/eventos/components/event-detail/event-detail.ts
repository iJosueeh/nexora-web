import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthSession } from '../../../../../../core/services/auth-session';
import { EventService } from '../../services/event.service';
import { UniversityEvent } from '../../interfaces/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthSession);
  private readonly eventService = inject(EventService);

  readonly event = signal<UniversityEvent | undefined>(undefined);
  readonly isSubmitting = signal(false);
  readonly hasConfirmed = signal(false);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.eventService.getEventBySlug(slug).subscribe({
        next: (data) => {
          this.event.set(data);
          this.hasConfirmed.set(data.isUserRegistered ?? false);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  confirmRSVP(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const currentEvent = this.event();
    if (!currentEvent) return;

    this.isSubmitting.set(true);
    this.eventService.confirmRSVP(currentEvent.id).subscribe({
      next: (updated) => {
        this.isSubmitting.set(false);
        this.hasConfirmed.set(true);
        // Actualizar datos locales
        this.event.set({
          ...currentEvent,
          attendeesCount: updated.attendeesCount,
          isUserRegistered: true
        });
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}
