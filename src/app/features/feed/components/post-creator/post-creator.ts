import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';

import { FeedPublicationService } from '../../services/feed-publication.service';
import { Post } from '../../../../interfaces/feed';
import { PublicationDraft } from '../../pages/new-publication/publication-draft.model';
import { AuthSession } from '../../../../core/services/auth-session';
import { buildAvatarUrl } from '../../../profile/profile-page/profile-page.helpers';

@Component({
	selector: 'app-post-creator',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink],
	templateUrl: './post-creator.html'
})
export class PostCreatorComponent {
	readonly created = output<Post>();
	private readonly publicationService = inject(FeedPublicationService);
	private readonly authSession = inject(AuthSession);

	readonly userAvatar = computed(() => {
		const user = this.authSession.user();
		return user?.avatarUrl || buildAvatarUrl(user?.username || user?.email || 'nexora');
	});

	readonly tabs = ['Lo ultimo', 'Popular', 'Investigacion', 'Vida en el campus'];
	readonly activeTab = signal(this.tabs[0]);
	readonly quickTitle = signal('');
	readonly quickDescription = signal('');
	readonly isSubmitting = signal(false);

	readonly canPublish = computed(() => this.quickDescription().trim().length >= 3 && !this.isSubmitting());

	updateTitle(event: Event): void {
		const value = (event.target as HTMLInputElement).value;
		this.quickTitle.set(value);
	}

	updateDescription(event: Event): void {
		const value = (event.target as HTMLTextAreaElement).value;
		this.quickDescription.set(value);
	}

	publish(): void {
		const title = this.quickTitle().trim();
		const content = this.quickDescription().trim();
		if (content.length < 3 || this.isSubmitting()) {
			return;
		}

		const draft = this.buildQuickDraft(title, content);
		this.isSubmitting.set(true);

		this.publicationService
			.publish(draft)
			.pipe(
				catchError(() => of(this.publicationService.buildOptimisticPost(draft))),
				finalize(() => this.isSubmitting.set(false)),
				take(1)
			)
			.subscribe((post) => {
				this.created.emit(post);
				this.quickTitle.set('');
				this.quickDescription.set('');
			});
	}

	private buildQuickDraft(title: string, content: string): PublicationDraft {
		return {
			title: title || content.split('\n')[0]?.slice(0, 90) || 'Nueva publicación',
			content,
			attachments: [],
			visibility: 'public',
			tags: [],
			location: undefined,
		};
	}
}
