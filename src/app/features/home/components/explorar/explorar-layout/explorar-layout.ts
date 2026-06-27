import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { ShellLayout } from '../../../../../shared/components/shell-layout/shell-layout';
import { FeedSidebar } from '../../../../feed/components/feed-sidebar/feed-sidebar';

@Component({
  selector: 'app-explorar-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ShellLayout, FeedSidebar],
  templateUrl: './explorar-layout.html',
  styleUrl: './explorar-layout.css',
})
export class ExplorarLayout {}
