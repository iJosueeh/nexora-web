import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable, catchError, of } from 'rxjs';
import { TOGGLE_BOOKMARK_MUTATION, IS_BOOKMARKED_QUERY, BOOKMARKS_QUERY } from '../../../graphql/graphql.queries';
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

interface BookmarksQueryResponse {
  bookmarks: FeedPostQueryModel[];
}

interface IsBookmarkedResponse {
  isBookmarked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {
  private readonly apollo = inject(Apollo);

  toggleBookmark(postId: string): Observable<boolean> {
    return this.apollo
      .mutate<{ toggleBookmark: boolean }>({
        mutation: TOGGLE_BOOKMARK_MUTATION,
        variables: { postId }
      })
      .pipe(
        map((result) => result.data?.toggleBookmark ?? false),
        catchError(() => of(false))
      );
  }

  isBookmarked(postId: string): Observable<boolean> {
    return this.apollo
      .query<IsBookmarkedResponse>({
        query: IS_BOOKMARKED_QUERY,
        variables: { postId },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map((result) => result.data?.isBookmarked ?? false),
        catchError(() => of(false))
      );
  }

  getBookmarks(limit = 20, offset = 0): Observable<Post[]> {
    return this.apollo
      .query<BookmarksQueryResponse>({
        query: BOOKMARKS_QUERY,
        variables: { limit, offset },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map((result) => (result.data?.bookmarks ?? []).map((post) => this.mapPost(post))),
        catchError(() => of([]))
      );
  }

  private mapPost(post: FeedPostQueryModel): Post {
    return {
      id: post.id,
      author: {
        id: post.autor.id,
        email: `${post.autor.username}@nexora.app`,
        username: post.autor.username,
        fullName: post.autor.fullName,
        role: post.isOfficial ? 'Nexora oficial' : 'Comunidad Nexora',
        verified: post.isOfficial,
        avatar: post.autor.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.autor.username)}`,
        bio: ''
      },
      is_official: post.isOfficial,
      title: post.titulo?.trim() || undefined,
      content: post.contenido,
      imageUrl: post.imageUrl || undefined,
      location: post.location?.trim() || undefined,
      createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      shares: 0,
      tags: post.tags ?? [],
      isLiked: post.isLiked
    };
  }
}
