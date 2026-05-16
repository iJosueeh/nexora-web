import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { GRAPHQL_URL } from '../../../core/tokens/api-endpoints.token';
import { Post } from '../../../interfaces/feed/post.model';

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  activeEvents: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  career: string;
  avatarUrl?: string;
  profileComplete: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ManagementService {
  private readonly http = inject(HttpClient);
  private readonly graphqlUrl = inject(GRAPHQL_URL);
  
  // Signals para manejar el estado global de gestión
  readonly stats = signal<AdminStats | null>(null);
  readonly users = signal<UserProfile[]>([]);
  readonly posts = signal<Post[]>([]);
  readonly loading = signal<boolean>(false);

  /**
   * Carga las estadísticas del dashboard desde GraphQL.
   */
  loadDashboardStats(): void {
    this.loading.set(true);
    
    const query = `
      query GetAdminStats {
        adminStats {
          totalUsers
          totalPosts
          activeEvents
          recentActivity {
            id
            type
            description
            createdAt
          }
        }
      }
    `;

    this.http.post<{ data: { adminStats: AdminStats } | null, errors?: any[] }>(this.graphqlUrl, { query })
      .pipe(map(response => {
        if (!response.data) {
          throw new Error(response.errors?.[0]?.message || 'Error en la respuesta de GraphQL');
        }
        return response.data.adminStats;
      }))
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading admin stats:', err);
          this.stats.set(null); 
          this.loading.set(false);
        }
      });
  }

  /**
   * Carga la lista de usuarios para administración.
   */
  loadUsers(limit = 20, offset = 0, append = false, search = ''): void {
    this.loading.set(true);
    
    const query = `
      query GetAllUsers($limit: Int, $offset: Int, $search: String) {
        allUsers(limit: $limit, offset: $offset, search: $search) {
          id
          email
          username
          fullName
          career
          avatarUrl
          profileComplete
        }
      }
    `;

    this.http.post<{ data: { allUsers: UserProfile[] } | null, errors?: any[] }>(this.graphqlUrl, { 
      query, 
      variables: { limit, offset, search } 
    })
      .pipe(map(response => {
        if (!response.data) {
          throw new Error(response.errors?.[0]?.message || 'Error en la respuesta de GraphQL');
        }
        return response.data.allUsers;
      }))
      .subscribe({
        next: (data) => {
          if (append) {
            this.users.update(current => [...current, ...data]);
          } else {
            this.users.set(data);
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading users:', err);
          if (!append) this.users.set([]);
          this.loading.set(false);
        }
      });
  }

  /**
   * Carga la lista de publicaciones para moderación.
   */
  loadPosts(limit = 10, offset = 0, append = false): void {
    this.loading.set(true);
    
    const query = `
      query GetAdminPosts($limit: Int, $offset: Int) {
        obtenerFeedPrincipal(limit: $limit, offset: $offset) {
          id
          titulo
          contenido
          isOfficial
          createdAt
          imageUrl
          location
          tags
          likesCount
          commentsCount
          autor {
            id
            username
            fullName
            avatarUrl
          }
        }
      }
    `;

    this.http.post<{ data: { obtenerFeedPrincipal: any[] } | null, errors?: any[] }>(this.graphqlUrl, { 
      query, 
      variables: { limit, offset } 
    })
      .pipe(map(response => {
        if (!response.data) throw new Error('Error al cargar posts');
        return response.data.obtenerFeedPrincipal.map(p => ({
          ...p,
          title: p.titulo,
          content: p.contenido,
          author: p.autor,
          is_official: p.isOfficial
        } as Post));
      }))
      .subscribe({
        next: (data) => {
          if (append) {
            this.posts.update(current => [...current, ...data]);
          } else {
            this.posts.set(data);
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading posts:', err);
          this.loading.set(false);
        }
      });
  }

  /**
   * Marca una publicación como oficial.
   */
  markAsOfficial(postId: string, isOfficial: boolean): Observable<any> {
    const query = `
      mutation MarkAsOfficial($postId: ID!, $isOfficial: Boolean!) {
        markPostAsOfficial(postId: $postId, isOfficial: $isOfficial) {
          id
          isOfficial
        }
      }
    `;
    return this.http.post(this.graphqlUrl, { query, variables: { postId, isOfficial } });
  }

  /**
   * Elimina una publicación de forma permanente.
   */
  deletePost(postId: string): Observable<any> {
    const query = `
      mutation DeletePost($postId: ID!) {
        deletePost(postId: $postId)
      }
    `;
    return this.http.post(this.graphqlUrl, { query, variables: { postId } });
  }

  /**
   * Limpia la lista de usuarios.
   */
  resetUsers(): void {
    this.users.set([]);
  }

  /**
   * Limpia la lista de publicaciones.
   */
  resetPosts(): void {
    this.posts.set([]);
  }

  /**
   * Cambia el estado de activación de un usuario.
   */
  updateUserStatus(userId: string, isActive: boolean): Observable<UserProfile> {
    const query = `
      mutation UpdateUserStatus($userId: ID!, $isActive: Boolean!) {
        updateUserStatus(userId: $userId, isActive: $isActive) {
          id
          email
          profileComplete
        }
      }
    `;

    return this.http.post<{ data: { updateUserStatus: UserProfile } }>(this.graphqlUrl, {
      query,
      variables: { userId, isActive }
    }).pipe(map(response => response.data.updateUserStatus));
  }
}
