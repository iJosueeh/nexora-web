import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { catchError, map, Observable, of } from 'rxjs';

import { FEED_POSTS_QUERY, PROFILE_POSTS_QUERY, POST_BY_ID_QUERY, EDIT_POST_MUTATION, SEARCH_POSTS_QUERY } from '../../../graphql/graphql.queries';
import { Post } from '../../../interfaces/feed';

interface FeedAuthorQueryModel {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
}

interface FeedPostQueryModel {
  id: string;
  titulo?: string | null;
  contenido: string;
  tags?: string[] | null;
  location?: string | null;
  isOfficial: boolean;
  createdAt?: string | null;
  commentsCount: number;
  likesCount: number;
  isLiked: boolean;
  imageUrl?: string | null;
  autor: FeedAuthorQueryModel;
}

interface FeedPostsQueryResponse {
  obtenerFeedPrincipal: FeedPostQueryModel[];
}

interface ProfilePostsQueryResponse {
  publicacionesPorUsuario: FeedPostQueryModel[];
}

interface PostByIdQueryResponse {
  obtenerPublicacionPorId: FeedPostQueryModel;
}

interface EditPostQueryResponse {
  editarPublicacion: FeedPostQueryModel;
}

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private readonly apollo = inject(Apollo);

  getPosts(limit = 5, offset = 0): Observable<Post[]> {
    return this.apollo
      .query<FeedPostsQueryResponse>({
        query: FEED_POSTS_QUERY,
        variables: {
          limit: Math.max(1, limit),
          offset: Math.max(0, offset)
        },
        fetchPolicy: 'network-only'
      })
      .pipe(map((result) => (result.data?.obtenerFeedPrincipal ?? []).map((post) => this.mapPost(post))));
  }

  getPostById(postId: string): Observable<Post | null> {
    return this.apollo
      .query<PostByIdQueryResponse>({
        query: POST_BY_ID_QUERY,
        variables: {
          postId
        },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map((result) => result.data?.obtenerPublicacionPorId ? this.mapPost(result.data.obtenerPublicacionPorId) : null),
        catchError(() => of(null))
      );
  }

  editPost(postId: string, input: any): Observable<Post | null> {
    return this.apollo
      .mutate<EditPostQueryResponse>({
        mutation: EDIT_POST_MUTATION,
        variables: {
          postId,
          input
        }
      })
      .pipe(
        map((result) => result.data?.editarPublicacion ? this.mapPost(result.data.editarPublicacion) : null),
        catchError((err) => {
          console.error('Error editing post:', err);
          return of(null);
        })
      );
  }

  searchPosts(query: string, limit = 20, offset = 0): Observable<Post[]> {
    return this.apollo
      .query<FeedPostsQueryResponse>({
        query: SEARCH_POSTS_QUERY,
        variables: { query, limit, offset },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map((result) => (result.data?.obtenerFeedPrincipal ?? []).map((post) => this.mapPost(post))),
        catchError(() => of([]))
      );
  }

  getPostsByUsername(username: string, limit = 10, offset = 0): Observable<Post[]> {
    const safeUsername = username.trim().toLowerCase();

    if (!safeUsername) {
      return of([]);
    }

    return this.apollo
      .query<ProfilePostsQueryResponse>({
        query: PROFILE_POSTS_QUERY,
        variables: {
          username: safeUsername,
          limit: Math.max(1, limit),
          offset: Math.max(0, offset),
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => (result.data?.publicacionesPorUsuario ?? []).map((post) => this.mapPost(post))),
        catchError(() => this.getPosts(80, 0).pipe(
          map((posts) => posts
            .filter((post) => this.normalizeUsername(post.author.username) === safeUsername)
            .slice(offset, offset + Math.max(1, limit)))
        ))
      );
  }

  private normalizeUsername(value?: string): string {
    return (value ?? '').replace(/^@/, '').trim().toLowerCase();
  }

  private mapPost(post: FeedPostQueryModel): Post {
    return {
      id: post.id,
      author: this.mapAuthor(post),
      is_official: post.isOfficial,
      title: post.titulo?.trim() || undefined,
      content: post.contenido,
      imageUrl: post.imageUrl || undefined,
      location: post.location?.trim() || undefined,
      createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      shares: 0,
      tags: post.tags && post.tags.length > 0 ? post.tags : this.extractTags(post.titulo, post.contenido),
      isLiked: post.isLiked
    };
  }

  private mapAuthor(post: FeedPostQueryModel) {
    return {
      id: post.autor.id,
      email: `${post.autor.username}@nexora.app`,
      username: post.autor.username,
      fullName: post.autor.fullName,
      role: post.isOfficial ? 'Nexora oficial' : 'Comunidad Nexora',
      verified: post.isOfficial,
      avatar: post.autor.avatarUrl || this.buildAvatarUrl(post.autor.username),
      bio: ''
    };
  }

  private extractTags(title?: string | null, content?: string): string[] {
    const source = [title, content].filter(Boolean).join(' ');
    const tags = source.match(/#[\p{L}\p{N}_]+/gu) ?? [];

    return [...new Set(tags.map((tag) => tag.slice(1).toLowerCase()))].slice(0, 5);
  }

  private buildAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }
}
