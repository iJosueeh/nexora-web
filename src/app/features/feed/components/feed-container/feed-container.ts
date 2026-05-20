import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	ElementRef,
	inject,
	signal,
	viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post } from '../../../../interfaces/feed';
import { FeedPublicationQueueService } from '../../services/feed-publication-queue.service';
import { FeedPaginationQueueService } from '../../services/feed-pagination-queue.service';
import { PostCardComponent } from '../post-card/post-card';
import { PostCreatorComponent } from '../post-creator/post-creator';

@Component({
	selector: 'app-feed-container',
	standalone: true,
	imports: [PostCardComponent, PostCreatorComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './feed-container.html',
	styleUrl: './feed-container.css'
})
export class FeedContainerComponent implements AfterViewInit {
	private readonly publicationQueue = inject(FeedPublicationQueueService);
	private readonly paginationQueue = inject(FeedPaginationQueueService);
	private readonly destroyRef = inject(DestroyRef);

	readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
	readonly visiblePosts = signal<Post[]>([]);
	readonly isInitialLoading = signal(true);
	readonly isLoadingMore = signal(false);

	readonly blockSize = 5;
	readonly skeletonRows = [1, 2, 3];

	private offset = 0;
	private reachedEnd = false;
	private pageRequestVersion = 0;

	constructor() {
		const queuedPost = this.publicationQueue.consume();
		if (queuedPost) {
			this.visiblePosts.set([queuedPost]);
			this.isInitialLoading.set(false);
		}

		this.loadNextBlock();
	}

	ngAfterViewInit(): void {
		if (typeof IntersectionObserver === 'undefined') {
			return;
		}

		const target = this.sentinel()?.nativeElement;
		if (!target) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					this.loadNextBlock();
				}
			},
			{ rootMargin: '280px 0px' }
		);

		observer.observe(target);
		this.destroyRef.onDestroy(() => observer.disconnect());
	}

	private loadNextBlock(): void {
		if (this.isLoadingMore() || this.reachedEnd) {
			return;
		}

		if (this.visiblePosts().length === 0) {
			this.isInitialLoading.set(true);
		} else {
			this.isLoadingMore.set(true);
		}

		const requestVersion = ++this.pageRequestVersion;
		this.paginationQueue.enqueue(this.blockSize, this.offset)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (posts) => {
					if (requestVersion !== this.pageRequestVersion) {
						return;
					}

					if (posts.length === 0) {
						this.reachedEnd = true;
					}

					this.visiblePosts.update((current) => this.mergePosts(current, posts));
					this.offset += posts.length;
					this.isInitialLoading.set(false);
					this.isLoadingMore.set(false);
				},
				error: () => {
					this.isInitialLoading.set(false);
					this.isLoadingMore.set(false);
				}
			});
	}

	prependPost(post: Post): void {
		this.visiblePosts.update((current) => this.mergePosts([post], current));
	}

	removePost(postId: string): void {
		this.visiblePosts.update((current) => current.filter((p) => p.id !== postId));
	}

	private mergePosts(existing: Post[], incoming: Post[]): Post[] {
		const merged = new Map<string, Post>();

		for (const post of existing) {
			merged.set(post.id, post);
		}

		for (const post of incoming) {
			if (!merged.has(post.id)) {
				merged.set(post.id, post);
			}
		}

		return [...merged.values()];
	}
}
