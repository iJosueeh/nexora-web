import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile-dropdown.html',
  styleUrl: './profile-dropdown.css',
})
export class ProfileDropdownComponent {
  readonly isOpen = input.required<boolean>();
  readonly displayName = input.required<string>();
  readonly userHandle = input.required<string>();
  readonly profileLink = input.required<string[] | string>();
  readonly avatarUrl = input<string>();

  readonly closed = output<void>();
  readonly signOut = output<void>();

  readonly initials = computed(() => {
    const name = this.displayName();
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  });

  close(): void {
    this.closed.emit();
  }

  onSignOut(): void {
    this.signOut.emit();
    this.close();
  }
}
