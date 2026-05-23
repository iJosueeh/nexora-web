import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResearchPaper } from '../../interfaces/research-paper.model';

@Component({
  selector: 'app-research-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './research-card.html',
  styleUrl: './research-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResearchCard {
  readonly paper = input.required<ResearchPaper>();
}
