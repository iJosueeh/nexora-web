import { ChangeDetectionStrategy, Component, Input, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthSession } from '../../../../../../core/services/auth-session';
import { ResearchService } from '../../services/research.service';
import { ResearchPaper } from '../../interfaces/research-paper.model';

@Component({
  selector: 'app-research-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './research-detail.html',
  styleUrl: './research-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResearchDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthSession);
  private readonly researchService = inject(ResearchService);

  readonly paper = signal<ResearchPaper | undefined>(undefined);
  readonly isSaved = signal(false);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.researchService.getResearchBySlug(slug).subscribe({
        next: (data) => {
          this.paper.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  toggleSave(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.isSaved.set(!this.isSaved());
  }

  async shareResearch(): Promise<void> {
    const p = this.paper();
    if (!p) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: p.title,
          text: `Mira esta investigación en Nexora: ${p.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      // Aquí podrías disparar un toast de notificación
    }
  }

  downloadPDF(): void {
    // Simulación: En un caso real abriríamos la URL del PDF del paper
    const mockPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    window.open(mockPdfUrl, '_blank');
  }
}
