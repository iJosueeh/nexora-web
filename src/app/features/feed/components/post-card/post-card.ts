import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post } from '../../../../interfaces/feed';
import { TOGGLE_LIKE_MUTATION } from '../../../../graphql/graphql.queries';
import { FeedInteractionService } from '../../services/feed-interaction.service';

@Component({
	selector: 'app-post-card',
	standalone: true,
	imports: [CommonModule, RouterLink],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'block'
	},
	templateUrl: './post-card.html',
	styleUrl: './post-card.css'
})
export class PostCardComponent implements OnInit {
	private readonly apollo = inject(Apollo);
	private readonly interactionService = inject(FeedInteractionService);
	private readonly destroyRef = inject(DestroyRef);

	readonly post = input.required<Post>();

	// Estado local para feedback instantáneo
	readonly isLiked = signal(false);
	readonly likesCount = signal(0);

	ngOnInit(): void {
		this.isLiked.set(this.post().isLiked);
		this.likesCount.set(this.post().likesCount);

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
}
