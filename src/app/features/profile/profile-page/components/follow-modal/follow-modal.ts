import { Component, EventEmitter, Input, Output, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../services/profile.service';
import { AuthUser } from '../../../../../interfaces/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-follow-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './follow-modal.html',
  styleUrl: './follow-modal.css',
})
export class FollowModal implements OnChanges {
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  @Input() userId!: string;
  @Input() type: 'followers' | 'following' = 'followers';
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  users = signal<AuthUser[]>([]);
  isLoading = signal(true);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true && this.userId) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.isLoading.set(true);
    const obs = this.type === 'followers' 
      ? this.profileService.getFollowers(this.userId)
      : this.profileService.getFollowing(this.userId);

    obs.subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }

  toggleFollow(user: AuthUser, event: MouseEvent): void {
    event.stopPropagation();
    if (!user.id) return;

    this.profileService.toggleFollow(user.id).subscribe((isFollowing) => {
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, isFollowing } : u));
    });
  }

  goToProfile(username: string | undefined): void {
    if (!username) return;
    this.closeModal();
    void this.router.navigate(['/u', username.toLowerCase()]);
  }
}
