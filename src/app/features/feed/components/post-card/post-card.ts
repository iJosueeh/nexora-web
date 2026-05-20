import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit, DestroyRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post, CommentThread } from '../../../../interfaces/feed';
import { DELETE_POST_MUTATION, TOGGLE_LIKE_MUTATION } from '../../../../graphql/graphql.queries';
import { AuthSession } from '../../../../core/services/auth-session';
import { FeedInteractionService } from '../../services/feed-interaction.service';
import { ToastrService } from 'ngx-toastr';
import { CommentService } from '../../services/comment.service';
import { CommentThreadListComponent } from '../comment-thread-list/comment-thread-list';

import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';

@Component({
	selector: 'app-post-card',
	standalone: true,
	imports: [CommonModule, RouterLink, ConfirmModal, CommentThreadListComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'block',
		'[class.hidden]': 'isDeleted()'
	},
	templateUrl: './post-card.html',
	styleUrl: './post-card.css'
})
export class PostCardComponent implements OnInit {
	private readonly apollo = inject(Apollo);
	private readonly interactionService = inject(FeedInteractionService);
	private readonly authSession = inject(AuthSession);
	private readonly toastr = inject(ToastrService);
	private readonly destroyRef = inject(DestroyRef);
	private readonly commentService = inject(CommentService);
	private readonly router = inject(Router);

	readonly post = input.required<Post>();
	readonly deleted = output<string>(); // Emite el ID del post eliminado

	// Estado local para feedback instantáneo (Likes)
	readonly isLiked = signal(false);
	readonly likesCount = signal(0);
	
	// Estado local para Comentarios
	readonly showComments = signal(false);
	readonly isLoadingComments = signal(false);
	readonly comments = signal<CommentThread[]>([]);
	readonly commentsCount = signal(0);
	readonly newComment = signal('');
	readonly isSubmittingComment = signal(false);

	// Estado para eliminación
	readonly isDeleted = signal(false);
	readonly showConfirmModal = signal(false);
	readonly isDeleting = signal(false);

	readonly canDelete = computed(() => {
		const user = this.authSession.user();
		const currentUserId = user?.id?.toLowerCase();
		const authorId = this.post().author.id?.toLowerCase();
		
		return (currentUserId && authorId && currentUserId === authorId) || 
			   user?.roles?.includes('ROLE_ADMIN');
	});

	ngOnInit(): void {
		this.isLiked.set(this.post().isLiked ?? false);
		this.likesCount.set(this.post().likesCount);
		this.commentsCount.set(this.post().commentsCount ?? 0);

		const currentUserId = this.authSession.user()?.id?.toLowerCase();

		// Escuchar actualizaciones globales de likes
		this.interactionService.likeUpdates$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(update => {
				// Si el post coincide y NO es el usuario actual (quien ya actualizó su UI de forma optimista)
				if (update.postId === this.post().id && update.userId !== currentUserId) {
					this.likesCount.update(c => update.action === 'INSERT' ? c + 1 : Math.max(0, c - 1));
				}
			});
	}

	readonly isOfficial = computed(() => this.post().is_official === true);

	readonly relativeDate = computed(() => {
		const createdAt = this.post().createdAt;
		const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
		const ageInMinutes = Math.floor((Date.now() - createdAtDate.getTime()) / 60000);

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

		return createdAtDate.toLocaleDateString('es-ES', {
			month: 'short',
			day: 'numeric'
		});
	});

	toggleLike(event: MouseEvent): void {
		event.stopPropagation();
		
		const previousLiked = this.isLiked();
		const previousCount = this.likesCount();

		// Optimistic Update
		this.isLiked.set(!previousLiked);
		this.likesCount.update(c => previousLiked ? c - 1 : c + 1);

		this.apollo.mutate({
			mutation: TOGGLE_LIKE_MUTATION,
			variables: { postId: this.post().id }
		}).subscribe({
			error: (err) => {
				console.error('Error toggling like:', err);
				// Rollback en caso de error
				this.isLiked.set(previousLiked);
				this.likesCount.set(previousCount);
			}
		});
	}

	deletePost(event: MouseEvent): void {
		event.stopPropagation();
		this.showConfirmModal.set(true);
	}

	onConfirmDelete(): void {
		this.isDeleting.set(true);
		this.apollo.mutate({
			mutation: DELETE_POST_MUTATION,
			variables: { postId: this.post().id }
		}).subscribe({
			next: () => {
				this.toastr.success('Publicación eliminada correctamente');
				this.isDeleted.set(true);
				this.showConfirmModal.set(false);
				this.isDeleting.set(false);
				this.deleted.emit(this.post().id); // Avisar al padre para limpiar el array
			},
			error: (err) => {
				this.toastr.error('Error al eliminar la publicación');
				this.isDeleting.set(false);
				console.error(err);
			}
		});
	}

	onCancelDelete(): void {
		this.showConfirmModal.set(false);
	}

	// --- Lógica de Comentarios ---

	openComments(event?: MouseEvent): void {
		if (event) {
			const target = event.target as HTMLElement | null;
			if (target && target.closest('a,button')) {
				return;
			}
		}

		if (this.showComments()) {
			this.showComments.set(false);
			return;
		}

		this.loadComments();
	}

	toggleComments(event: MouseEvent): void {
		event.stopPropagation();

		if (this.showComments()) {
			this.showComments.set(false);
			return;
		}

		this.loadComments();
	}

	loadComments(): void {
		this.isLoadingComments.set(true);
		this.commentService.getThreads(this.post().id)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (threads) => {
					this.comments.set(threads);
					this.isLoadingComments.set(false);
					this.showComments.set(true);
					
					setTimeout(() => {
						try {
							const selector = `[data-post-comment-textarea="${this.post().id}"]`;
							const el = document.querySelector(selector) as HTMLTextAreaElement | null;
							if (el) el.focus();
						} catch (e) {}
					}, 50);
				},
				error: () => {
					this.isLoadingComments.set(false);
				}
			});
	}

	submitComment(): void {
		const content = this.newComment().trim();
		if (!content) return;
		
		if (!this.authSession.isAuthenticated()) {
			this.toastr.warning('Inicia sesión para comentar');
			void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
			return;
		}

		const tempId = `temp-${Date.now()}`;
		const user = this.authSession.getUser();
		const tempAuthor = {
			id: user?.id ?? tempId,
			email: user?.email ?? 'you@local',
			username: user?.username ?? (user?.email?.split('@')[0] ?? 'usuario'),
			fullName: user?.fullName,
			avatar: user?.avatarUrl ?? 'assets/images/default-avatar.webp'
		};
		const tempComment: CommentThread = {
			id: tempId,
			author: tempAuthor as any,
			content,
			createdAt: new Date(),
			likesCount: 0,
			replies: []
		};

		this.comments.update(arr => [tempComment, ...arr]);
		this.commentsCount.update(c => c + 1);
		this.newComment.set('');
		this.isSubmittingComment.set(true);

		this.commentService.createComment(this.post().id, null, content)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (created) => {
					this.comments.update(arr => arr.map(c => c.id === tempId ? created : c));
					this.isSubmittingComment.set(false);
					this.toastr.success('Comentario publicado');
				},
				error: (err) => {
					console.error('Error posting comment', err);
					this.comments.update(arr => arr.filter(c => c.id !== tempId));
					this.commentsCount.update(c => Math.max(0, c - 1));
					this.isSubmittingComment.set(false);
					const gqlMessage = err?.graphQLErrors?.[0]?.message || err?.message || 'Error al publicar comentario';
					this.toastr.error(gqlMessage);
				}
			});
	}
}
