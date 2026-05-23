import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { catchError, from, map, Observable, switchMap } from 'rxjs';

import { AuthSession } from '@app/core/services/auth-session';
import { SupabaseStorageService } from '@app/core/services/supabase-storage.service';
import { CREATE_PUBLICATION_MUTATION } from '@app/graphql/graphql.queries';
import { Post } from '@app/interfaces/feed';
import { PublicationDraft } from '../pages/new-publication/publication-draft.model';

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
  constructor(
    private readonly apollo: Apollo,
    private readonly authSession: AuthSession,
    private readonly storageService: SupabaseStorageService
  ) {}

  publish(draft: PublicationDraft): Observable<Post> {
    console.log('[FeedPublicationService] Iniciando publicación...', draft);
    const firstImage = draft.attachments.find((file) => file.type.startsWith('image/'));
    
    const upload$: Observable<string | undefined> = firstImage 
      ? from(this.uploadImage(firstImage))
      : from(Promise.resolve(undefined));

    return upload$.pipe(
      switchMap((imageUrl: string | undefined) => {
        console.log('[FeedPublicationService] Imagen procesada. URL:', imageUrl);
        return this.apollo.mutate<CreatePublicationMutationResponse>({
          mutation: CREATE_PUBLICATION_MUTATION,
          variables: {
            input: {
              titulo: this.resolveTitle(draft),
              contenido: draft.content.trim(),
              tags: draft.tags?.map((tag) => this.normalizeTag(tag)) ?? [],
              location: draft.location?.trim() || null,
              imageUrl: imageUrl || null
            }
          }
        });
      }),
      map((result) => {
        console.log('[FeedPublicationService] Mutación exitosa:', result.data?.crearPublicacion);
        return this.mapPublishedPost(result.data?.crearPublicacion, draft);
      }),
      catchError((error) => {
        console.error('[FeedPublicationService] ERROR CRÍTICO:', error);
        throw error;
      })
    );
  }

  private async uploadImage(file: File): Promise<string> {
    const user = this.authSession.getUser();
    const userId = user?.id || 'anonymous';
    const fileExt = file.name.split('.').pop() || 'jpg';
    
    // Fallback seguro para randomUUID
    const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

    const fileName = `${userId}/${uuid}.${fileExt}`;
    console.log('[FeedPublicationService] Subiendo imagen a Supabase:', fileName);
    
    try {
      return await this.storageService.uploadFile('nexora-posts', fileName, file);
    } catch (error) {
      console.error('[FeedPublicationService] Error en uploadFile:', error);
      throw error;
    }
  }

  buildOptimisticPost(draft: PublicationDraft): Post {
    const previewImageUrl = this.resolvePreviewImageUrl(draft.attachments);
    const user = this.authSession.getUser();
    const content = draft.content.trim();
    const title = this.resolvePostTitle(draft.title, content);

    return {
      id: this.createLocalPostId(),
      author: {
        id: user?.id ?? 'current-user',
        email: user?.email ?? 'usuario@nexora.app',
        username: user?.username ?? 'tu.usuario',
        fullName: user?.fullName ?? 'Tu Perfil',
        role: this.normalizeRoleLabel(user?.roles?.[0] ?? 'Comunidad Nexora'),
        verified: false,
        avatar: user?.avatarUrl || this.buildAvatarUrl(user?.username ?? user?.email ?? 'NexoraUser'),
        bio: user?.bio ?? ''
      },
      is_official: false,
      title,
      content,
      location: draft.location?.trim() || undefined,
      imageUrl: previewImageUrl,
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      shares: 0,
      tags: draft.tags && draft.tags.length > 0 ? draft.tags.map((tag) => this.normalizeTag(tag)) : this.extractTags(content)
    };
  }

  private mapPublishedPost(payload: CreatePublicationMutationResponse['crearPublicacion'] | undefined, draft: PublicationDraft): Post {
    if (!payload) {
      return this.buildOptimisticPost(draft);
    }

    const resolvedContent = payload.contenido;
    const resolvedTitle = this.resolvePostTitle(payload.titulo, resolvedContent);

    return {
      id: payload.id,
      author: {
        id: payload.autor.id,
        email: `${payload.autor.username}@nexora.app`,
        username: payload.autor.username,
        fullName: payload.autor.fullName,
        role: payload.isOfficial ? 'Nexora oficial' : 'Comunidad Nexora',
        verified: payload.isOfficial,
        avatar: payload.autor.avatarUrl || this.buildAvatarUrl(payload.autor.username),
        bio: ''
      },
      is_official: payload.isOfficial,
      title: resolvedTitle,
      content: resolvedContent,
      location: payload.location?.trim() || draft.location?.trim() || undefined,
      imageUrl: payload.imageUrl || this.resolvePreviewImageUrl(draft.attachments),
      createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
      likesCount: 0,
      commentsCount: payload.commentsCount,
      shares: 0,
      tags: payload.tags && payload.tags.length > 0
        ? payload.tags.map((tag) => this.normalizeTag(tag))
        : draft.tags && draft.tags.length > 0
          ? draft.tags.map((tag) => this.normalizeTag(tag))
          : this.extractTags(payload.contenido),
      isLiked: false
    };
  }

  private resolveTitle(draft: PublicationDraft): string {
    return draft.title?.trim() || draft.content.trim().split('\n')[0]?.slice(0, 90) || 'Nueva publicación';
  }

  private resolvePreviewImageUrl(files: File[]): string | undefined {
    const firstImage = files.find((file) => file.type.startsWith('image/'));
    return firstImage ? URL.createObjectURL(firstImage) : undefined;
  }

  private extractTags(content?: string): string[] {
    if (!content) return [];
    const tags = content.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    return [...new Set(tags.map((tag) => tag.slice(1).toLowerCase()))].slice(0, 5);
  }

  private normalizeTag(tag: string): string {
    return tag.replace(/^#/, '').trim().toLowerCase();
  }

  private resolvePostTitle(rawTitle: string | null | undefined, content: string): string | undefined {
    const normalizedTitle = rawTitle?.trim();
    if (!normalizedTitle) {
      return undefined;
    }

    return normalizedTitle === content.trim() ? undefined : normalizedTitle;
  }

  private normalizeRoleLabel(role: string): string {
    const normalized = role.trim().toUpperCase();
    const roleMap: Record<string, string> = {
      ROLE_STUDENT: 'Estudiante',
      ROLE_TEACHER: 'Docente',
      ROLE_ADMIN: 'Administrador',
      ROLE_MODERATOR: 'Moderador',
      ROLE_RESEARCHER: 'Investigador',
    };

    if (normalized in roleMap) {
      return roleMap[normalized];
    }

    return role
      .replace(/^ROLE_/, '')
      .toLowerCase()
      .split('_')
      .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : part)
      .join(' ');
  }

  private buildAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }

  private createLocalPostId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `publication-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}
