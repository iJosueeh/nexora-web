import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CommentThread } from '../../../../interfaces/feed';
import { CommentService } from '../../services/comment.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthSession } from '../../../../core/services/auth-session';
import { Router } from '@angular/router';

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

		// Optional inputs provided by parent list
		readonly postId = input<string | undefined>(undefined);
		readonly reloadComments = input<(() => void) | undefined>(undefined);

		readonly displayName = computed(() => this.comment().author.fullName || this.comment().author.username || 'Usuario Nexora');
		readonly avatarUrl = computed(() => this.comment().author.avatar || 'assets/images/default-avatar.webp');
		readonly replies = computed(() => this.comment().replies ?? []);
		readonly replyCount = computed(() => this.replies().length);
		readonly hasReplies = computed(() => this.replyCount() > 0);
		readonly relativeDate = computed(() => formatRelativeDate(this.comment().createdAt));

		// Reply form state
		readonly showReply = signal(false);
		readonly replyText = signal('');

		private readonly commentService = inject(CommentService);
		private readonly toastService = inject(ToastService);
		private readonly authSession = inject(AuthSession);
		private readonly router = inject(Router);
		private readonly destroyRef = inject(DestroyRef);

		reply(): void {
			this.showReply.update(s => !s);
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
			this.commentService.createComment(pid, parentId ?? null, text)
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
					next: () => {
						this.replyText.set('');
						this.showReply.set(false);
						this.toastService.show('Respuesta publicada', 'success');
						if (this.reloadComments) this.reloadComments();
					},
					error: (err: any) => {
						console.error('Error posting reply', err);
						const gql = err?.graphQLErrors?.[0]?.message || err?.message || 'Error al publicar respuesta';
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