import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { COMMENT_THREADS_QUERY, CREATE_COMMENT_MUTATION, DELETE_COMMENT_MUTATION, EDIT_COMMENT_MUTATION, TOGGLE_COMMENT_LIKE_MUTATION } from '../../../graphql/graphql.queries';
import { CommentThread } from '../../../interfaces/feed';

interface CommentThreadDTO {
  id: string;
  postId: string;
  parentId?: string | null;
  autor: {
    id: string;
    username: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    verified?: boolean;
  };
  contenido: string;
  createdAt?: string | null;
  likesCount: number;
  isLiked: boolean;
  respuestas?: CommentThreadDTO[];
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly apollo = inject(Apollo);

  getThreads(postId: string): Observable<CommentThread[]> {
    return this.apollo
      .query<{ comentariosPorPost: CommentThreadDTO[] }>({
        query: COMMENT_THREADS_QUERY,
        variables: { postId },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map((res) => (res.data?.comentariosPorPost ?? []).map(dtoToCommentThread))
      );
  }

  createComment(postId: string, parentId: string | null, content: string): Observable<CommentThread> {
    return this.apollo
      .mutate<{ crearComentario: CommentThreadDTO }>({
        mutation: CREATE_COMMENT_MUTATION,
        variables: { input: { postId, parentId, contenido: content } }
      })
      .pipe(map((res) => dtoToCommentThread(res.data!.crearComentario)));
  }

  deleteComment(commentId: string): Observable<boolean> {
    return this.apollo
      .mutate<{ eliminarComentario: boolean }>({
        mutation: DELETE_COMMENT_MUTATION,
        variables: { commentId }
      })
      .pipe(map((res) => !!res.data?.eliminarComentario));
  }

  updateComment(commentId: string, content: string): Observable<CommentThread> {
    return this.apollo
      .mutate<{ editarComentario: CommentThreadDTO }>({
        mutation: EDIT_COMMENT_MUTATION,
        variables: { commentId, contenido: content }
      })
      .pipe(map((res) => dtoToCommentThread(res.data!.editarComentario)));
  }

  toggleLike(commentId: string): Observable<boolean> {
    return this.apollo
      .mutate<{ toggleCommentLike: boolean }>({
        mutation: TOGGLE_COMMENT_LIKE_MUTATION,
        variables: { commentId }
      })
      .pipe(map((res) => !!res.data?.toggleCommentLike));
  }
}

function dtoToCommentAuthor(dto: CommentThreadDTO): CommentThread['author'] {
  const autor = dto.autor;

  return {
    id: autor.id,
    email: `${autor.username}@nexora.app`,
    username: autor.username,
    fullName: autor.fullName || undefined,
    avatar: autor.avatarUrl || undefined,
    verified: autor.verified || false
  };
}

function dtoToCreatedAt(createdAt?: string | null): Date {
  if (!createdAt) {
    return new Date();
  }

  const parsedDate = new Date(createdAt);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

function dtoToCommentThread(dto: CommentThreadDTO): CommentThread {
  const thread: CommentThread = {
    id: dto.id,
    author: dtoToCommentAuthor(dto),
    content: dto.contenido,
    createdAt: dtoToCreatedAt(dto.createdAt),
    likesCount: dto.likesCount || 0,
    isLiked: dto.isLiked || false,
    replies: (dto.respuestas ?? []).map(dtoToCommentThread)
  };

  return thread;
}
