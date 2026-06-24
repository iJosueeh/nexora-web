import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FeedContainerComponent } from '../../components/feed-container/feed-container';
import { BreadcrumbComponent } from '../../../../shared/components/ui/breadcrumb/breadcrumb';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [FeedContainerComponent, BreadcrumbComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css'
})
export class FeedPage {
}
