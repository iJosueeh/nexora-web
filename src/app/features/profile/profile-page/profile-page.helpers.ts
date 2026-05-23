import { AuthUser } from '../../../interfaces/auth';
import { Post } from '../../../interfaces/feed';

export type ProfileTab = 'posts' | 'media' | 'likes';

export interface ProfileCard {
  id: string;
  title: string;
  label: string;
  imageUrl?: string;
  badge: string;
  description: string;
  variant: 'image' | 'text' | 'link';
  likes?: string;
  comments?: string;
  cta?: string;
}

export interface ProfileViewModel extends AuthUser {
  email: string;
  displayName: string;
  handle: string;
  bio: string;
  career: string;
  avatarUrl: string;
  bannerUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedLabel: string;
  featuredInterests: string[];
  profileComplete?: boolean;
  isFollowing?: boolean;
}

export function buildProfileViewModel(user: AuthUser | null | undefined): ProfileViewModel {
  const email = user?.email ?? 'usuario@nexora.app';
  const baseName = user?.fullName?.trim() || user?.username?.trim() || email.split('@')[0] || 'Usuario Nexora';
  const handle = `@${(user?.username?.trim() || email.split('@')[0] || 'nexora').toLowerCase()}`;

  return {
    ...(user ?? { email }),
    email,
    displayName: baseName,
    handle,
    bio: user?.bio?.trim() || 'Estudiante de último año con foco en IA, diseño de interfaces y sistemas académicos.',
    career: user?.career?.trim() || 'Ingeniería de Software',
    avatarUrl: user?.avatarUrl?.trim() || buildAvatarUrl(handle),
    bannerUrl: user?.bannerUrl?.trim() || buildBannerUrl(handle),
    followersCount: user?.followersCount ?? 0,
    followingCount: user?.followingCount ?? 0,
    postsCount: 0,
    isFollowing: user?.isFollowing ?? false,
    joinedLabel: 'Se unió recientemente',
    featuredInterests: (user?.academicInterests ?? []).slice(0, 4).length > 0
      ? (user?.academicInterests ?? []).slice(0, 4)
      : ['Machine Learning', 'UI Design', 'Neural Networks', 'Logic'],
  };
}

export function mapFeedPostsToProfileCards(posts: Post[]): ProfileCard[] {
  return posts.map((post) => {
    const content = post.content?.trim() ?? '';
    const title = post.title?.trim()
      || (content.length > 110 ? `${content.slice(0, 110)}...` : content)
      || 'Publicación sin título';

    return {
      id: post.id,
      title,
      label: post.tags?.[0] ? `#${post.tags[0]}` : (post.is_official ? 'Oficial' : 'Publicación'),
      imageUrl: post.imageUrl,
      badge: formatRelativeTime(post.createdAt),
      description: content || post.title?.trim() || 'Sin contenido',
      variant: post.imageUrl ? 'image' : 'text',
      likes: `${Math.max(0, post.likesCount ?? 0)}`,
      comments: `${Math.max(0, post.commentsCount ?? 0)}`,
    };
  });
}

export function buildAvatarUrl(seed = 'nexora'): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function buildBannerUrl(seed = 'nexora'): string {
  const encoded = encodeURIComponent(seed.replace(/[^a-z0-9]/gi, ''));
  return `https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&h=500&fit=crop&crop=entropy&seed=${encoded}`;
}

export function formatCompact(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
  }

  return value.toString();
}

export function formatRelativeTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Reciente';

  const diffMs = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'Hace un momento';
  if (diffMs < hour) return `Hace ${Math.floor(diffMs / minute)} min`;
  if (diffMs < day) return `Hace ${Math.floor(diffMs / hour)} h`;
  if (diffMs < 7 * day) return `Hace ${Math.floor(diffMs / day)} d`;

  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
