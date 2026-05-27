import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Apollo } from 'apollo-angular';

import { ShellLayout } from '../../../../shared/components/shell-layout/shell-layout';
import { FeedSidebar } from '../../components/feed-sidebar/feed-sidebar';
import { FeedTrends } from '../../components/feed-trends/feed-trends';
import { CommentThreadListComponent } from '../../components/comment-thread-list/comment-thread-list';
import { FeedService } from '../../services/feed.service';
import { CommentService } from '../../services/comment.service';
import { Post } from '../../../../interfaces/feed';
import { CommentThread } from '../../../../interfaces/feed/comment.model';
import { AuthSession } from '../../../../core/services/auth-session';
import { buildAvatarUrl } from '../../../profile/profile-page/profile-page.helpers';
import { TOGGLE_LIKE_MUTATION } from '../../../../graphql/graphql.queries';
import { ToastService } from '../../../../core/services/toast.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/components/ui/breadcrumb/breadcrumb';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellLayout,
    FeedSidebar,
    FeedTrends,
    CommentThreadListComponent,
    BreadcrumbComponent
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly feedService = inject(FeedService);
  private readonly commentService = inject(CommentService);
  private readonly authSession = inject(AuthSession);
  private readonly apollo = inject(Apollo);
  private readonly toastr = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  postId = signal<string | null>(null);
  post = signal<Post | null>(null);
  comments = signal<CommentThread[]>([]);
  loading = signal(true);
  isSubmitting = signal(false);
  newCommentText = signal('');

  currentUserAvatar = computed(() => {
    const user = this.authSession.user();
    return user?.avatarUrl || buildAvatarUrl(user?.username || user?.email || 'nexora');
  });

  breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    return [{ label: 'Publicación', url: undefined }];
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.postId.set(id);
          this.loadPost(id);
          this.loadComments(id);
        }
      });
  }

  loadPost(id: string): void {
    this.loading.set(true);
    this.feedService.getPostById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(post => {
        this.post.set(post);
        this.loading.set(false);
      });
  }

  loadComments(id: string): void {
    this.commentService.getThreads(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(comments => {
        this.comments.set(comments);
      });
  }

  goBack(): void {
    this.location.back();
  }

  toggleLike(event: Event): void {
    event.stopPropagation();
    const p = this.post();
    if (!p) return;

    const previousLiked = p.isLiked;
    const previousCount = p.likesCount;

    // Optimistic update
    this.post.update(curr => curr ? {
      ...curr,
      isLiked: !previousLiked,
      likesCount: previousLiked ? previousCount - 1 : previousCount + 1
    } : null);

    this.apollo.mutate({
      mutation: TOGGLE_LIKE_MUTATION,
      variables: { postId: p.id }
    }).subscribe({
      error: () => {
        // Rollback on error
        this.post.update(curr => curr ? {
          ...curr,
          isLiked: previousLiked,
          likesCount: previousCount
        } : null);
      }
    });
  }

  submitComment(): void {
    const text = this.newCommentText().trim();
    const id = this.postId();
    if (!text || !id) return;

    this.isSubmitting.set(true);
    this.commentService.createComment(id, null, text)
      .subscribe({
        next: () => {
          this.newCommentText.set('');
          this.loadComments(id);
          this.isSubmitting.set(false);
          this.toastr.show('Respuesta enviada', 'success');
          
          // Update local comment count
          this.post.update(p => p ? { ...p, commentsCount: p.commentsCount + 1 } : null);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toastr.show('Error al publicar respuesta', 'error');
        }
      });
  }

  onCommentDeleted(commentId: string): void {
    this.comments.update(list => list.filter(c => c.id !== commentId));
    this.post.update(p => p ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : null);
  }

  sharePost(event: Event): void {
    event.stopPropagation();
    const url = window.location.href;
    void navigator.clipboard.writeText(url).then(() => {
      this.toastr.show('Enlace copiado al portapapeles', 'info');
    });
  }

  adjustHeight(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
