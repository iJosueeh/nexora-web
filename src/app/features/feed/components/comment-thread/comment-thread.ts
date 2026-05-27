import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, inject, signal, DestroyRef, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommentThread } from '../../../../interfaces/feed';
import { CommentService } from '../../services/comment.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthSession } from '../../../../core/services/auth-session';
import { Router } from '@angular/router';

@Component({
	selector: 'app-comment-thread',
	standalone: true,
	imports: [CommonModule, RouterLink, FormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'block'
	},
	templateUrl: './comment-thread.html',
	styleUrl: './comment-thread.css'
})
export class CommentThreadComponent {
		readonly comment = input.required<CommentThread>();
		readonly depth = input(0);

		// Optional inputs provided by parent list
		readonly postId = input<string | undefined>(undefined);
		readonly reloadComments = input<(() => void) | undefined>(undefined);

		readonly commentDeleted = output<string>();

		readonly displayName = computed(() => this.comment().author.fullName || this.comment().author.username || 'Usuario Nexora');
		readonly avatarUrl = computed(() => this.comment().author.avatar || 'assets/images/default-avatar.webp');
		readonly replies = computed(() => this.comment().replies ?? []);
		readonly replyCount = computed(() => this.replies().length);
		readonly hasReplies = computed(() => this.replyCount() > 0);
		readonly relativeDate = computed(() => formatRelativeDate(this.comment().createdAt));
		readonly isAuthor = computed(() => this.authSession.getUser()?.id === this.comment().author.id);

		// Local UI state for likes (to handle optimistic updates on a nested signal component)
		// Since 'comment' is an input signal, we use these to mirror/override its state locally
		readonly localLikesCount = signal<number | null>(null);
		readonly localIsLiked = signal<boolean | null>(null);

		readonly currentLikesCount = computed(() => this.localLikesCount() ?? this.comment().likesCount);
		readonly currentIsLiked = computed(() => this.localIsLiked() ?? this.comment().isLiked);

		// Interaction state
		readonly showReply = signal(false);
		readonly replyText = signal('');
		readonly isEditing = signal(false);
		readonly editText = signal('');
		readonly isSubmitting = signal(false);

		private readonly commentService = inject(CommentService);
		private readonly toastService = inject(ToastService);
		private readonly authSession = inject(AuthSession);
		private readonly router = inject(Router);
		private readonly destroyRef = inject(DestroyRef);

		reply(): void {
			if (this.isEditing()) this.isEditing.set(false);
			this.showReply.update(s => !s);
		}

		toggleEdit(): void {
			if (this.showReply()) this.showReply.set(false);
			this.editText.set(this.comment().content);
			this.isEditing.update(e => !e);
		}

		onDelete(): void {
			if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;

			this.commentService.deleteComment(this.comment().id)
				.subscribe({
					next: () => {
						this.toastService.show('Comentario eliminado', 'success');
						this.commentDeleted.emit(this.comment().id);
					},
					error: () => this.toastService.show('Error al eliminar comentario', 'error')
				});
		}

		toggleLike(): void {
			if (!this.authSession.isAuthenticated()) {
				this.toastService.show('Inicia sesión para reaccionar', 'warning');
				return;
			}

			const previousLiked = this.currentIsLiked();
			const previousCount = this.currentLikesCount();

			// Optimistic Update
			this.localIsLiked.set(!previousLiked);
			this.localLikesCount.set(previousLiked ? previousCount - 1 : previousCount + 1);

			this.commentService.toggleLike(this.comment().id).subscribe({
				error: () => {
					// Rollback
					this.localIsLiked.set(previousLiked);
					this.localLikesCount.set(previousCount);
					this.toastService.show('Error al procesar reacción', 'error');
				}
			});
		}

		submitEdit(): void {
			const text = this.editText().trim();
			if (!text || text === this.comment().content) {
				this.isEditing.set(false);
				return;
			}

			this.isSubmitting.set(true);
			this.commentService.updateComment(this.comment().id, text)
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
					next: () => {
						this.isEditing.set(false);
						this.isSubmitting.set(false);
						this.toastService.show('Comentario actualizado', 'success');
						if (this.reloadComments) this.reloadComments();
					},
					error: () => {
						this.isSubmitting.set(false);
						this.toastService.show('Error al actualizar comentario', 'error');
					}
				});
		}

		submitReply(): void {
			const text = this.replyText().trim();
			if (!text) return;
			if (!this.authSession.isAuthenticated()) {
				this.toastService.show('Inicia sesión para responder', 'warning');
				void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
				return;
			}
			const pid = this.postId();
			if (!pid) return;
			const parentId = this.comment() ? this.comment().id : null;
			
			this.isSubmitting.set(true);
			this.commentService.createComment(pid, parentId ?? null, text)
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
					next: () => {
						this.replyText.set('');
						this.showReply.set(false);
						this.isSubmitting.set(false);
						this.toastService.show('Respuesta publicada', 'success');
						if (this.reloadComments) this.reloadComments();
					},
					error: (err: unknown) => {
						console.error('Error posting reply', err);
						const errorPayload = err as any;
						const gql = errorPayload?.graphQLErrors?.[0]?.message || errorPayload?.message || 'Error al publicar respuesta';
						this.isSubmitting.set(false);
						this.toastService.show(gql, 'error');
					}
				});
		}
}

function formatRelativeDate(value: Date | string): string {
	const createdAt = value instanceof Date ? value : new Date(value);
	const ageInMinutes = Math.floor((Date.now() - createdAt.getTime()) / 60000);

	if (ageInMinutes < 1) {
		return 'Hace segundos';
	}

	if (ageInMinutes < 60) {
		return `Hace ${ageInMinutes}m`;
	}

	const ageInHours = Math.floor(ageInMinutes / 60);
	if (ageInHours < 24) {
		return `Hace ${ageInHours}h`;
	}

	return createdAt.toLocaleDateString('es-ES', {
		month: 'short',
		day: 'numeric'
	});
}
