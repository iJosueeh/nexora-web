import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { GRAPHQL_URL } from '../../../core/tokens/api-endpoints.token';
import { Post } from '../../../interfaces/feed/post.model';
import { 
  GET_ADMIN_STATS, 
  GET_ALL_USERS, 
  GET_ADMIN_POSTS, 
  MARK_AS_OFFICIAL_MUTATION, 
  DELETE_POST_ADMIN_MUTATION, 
  UPDATE_USER_STATUS_MUTATION 
} from '../graphql/management.queries';

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  activeEvents: number;
  recentActivity: {
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }[];
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

interface GqlRes<T> { data: T | null; errors?: { message: string }[]; }

@Injectable({
  providedIn: 'root',
})
export class ManagementService {
  private readonly http = inject(HttpClient);
  private readonly graphqlUrl = inject(GRAPHQL_URL);
  
  readonly stats = signal<AdminStats | null>(null);
  readonly users = signal<UserProfile[]>([]);
  readonly posts = signal<Post[]>([]);
  readonly loading = signal<boolean>(false);

  loadDashboardStats(): void {
    this.loading.set(true);
    this.http.post<GqlRes<{ adminStats: AdminStats }>>(this.graphqlUrl, { query: GET_ADMIN_STATS })
      .pipe(map(r => {
        if (!r.data) throw new Error(r.errors?.[0]?.message || 'Error GQL');
        return r.data.adminStats;
      }))
      .subscribe({
        next: (data) => { this.stats.set(data); this.loading.set(false); },
        error: (err) => { console.error(err); this.stats.set(null); this.loading.set(false); }
      });
  }

  loadUsers(limit = 20, offset = 0, append = false, search = ''): void {
    this.loading.set(true);
    this.http.post<GqlRes<{ allUsers: UserProfile[] }>>(this.graphqlUrl, { 
      query: GET_ALL_USERS, 
      variables: { limit, offset, search } 
    })
      .pipe(map(r => {
        if (!r.data) throw new Error(r.errors?.[0]?.message || 'Error GQL');
        return r.data.allUsers;
      }))
      .subscribe({
        next: (data) => {
          if (append) this.users.update(c => [...c, ...data]);
          else this.users.set(data);
          this.loading.set(false);
        },
        error: (err) => { console.error(err); if (!append) this.users.set([]); this.loading.set(false); }
      });
  }

  loadPosts(limit = 10, offset = 0, append = false): void {
    this.loading.set(true);
    this.http.post<GqlRes<{ obtenerFeedPrincipal: any[] }>>(this.graphqlUrl, { 
      query: GET_ADMIN_POSTS, 
      variables: { limit, offset } 
    })
      .pipe(map(r => {
        if (!r.data) throw new Error('Error GQL');
        return r.data.obtenerFeedPrincipal.map(p => ({
          ...p,
          title: p.titulo,
          content: p.contenido,
          author: p.autor,
          is_official: p.isOfficial
        } as Post));
      }))
      .subscribe({
        next: (data) => {
          if (append) this.posts.update(c => [...c, ...data]);
          else this.posts.set(data);
          this.loading.set(false);
        },
        error: (err) => { console.error(err); this.loading.set(false); }
      });
  }

  markAsOfficial(postId: string, isOfficial: boolean): Observable<unknown> {
    return this.http.post(this.graphqlUrl, { query: MARK_AS_OFFICIAL_MUTATION, variables: { postId, isOfficial } });
  }

  deletePost(postId: string): Observable<unknown> {
    return this.http.post(this.graphqlUrl, { query: DELETE_POST_ADMIN_MUTATION, variables: { postId } });
  }

  resetUsers(): void { this.users.set([]); }
  resetPosts(): void { this.posts.set([]); }

  updateUserStatus(userId: string, isActive: boolean): Observable<UserProfile> {
    return this.http.post<GqlRes<{ updateUserStatus: UserProfile }>>(this.graphqlUrl, {
      query: UPDATE_USER_STATUS_MUTATION,
      variables: { userId, isActive }
    }).pipe(map(r => {
      if (!r.data) throw new Error('Error GQL');
      return r.data.updateUserStatus;
    }));
  }
}
