import { ChangeDetectionStrategy, Component, input, signal, inject } from '@angular/core';
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
  private readonly auth = inject(AuthSession);

  readonly event = input.required<UniversityEvent>();
  readonly isSubmitting = signal(false);
  readonly hasConfirmed = signal(false);

  confirmRSVP(e: Event): void {
    e.stopPropagation(); // Evitar que el clic en el botón active el routerLink de la tarjeta si lo tuviera
    
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    this.isSubmitting.set(true);
    
    // Simulación de API
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.hasConfirmed.set(true);
    }, 1500);
  }
}
