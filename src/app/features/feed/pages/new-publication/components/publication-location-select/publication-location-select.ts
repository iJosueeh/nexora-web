import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-publication-location-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-2">
      <label for="location-select" class="text-xs font-semibold uppercase tracking-[0.08em] text-[#8b7f8a]">
        Ubicación
      </label>
      <select
        id="location-select"
        [value]="value()"
        (change)="onChange($event)"
        class="rounded-lg border border-[rgba(255,70,82,0.2)] bg-transparent px-3 py-2 text-sm text-[var(--brand-text)] focus:border-[#ff4652] focus:outline-none"
      >
        <option value="">Selecciona una región UTP...</option>
        @for (region of regions; track region) {
          <option [value]="region">{{ region }}</option>
        }
      </select>
    </div>
  `
})
export class PublicationLocationSelectComponent {
  readonly value = input<string>('');
  readonly locationChanged = output<string>();

  readonly regions: string[] = [
    'Lima',
    'Arequipa',
    'Chiclayo',
    'Chimbote',
    'Huancayo',
    'Ica',
    'Piura',
    'Trujillo'
  ];

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    this.locationChanged.emit(target?.value ?? '');
  }
}
