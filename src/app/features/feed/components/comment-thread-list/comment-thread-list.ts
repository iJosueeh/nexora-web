import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommentThread } from '../../../../interfaces/feed';
import { CommentThreadComponent } from '../comment-thread/comment-thread';

@Component({
	selector: 'app-comment-thread-list',
	standalone: true,
	imports: [CommonModule, CommentThreadComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'block'
	},
	templateUrl: './comment-thread-list.html',
	styleUrl: './comment-thread-list.css'
})
export class CommentThreadListComponent {
	readonly comments = input<readonly CommentThread[]>([]);
	readonly emptyMessage = input('Aún no hay comentarios.');

	readonly hasComments = computed(() => this.comments().length > 0);
}