import { ChangeDetectionStrategy, Component, computed, inject, output, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';

import { FeedPublicationService } from '../../services/feed-publication.service';
import { Post } from '../../../../interfaces/feed';
import { PublicationDraft } from '../../pages/new-publication/publication-draft.model';
import { AuthSession } from '../../../../core/services/auth-session';
import { buildAvatarUrl } from '../../../profile/profile-page/profile-page.helpers';
import { EmojiPickerMiniComponent } from '../../../../shared/components/rich-text-editor/emoji-picker-mini';

const DRAFT_KEY = 'nexora_draft';

@Component({
	selector: 'app-post-creator',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, EmojiPickerMiniComponent],
	templateUrl: './post-creator.html'
})
export class PostCreatorComponent implements OnInit {
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
	readonly attachments = signal<File[]>([]);
	readonly hasDraft = signal(false);

	readonly canPublish = computed(() => {
		const plainText = this.quickDescription().replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
		return plainText.length >= 3 && !this.isSubmitting();
	});

	ngOnInit(): void {
		this.loadDraft();
	}

	private loadDraft(): void {
		try {
			const saved = localStorage.getItem(DRAFT_KEY);
			if (saved) {
				const draft = JSON.parse(saved);
				if (draft.title) this.quickTitle.set(draft.title);
				if (draft.description) {
					this.quickDescription.set(draft.description);
					this.hasDraft.set(true);
				}
			}
		} catch {
			localStorage.removeItem(DRAFT_KEY);
		}
	}

	private saveDraft(): void {
		try {
			const draft = {
				title: this.quickTitle(),
				description: this.quickDescription(),
				savedAt: Date.now()
			};
			localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
		} catch {
			// localStorage may be unavailable
		}
	}

	private clearDraft(): void {
		localStorage.removeItem(DRAFT_KEY);
		this.hasDraft.set(false);
	}

	updateTitle(event: Event): void {
		const value = (event.target as HTMLInputElement).value;
		this.quickTitle.set(value);
		this.saveDraft();
	}

	updateDescription(event: Event): void {
		const value = (event.target as HTMLTextAreaElement).value;
		this.quickDescription.set(value);
		this.saveDraft();
	}

	addEmoji(emoji: string): void {
		this.quickDescription.update(current => current + emoji);
		this.saveDraft();
	}

	onPaste(event: ClipboardEvent): void {
		const clipboardData = event.clipboardData;
		if (!clipboardData) return;

		const items = clipboardData.items;
		for (const item of items) {
			if (item.type.startsWith('image/')) {
				event.preventDefault();
				const file = item.getAsFile();
				if (file) {
					this.handlePastedImages([file]);
				}
				return;
			}
		}
	}

	handlePastedImages(files: File[]): void {
		const currentFiles = this.attachments();
		const updated = [...currentFiles, ...files].slice(0, 6);
		this.attachments.set(updated);
	}

	removeAttachment(index: number): void {
		const updated = this.attachments().filter((_, i) => i !== index);
		this.attachments.set(updated);
	}

	discardDraft(): void {
		this.clearDraft();
		this.quickTitle.set('');
		this.quickDescription.set('');
	}

	publish(): void {
		const title = this.quickTitle().trim();
		const content = this.quickDescription().trim();
		const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
		if (plainText.length < 3 || this.isSubmitting()) {
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
				this.clearDraft();
				this.created.emit(post);
				this.quickTitle.set('');
				this.quickDescription.set('');
				this.attachments.set([]);
			});
	}

	private buildQuickDraft(title: string, content: string): PublicationDraft {
		return {
			title: title || content.replace(/<[^>]*>/g, ' ').split('\n')[0]?.slice(0, 90) || 'Nueva publicación',
			content,
			attachments: [...this.attachments()],
			visibility: 'public',
			tags: [],
			location: undefined,
		};
	}
}