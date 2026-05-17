import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementService } from '../../services/management.service';
import { Post } from '../../../../interfaces/feed/post.model';

@Component({
  selector: 'app-posts-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './posts.html',
  styleUrls: ['./posts.css'],
})
export class PostsView implements OnInit {
  private readonly managementService = inject(ManagementService);
  private readonly LIMIT = 10;
  
  readonly posts = this.managementService.posts;
  readonly loading = this.managementService.loading;
  
  readonly currentOffset = signal(0);
  
  readonly hasMore = computed(() => {
    const list = this.posts();
    return list.length > 0 && list.length % this.LIMIT === 0;
  });

  // Modal State
  readonly isModalOpen = signal(false);
  readonly selectedPost = signal<Post | null>(null);
  readonly modalAction = signal<'delete' | 'official'>('delete');

  ngOnInit(): void {
    this.managementService.resetPosts();
    this.loadInitialPosts();
  }

  loadInitialPosts(): void {
    this.currentOffset.set(0);
    this.managementService.loadPosts(this.LIMIT, 0, false);
  }

  loadMorePosts(): void {
    const nextOffset = this.currentOffset() + this.LIMIT;
    this.currentOffset.set(nextOffset);
    this.managementService.loadPosts(this.LIMIT, nextOffset, true);
  }

  openConfirmModal(post: Post, action: 'delete' | 'official'): void {
    this.selectedPost.set(post);
    this.modalAction.set(action);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedPost.set(null);
  }

  confirmAction(): void {
    const post = this.selectedPost();
    if (!post) return;

    if (this.modalAction() === 'delete') {
      this.managementService.deletePost(post.id).subscribe(() => {
        this.loadInitialPosts();
        this.closeModal();
      });
    } else {
      const newStatus = !post.is_official;
      this.managementService.markAsOfficial(post.id, newStatus).subscribe(() => {
        this.loadInitialPosts();
        this.closeModal();
      });
    }
  }
}
