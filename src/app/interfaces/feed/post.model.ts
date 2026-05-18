import { FeedUser } from './user.model';

export interface Post {
	id: string;
	author: FeedUser;
	is_official?: boolean;
	title?: string;
	content: string;
	imageUrl?: string;
	createdAt: Date;
	likesCount: number;
	commentsCount: number;
	likes?: number;
	comments?: number;
	shares: number;
	isLiked?: boolean;
	tags?: string[];
	location?: string;
}
