import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { COMMENT_THREADS_QUERY } from '../../../graphql/graphql.queries';
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
  private readonly apollo = inject(Apollo);

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
}

function dtoToCommentThread(dto: CommentThreadDTO): CommentThread {
  return {
    id: dto.id,
    author: {
      id: dto.autorId ?? 'unknown',
      email: (dto.autorId ?? 'unknown') + '@nexora.app',
      username: dto.autorId ?? 'usuario',
      fullName: undefined,
      avatarUrl: undefined
    } as any,
    content: dto.contenido,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    likesCount: 0,
    replies: (dto.respuestas ?? []).map(dtoToCommentThread)
  } as CommentThread;
}
