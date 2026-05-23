import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entity-form-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-shell.html',
  styleUrls: ['./form-shell.css'],
})
export class EntityFormShellComponent {
  title = input<string>('Formulario');
  loading = input<boolean>(false);
  saveLabel = input<string>('Guardar');
  cancelLabel = input<string>('Cancelar');

  onSave = output<void>();
  onCancel = output<void>();
}
