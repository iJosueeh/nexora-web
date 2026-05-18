import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommentThread } from '../../../../interfaces/feed';

@Component({
	selector: 'app-comment-thread',
	standalone: true,
	imports: [CommonModule, RouterLink],
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

	readonly displayName = computed(() => this.comment().author.fullName || this.comment().author.username || 'Usuario Nexora');
	readonly avatarUrl = computed(() => this.comment().author.avatar || 'assets/images/default-avatar.webp');
	readonly replies = computed(() => this.comment().replies ?? []);
	readonly replyCount = computed(() => this.replies().length);
	readonly hasReplies = computed(() => this.replyCount() > 0);
	readonly relativeDate = computed(() => formatRelativeDate(this.comment().createdAt));
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