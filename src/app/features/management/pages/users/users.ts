import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementService, UserProfile } from '../../services/management.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class UsersView implements OnInit, OnDestroy {
  private readonly managementService = inject(ManagementService);
  private readonly LIMIT = 12; 
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();
  
  readonly users = this.managementService.users;
  readonly loading = this.managementService.loading;
  
  readonly currentOffset = signal(0);
  readonly searchTerm = signal('');
  
  readonly hasMore = computed(() => {
    const list = this.users();
    return list.length > 0 && list.length % this.LIMIT === 0;
  });

  // Modal State
  readonly isModalOpen = signal(false);
  readonly modalUser = signal<UserProfile | null>(null);
  readonly modalAction = signal<'activate' | 'deactivate' | 'edit'>('activate');

  // Edit Form State
  readonly editForm = signal({
    fullName: '',
    username: '',
    career: ''
  });

  ngOnInit(): void {
    this.managementService.resetUsers(); 
    this.loadInitialUsers();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.loadInitialUsers();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  loadInitialUsers(): void {
    this.currentOffset.set(0);
    this.managementService.loadUsers(this.LIMIT, 0, false, this.searchTerm());
  }

  loadMoreUsers(): void {
    const nextOffset = this.currentOffset() + this.LIMIT;
    this.currentOffset.set(nextOffset);
    this.managementService.loadUsers(this.LIMIT, nextOffset, true, this.searchTerm());
  }

  openConfirmModal(user: UserProfile, action: 'activate' | 'deactivate'): void {
    this.modalUser.set(user);
    this.modalAction.set(action);
    this.isModalOpen.set(true);
  }

  openEditModal(user: UserProfile): void {
    this.modalUser.set(user);
    this.modalAction.set('edit');
    this.editForm.set({
      fullName: user.fullName,
      username: user.username || '',
      career: user.career || ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.modalUser.set(null);
  }

  confirmAction(): void {
    const action = this.modalAction();
    if (action === 'edit') {
      this.saveUserEdit();
    } else {
      this.confirmStatusChange();
    }
  }

  saveUserEdit(): void {
    const user = this.modalUser();
    if (!user) return;
    
    // Aquí se implementaría la llamada al servicio de actualización
    this.closeModal();
  }

  confirmStatusChange(): void {
    const user = this.modalUser();
    if (!user) return;

    const isActive = this.modalAction() === 'activate';
    this.managementService.updateUserStatus(user.id, isActive).subscribe({
      next: () => {
        this.managementService.loadUsers(this.LIMIT, this.currentOffset(), false, this.searchTerm());
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.closeModal();
      }
    });
  }
}
