import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { FeedPublicationQueueService } from '../../services/feed-publication-queue.service';
import { FeedPublicationService } from '../../services/feed-publication.service';
import { PublicationDraft } from './publication-draft.model';
import { PublicationComposerComponent } from './components/publication-composer/publication-composer';

@Component({
  selector: 'app-new-publication-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PublicationComposerComponent],
  templateUrl: './new-publication-page.html'
})
export class NewPublicationPage {
  private readonly router = inject(Router);
  private readonly publicationQueue = inject(FeedPublicationQueueService);
  private readonly publicationService = inject(FeedPublicationService);

  onPublished(draft: PublicationDraft): void {
    this.publicationService
      .publish(draft)
      .pipe(
        catchError((err) => {
          console.error('[NewPublicationPage] Error publicando:', err);
          return of(this.publicationService.buildOptimisticPost(draft));
        })
      )
      .subscribe((post) => {
        this.publicationQueue.queue(post);
        void this.router.navigate(['/feed']);
      });
  }
}
