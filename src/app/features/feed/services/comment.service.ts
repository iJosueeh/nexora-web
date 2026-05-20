import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { COMMENT_THREADS_QUERY } from '../../../graphql/graphql.queries';
import { CREATE_COMMENT_MUTATION } from '../../../graphql/graphql.queries';
import { CommentThread } from '../../../interfaces/feed';

interface CommentThreadDTO {
  id: string;
  postId: string;
  parentId?: string | null;
  autorId?: string | null;
  contenido: string;
  createdAt?: string | null;
  respuestas?: CommentThreadDTO[];
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private readonly apollo: Apollo) {}

  getThreads(postId: string): Observable<CommentThread[]> {
    return this.apollo
      .query<{ obtenerHilosComentarios: CommentThreadDTO[] }>({
        query: COMMENT_THREADS_QUERY,
        variables: { postId }
      })
      .pipe(
        map((res) => (res.data?.obtenerHilosComentarios ?? []).map(dtoToCommentThread))
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
}

function dtoToCommentAuthor(dto: CommentThreadDTO): CommentThread['author'] {
  const authorId = dto.autorId ?? 'unknown';

  return {
    id: authorId,
    email: `${authorId}@nexora.app`,
    username: dto.autorId ?? 'usuario',
    fullName: undefined,
    avatarUrl: undefined
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
    likesCount: 0,
    replies: (dto.respuestas ?? []).map(dtoToCommentThread)
  };

  return thread;
}
