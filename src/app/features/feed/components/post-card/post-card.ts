import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post } from '../../../../interfaces/feed';
import { TOGGLE_LIKE_MUTATION } from '../../../../graphql/graphql.queries';
import { FeedInteractionService } from '../../services/feed-interaction.service';
import { CommentService } from '../../services/comment.service';
import { CommentThreadListComponent } from '../comment-thread-list/comment-thread-list';
import { CommentThread } from '../../../../interfaces/feed';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthSession } from '../../../../core/services/auth-session';
import { Router } from '@angular/router';

@Component({
	selector: 'app-post-card',
	standalone: true,
	imports: [CommonModule, RouterLink, CommentThreadListComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'block'
	},
	templateUrl: './post-card.html',
	styleUrl: './post-card.css'
})
export class PostCardComponent implements OnInit {
	constructor(
		private readonly apollo: Apollo,
		private readonly interactionService: FeedInteractionService,
		private readonly destroyRef: DestroyRef,
		private readonly commentService: CommentService,
		private readonly toastService: ToastService,
		readonly authSession: AuthSession,
		readonly router: Router
	) {}

	readonly post = input.required<Post>();

	// Estado local para feedback instantáneo
	readonly isLiked = signal(false);
	readonly likesCount = signal(0);
	readonly showComments = signal(false);
	readonly isLoadingComments = signal(false);
	readonly comments = signal<CommentThread[]>([]);
	readonly commentsCount = signal(0);

	readonly newComment = signal('');
	readonly isSubmittingComment = signal(false);

	// constructor-injected dependencies above

	openComments(event?: MouseEvent): void {
		if (event) {
			// if click came from a link or button, ignore
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

	ngOnInit(): void {
		this.isLiked.set(this.post().isLiked ?? false);
		this.likesCount.set(this.post().likesCount);
		this.commentsCount.set(this.post().commentsCount ?? 0);

		// Escuchar actualizaciones globales de likes
		this.interactionService.likeUpdates$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(update => {
				if (update.postId === this.post().id) {
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
					// focus composer textarea after it's rendered
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
			this.toastService.show('Inicia sesión para comentar', 'warning');
			void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
			return;
		}
		// Optimistic UI: insertar comentario temporal al inicio
		const tempId = `temp-${Date.now()}`;
		const user = this.authSession.getUser();
		const tempAuthor = {
			id: user?.id ?? tempId,
			email: user?.email ?? 'you@local',
			username: user?.username ?? (user?.email?.split('@')[0] ?? 'usuario'),
			fullName: user?.fullName,
			avatar: user?.avatarUrl ?? user?.avatarUrl ?? 'assets/images/default-avatar.webp'
		};
		const tempComment: CommentThread = {
			id: tempId,
			author: tempAuthor as any,
			content,
			createdAt: new Date(),
			likesCount: 0,
			replies: []
		};

		// insert optimistic
		this.comments.update(arr => [tempComment, ...arr]);
		this.commentsCount.update(c => c + 1);
		this.newComment.set('');
		this.isSubmittingComment.set(true);

		this.commentService.createComment(this.post().id, null, content)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (created) => {
					// replace temp with server result
					this.comments.update(arr => arr.map(c => c.id === tempId ? created : c));
					this.isSubmittingComment.set(false);
					this.toastService.show('Comentario publicado', 'success');
				},
				error: (err) => {
					console.error('Error posting comment', err);
					// revert optimistic
					this.comments.update(arr => arr.filter(c => c.id !== tempId));
					this.commentsCount.update(c => Math.max(0, c - 1));
					this.isSubmittingComment.set(false);
					const gqlMessage = err?.graphQLErrors?.[0]?.message || err?.message || 'Error al publicar comentario';
					this.toastService.show(gqlMessage, 'error');
				}
			});
	}
}
