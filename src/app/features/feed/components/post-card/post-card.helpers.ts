import { Post } from '../../../../interfaces/feed';
import { formatRelativeTime } from '../../../../utils/date.util';

export function getRelativeDate(post: Post): string {
  return formatRelativeTime(post.createdAt);
}

export function canDeletePost(user: { id?: string; roles?: string[] } | null | undefined, post: Post): boolean {
  const currentUserId = user?.id?.toLowerCase();
  const authorId = post.author.id?.toLowerCase();
  
  return (!!currentUserId && !!authorId && currentUserId === authorId) || 
         (user?.roles?.includes('ROLE_ADMIN') ?? false);
}
