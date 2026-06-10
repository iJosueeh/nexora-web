import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-publication-location-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publication-location-select.html',
  styleUrl: './publication-location-select.css'
})
export class PublicationLocationSelectComponent {
  readonly value = input<string>('');
  readonly locationChanged = output<string>();

  readonly allRegions = signal<string[]>([
    'Lima',
    'Arequipa',
    'Chiclayo',
    'Chimbote',
    'Huancayo',
    'Ica',
    'Piura',
    'Trujillo'
  ]);

  readonly searchQuery = signal('');
  readonly isOpen = signal(false);

  readonly filteredRegions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const regions = this.allRegions();
    if (!query) return regions;
    return regions.filter(region =>
      region.toLowerCase().includes(query)
    );
  });

  readonly selectedLabel = computed(() => {
    const val = this.value();
    return val || 'Selecciona una región UTP...';
  });

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
    if (!this.isOpen()) {
      this.searchQuery.set('');
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  selectRegion(region: string): void {
    this.locationChanged.emit(region);
    this.closeDropdown();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchQuery.set(target?.value ?? '');
  }
}