import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit, DestroyRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post } from '../../../../interfaces/feed';
import { DELETE_POST_MUTATION, TOGGLE_LIKE_MUTATION } from '../../../../graphql/graphql.queries';
import { AuthSession } from '../../../../core/services/auth-session';
import { FeedInteractionService } from '../../services/feed-interaction.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';
import { SanitizeHtmlService } from '../../../../shared/services/sanitize-html.service';
import { getRelativeDate, canDeletePost } from './post-card.helpers';

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
	public readonly authSession = inject(AuthSession);
	private readonly toastr = inject(ToastrService);
	private readonly destroyRef = inject(DestroyRef);
	public readonly router = inject(Router);
	private readonly sanitizeService = inject(SanitizeHtmlService);

	readonly post = input.required<Post>();
	readonly deleted = output<string>();

	readonly isLiked = signal(false);
	readonly likesCount = signal(0);
	readonly isDeleted = signal(false);
	readonly showConfirmModal = signal(false);
	readonly isDeleting = signal(false);

	readonly canDelete = computed(() => canDeletePost(this.authSession.user(), this.post()));
	readonly isOfficial = computed(() => this.post().is_official === true);
	readonly relativeDate = computed(() => getRelativeDate(this.post()));
	readonly sanitizedContent = computed(() => this.sanitizeService.sanitize(this.post().content || ''));

	ngOnInit(): void {
		this.isLiked.set(this.post().isLiked ?? false);
		this.likesCount.set(this.post().likesCount);

		this.interactionService.likeUpdates$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(update => {
				const currentUserId = this.authSession.user()?.id?.toLowerCase();
				if (update.postId === this.post().id && update.userId !== currentUserId) {
					this.likesCount.update(c => update.action === 'INSERT' ? c + 1 : Math.max(0, c - 1));
				}
			});
	}

	toggleLike(event: MouseEvent): void {
		event.stopPropagation();
		const previousLiked = this.isLiked();
		const previousCount = this.likesCount();

		this.isLiked.set(!previousLiked);
		this.likesCount.update(c => previousLiked ? c - 1 : c + 1);

		this.apollo.mutate({
			mutation: TOGGLE_LIKE_MUTATION,
			variables: { postId: this.post().id }
		}).subscribe({
			error: () => {
				this.isLiked.set(previousLiked);
				this.likesCount.set(previousCount);
			}
		});
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
				this.deleted.emit(this.post().id);
			},
			error: () => {
				this.toastr.error('Error al eliminar la publicación');
				this.isDeleting.set(false);
			}
		});
	}

	openComments(event?: Event): void {
		if (event?.target && (event.target as HTMLElement).closest('a,button')) return;
		void this.router.navigate(['/feed/post', this.post().id]);
	}
}
