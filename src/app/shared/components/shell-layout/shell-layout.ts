import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type ShellLayoutMode = 'feed' | 'profile';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shell-layout.html',
})
export class ShellLayout {
  @Input() showLeft = true;
  @Input() showRight = true;
  @Input() mode: ShellLayoutMode = 'feed';
  @Input() fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
}
