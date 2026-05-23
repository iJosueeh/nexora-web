import { FeedUser } from './feed/user.model';

export type NotificationType = 'LIKE' | 'COMMENT' | 'COMMENT_REPLY' | 'RSVP' | 'FOLLOW';

export interface Notification {
  id: string;
  type: NotificationType;
  content?: string;
  isRead: boolean;
  createdAt: string;
  sender: FeedUser;
  post?: {
    id: string;
    titulo: string;
    imageUrl?: string;
  };
}
