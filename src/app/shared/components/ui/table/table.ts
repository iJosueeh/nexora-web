import { Component, Input, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'badge' | 'image';
  transform?: (value: any) => string;
}

export interface TableAction {
  label: string;
  icon?: string;
  class?: string;
  callback: (item: any) => void;
  show?: (item: any) => boolean;
}

@Component({
  selector: 'app-nexora-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrls: ['./table.css'],
})
export class NexoraTableComponent {
  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  actions = input<TableAction[]>([]);
  
  onRowClick = output<any>();

  getProperty(item: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }
}
