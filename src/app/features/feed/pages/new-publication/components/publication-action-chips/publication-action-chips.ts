import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

interface PublicationAction {
  id: string;
  label: string;
  iconPath: string;
}

@Component({
  selector: 'app-publication-action-chips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publication-action-chips.html'
})
export class PublicationActionChipsComponent {
  readonly actionsChanged = output<string[]>();

  readonly actions: PublicationAction[] = [
    {
      id: 'tags',
      label: 'Etiquetas',
      iconPath: 'M20.59 13.41 11 23l-9-9V3h11Z'
    },
    {
      id: 'location',
      label: 'Ubicación',
      iconPath: 'M12 21s6-5.33 6-10a6 6 0 0 0-12 0c0 4.67 6 10 6 10Z'
    }
  ];

  readonly activeActions = signal<string[]>([]);

  toggleAction(actionId: string): void {
    this.activeActions.update((current) =>
      current.includes(actionId)
        ? current.filter((item) => item !== actionId)
        : [...current, actionId]
    );

    this.actionsChanged.emit(this.activeActions());
  }
}
