import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { FetchResult } from '@apollo/client';
import { catchError, from, map, Observable, switchMap } from 'rxjs';

import { AuthSession } from '@app/core/services/auth-session';
import { SupabaseStorageService } from '@app/core/services/supabase-storage.service';
import { CREATE_PUBLICATION_MUTATION } from '@app/graphql/graphql.queries';
import { Post } from '@app/interfaces/feed';
import { PublicationDraft } from '../pages/new-publication/publication-draft.model';
import { 
  extractTags, 
  normalizeTag, 
  normalizeRoleLabel, 
  buildAvatarUrl, 
  createLocalPostId 
} from './feed-publication.helpers';

interface FeedAuthorQueryModel {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
}

interface CreatePublicationMutationResponse {
  crearPublicacion: {
    id: string;
    titulo?: string | null;
    contenido: string;
    tags?: string[] | null;
    location?: string | null;
    imageUrl?: string | null;
    isOfficial: boolean;
    createdAt?: string | null;
    commentsCount: number;
    autor: FeedAuthorQueryModel;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FeedPublicationService {
  private readonly apollo = inject(Apollo);
  private readonly authSession = inject(AuthSession);
  private readonly storageService = inject(SupabaseStorageService);

  publish(draft: PublicationDraft): Observable<Post> {
    const firstImage = draft.attachments.find((file) => file.type.startsWith('image/'));
    const uploadPromise = firstImage ? this.uploadImage(firstImage) : Promise.resolve(undefined);

    return from(uploadPromise).pipe(
      switchMap((imageUrl) => {
        return this.apollo.mutate<CreatePublicationMutationResponse>({
          mutation: CREATE_PUBLICATION_MUTATION,
          variables: {
            input: {
              titulo: this.resolveTitle(draft),
              contenido: draft.content.trim(),
              tags: draft.tags?.map((tag) => normalizeTag(tag)) ?? [],
              location: draft.location?.trim() || null,
              imageUrl: imageUrl || null
            }
          }
        });
      }),
      map((result: FetchResult<CreatePublicationMutationResponse>) => this.mapPublishedPost(result.data?.crearPublicacion, draft)),
      catchError((error) => {
        console.error('[FeedPublicationService] Error:', error);
        throw error;
      })
    );
  }

  private async uploadImage(file: File): Promise<string> {
    const user = this.authSession.getUser();
    const userId = user?.id || 'anonymous';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

    const fileName = `${userId}/${uuid}.${fileExt}`;
    return await this.storageService.uploadFile('nexora-posts', fileName, file);
  }

  buildOptimisticPost(draft: PublicationDraft): Post {
    const firstImage = draft.attachments.find((file) => file.type.startsWith('image/'));
    const previewImageUrl = firstImage ? URL.createObjectURL(firstImage) : undefined;
    const user = this.authSession.getUser();
    const content = draft.content.trim();

    return {
      id: createLocalPostId(),
      author: {
        id: user?.id ?? 'current-user',
        email: user?.email ?? 'usuario@nexora.app',
        username: user?.username ?? 'tu.usuario',
        fullName: user?.fullName ?? 'Tu Perfil',
        role: normalizeRoleLabel(user?.roles?.[0] ?? 'Comunidad Nexora'),
        verified: false,
        avatar: user?.avatarUrl || buildAvatarUrl(user?.username ?? user?.email ?? 'NexoraUser'),
        bio: user?.bio ?? ''
      },
      is_official: false,
      title: this.resolvePostTitle(draft.title, content),
      content,
      location: draft.location?.trim() || undefined,
      imageUrl: previewImageUrl,
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      shares: 0,
      tags: draft.tags && draft.tags.length > 0 ? draft.tags.map((tag) => normalizeTag(tag)) : extractTags(content)
    };
  }

  private mapPublishedPost(payload: CreatePublicationMutationResponse['crearPublicacion'] | undefined, draft: PublicationDraft): Post {
    if (!payload) return this.buildOptimisticPost(draft);

    const firstImage = draft.attachments.find((file) => file.type.startsWith('image/'));
    return {
      id: payload.id,
      author: {
        id: payload.autor.id,
        email: `${payload.autor.username}@nexora.app`,
        username: payload.autor.username,
        fullName: payload.autor.fullName,
        role: payload.isOfficial ? 'Nexora oficial' : 'Comunidad Nexora',
        verified: payload.isOfficial,
        avatar: payload.autor.avatarUrl || buildAvatarUrl(payload.autor.username),
        bio: ''
      },
      is_official: payload.isOfficial,
      title: this.resolvePostTitle(payload.titulo, payload.contenido),
      content: payload.contenido,
      location: payload.location?.trim() || draft.location?.trim() || undefined,
      imageUrl: payload.imageUrl || (firstImage ? URL.createObjectURL(firstImage) : undefined),
      createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
      likesCount: 0,
      commentsCount: payload.commentsCount,
      shares: 0,
      tags: payload.tags && payload.tags.length > 0
        ? payload.tags.map((tag) => normalizeTag(tag))
        : draft.tags && draft.tags.length > 0
          ? draft.tags.map((tag) => normalizeTag(tag))
          : extractTags(payload.contenido),
      isLiked: false
    };
  }

  private resolveTitle(draft: PublicationDraft): string {
    return draft.title?.trim() || draft.content.trim().split('\n')[0]?.slice(0, 90) || 'Nueva publicación';
  }

  private resolvePostTitle(rawTitle: string | null | undefined, content: string): string | undefined {
    const normalizedTitle = rawTitle?.trim();
    if (!normalizedTitle || normalizedTitle === content.trim()) return undefined;
    return normalizedTitle;
  }
}
