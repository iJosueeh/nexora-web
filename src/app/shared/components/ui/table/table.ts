import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'badge' | 'image';
  transform?: (value: unknown) => string;
}

export interface TableAction {
  label: string;
  icon?: string;
  class?: string;
  callback: (item: Record<string, unknown>) => void;
  show?: (item: Record<string, unknown>) => boolean;
}

@Component({
  selector: 'app-nexora-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrls: ['./table.css'],
})
export class NexoraTableComponent {
  data = input<Record<string, unknown>[]>([]);
  columns = input<TableColumn[]>([]);
  actions = input<TableAction[]>([]);
  
  rowClick = output<Record<string, unknown>>();

  getProperty(item: Record<string, unknown>, key: string): any {
    return key.split('.').reduce((obj: any, k) => obj?.[k], item);
  }
}

