import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit, DestroyRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post } from '../../../../interfaces/feed';
import { DELETE_POST_MUTATION, TOGGLE_LIKE_MUTATION } from '../../../../graphql/graphql.queries';
import { AuthSession } from '../../../../core/services/auth-session';
import { FeedInteractionService } from '../../services/feed-interaction.service';
import { ToastrService } from 'ngx-toastr';

import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';

@Component({
	selector: 'app-post-card',
	standalone: true,
	imports: [CommonModule, RouterLink, ConfirmModal],
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

	readonly post = input.required<Post>();
	readonly deleted = output<string>(); // Emite el ID del post eliminado

	// Estado local para feedback instantáneo
	readonly isLiked = signal(false);
	readonly likesCount = signal(0);
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
		this.isLiked.set(this.post().isLiked);
		this.likesCount.set(this.post().likesCount);

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
}
