import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthSession } from '../../../../../../core/services/auth-session';
import { ResearchService } from '../../services/research.service';
import { ResearchPaper } from '../../interfaces/research-paper.model';

@Component({
  selector: 'app-research-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
  readonly isEditing = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly isOwner = signal(false);
  readonly isSubmitting = signal(false);
  readonly error = signal('');

  readonly editTitle = signal('');
  readonly editSummary = signal('');
  readonly editFaculty = signal('');
  readonly editPdfUrl = signal('');

  readonly faculties = signal([
    'Sistemas', 'Software', 'Industrial', 'Arquitectura',
    'Administración', 'Marketing'
  ]);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.researchService.getResearchBySlug(slug).subscribe({
        next: (data) => {
          this.paper.set(data);
          this.isLoading.set(false);
          this.checkOwnership(data);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  private checkOwnership(paper: ResearchPaper): void {
    const userId = this.auth.getUser()?.id;
    this.isOwner.set(!!userId && paper.author.id === userId);
  }

  startEdit(): void {
    const p = this.paper();
    if (!p) return;
    this.editTitle.set(p.title);
    this.editSummary.set(p.summary);
    this.editFaculty.set(p.faculty);
    this.editPdfUrl.set(p.pdfUrl || '');
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.error.set('');
  }

  saveEdit(): void {
    const p = this.paper();
    if (!p) return;

    if (!this.editTitle() || !this.editSummary()) {
      this.error.set('El título y el resumen son obligatorios');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    this.researchService.updatePaper(p.id, {
      title: this.editTitle(),
      summary: this.editSummary(),
      faculty: this.editFaculty(),
      pdfUrl: this.editPdfUrl() || undefined,
    }).subscribe({
      next: (updated) => {
        this.paper.set(updated);
        this.isEditing.set(false);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err?.message || 'Error al actualizar');
      }
    });
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deletePaper(): void {
    const p = this.paper();
    if (!p) return;

    this.isSubmitting.set(true);
    this.researchService.deletePaper(p.id).subscribe({
      next: () => {
        this.router.navigate(['/explorar']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.showDeleteConfirm.set(false);
        this.error.set(err?.message || 'Error al eliminar');
      }
    });
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
    }
  }

  downloadPDF(): void {
    const p = this.paper();
    if (p?.pdfUrl) {
      window.open(p.pdfUrl, '_blank');
    }
  }
}
