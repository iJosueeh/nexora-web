import { ChangeDetectionStrategy, Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthSession } from '../../../../../../core/services/auth-session';
import { UniversityEvent } from '../../interfaces/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCard {
  private readonly router = inject(Router);
  readonly auth = inject(AuthSession);

  readonly event = input.required<UniversityEvent>();
  readonly deleted = output<string>();
  readonly isSubmitting = signal(false);
  readonly hasConfirmed = signal(false);
  readonly showDeleteConfirm = signal(false);

  confirmRSVP(e: Event): void {
    e.stopPropagation();
    
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    this.isSubmitting.set(true);
    
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.hasConfirmed.set(true);
    }, 1500);
  }

  onDeleteClick(e: Event): void {
    e.stopPropagation();
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(e: Event): void {
    e.stopPropagation();
    this.deleted.emit(this.event().id);
    this.showDeleteConfirm.set(false);
  }

  cancelDelete(e: Event): void {
    e.stopPropagation();
    this.showDeleteConfirm.set(false);
  }
}
