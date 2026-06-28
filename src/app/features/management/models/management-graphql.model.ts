/**
 * GraphQL raw response models for Management feature.
 * These match the backend schema field names (titulo, contenido, autor, isOfficial).
 */
import { Post } from '../../../interfaces/feed/post.model';

/** Raw GraphQL response shape for FeedPost */
export interface FeedPostQueryModel {
  id: string;
  titulo?: string | null;
  contenido: string;
  isOfficial: boolean;
  createdAt?: string | null;
  imageUrl?: string | null;
  location?: string | null;
  tags?: string[] | null;
  likesCount: number;
  commentsCount: number;
  autor: FeedAuthorQueryModel;
}

export interface FeedAuthorQueryModel {
  id: string;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  location?: string;
  category?: string;
  image?: string;
  organizerName?: string;
  organizerRole?: string;
  whatsapp?: string;
  telegram?: string;
  discord?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  category?: string;
  image?: string;
  organizerName?: string;
  organizerRole?: string;
  whatsapp?: string;
  telegram?: string;
  discord?: string;
}

/** Maps a raw GraphQL FeedPost response to the frontend Post model */
export function mapAdminPost(p: FeedPostQueryModel): Post {
  return {
    id: p.id,
    title: p.titulo?.trim() || undefined,
    content: p.contenido,
    is_official: p.isOfficial,
    imageUrl: p.imageUrl || undefined,
    location: p.location?.trim() || undefined,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    likesCount: p.likesCount,
    commentsCount: p.commentsCount,
    shares: 0,
    tags: p.tags ?? [],
    isLiked: false,
    author: {
      id: p.autor.id,
      username: p.autor.username,
      fullName: p.autor.fullName || undefined,
      avatar: p.autor.avatarUrl || undefined,
      email: `${p.autor.username}@nexora.app`,
      role: p.isOfficial ? 'Nexora oficial' : 'Comunidad Nexora',
      verified: p.isOfficial,
      bio: ''
    }
  };
}
