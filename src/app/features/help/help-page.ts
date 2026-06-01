import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShellLayout } from '../../shared/components/shell-layout/shell-layout';
import { FeedSidebar } from '../feed/components/feed-sidebar/feed-sidebar';

export abstract class HelpPageBase {
  activeTab = signal<'faq' | 'soporte'>('faq');
  
  readonly supportFormLink = 'https://forms.gle/BCR5YJmdc76qk5xN9';

  setTab(tab: 'faq' | 'soporte'): void {
    this.activeTab.set(tab);
  }
}

@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [CommonModule, ShellLayout, FeedSidebar],
  templateUrl: './help-page.html',
  styleUrl: './help-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpPage extends HelpPageBase {}

