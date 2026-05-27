import { FeedUser } from './user.model';

export interface CommentThread {
	id: string;
	author: FeedUser;
	content: string;
	createdAt: Date | string;
	likesCount: number;
	isLiked: boolean;
	parentId?: string | null;
	replies?: CommentThread[];
}
