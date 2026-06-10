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
  UPDATE_USER_STATUS_MUTATION,
  UPDATE_USER_ADMIN_MUTATION,
  GET_CATALOGS,
  CREATE_FACULTY,
  UPDATE_FACULTY,
  DELETE_FACULTY,
  CREATE_COURSE,
  UPDATE_COURSE,
  DELETE_COURSE,
  CREATE_INTEREST,
  UPDATE_INTEREST,
  DELETE_INTEREST,
  GET_ADMIN_EVENTS,
  CREATE_EVENT_MUTATION,
  UPDATE_EVENT_MUTATION,
  DELETE_EVENT_MUTATION
} from '../graphql/management.queries';

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface GrowthMetric {
  label: string;
  value: number;
}

export interface DistributionMetric {
  category: string;
  count: number;
  percentage: number;
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  activeEvents: number;
  recentActivity: RecentActivity[];
  userGrowth: GrowthMetric[];
  careerDistribution: DistributionMetric[];
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

export interface Faculty { id: string; name: string; }
export interface Course { id: string; name: string; faculty: Faculty; }
export interface AcademicInterest { id: string; name: string; }

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  image?: string;
  attendeesCount: number;
  communityLinks?: {
    whatsapp?: string;
    telegram?: string;
    discord?: string;
  };
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
  readonly events = signal<AdminEvent[]>([]);
  readonly faculties = signal<Faculty[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly academicInterests = signal<AcademicInterest[]>([]);
  readonly loading = signal<boolean>(false);

  loadCatalogs(): void {
    this.loading.set(true);
    this.http.post<GqlRes<{ faculties: Faculty[], courses: Course[], academicInterests: AcademicInterest[] }>>(this.graphqlUrl, { query: GET_CATALOGS })
      .pipe(map(r => {
        if (r.errors) throw new Error(r.errors[0].message);
        if (!r.data) throw new Error('No data received from server');
        return r.data;
      }))
      .subscribe({
        next: (data) => {
          this.faculties.set(data.faculties);
          this.courses.set(data.courses);
          this.academicInterests.set(data.academicInterests);
          this.loading.set(false);
        },
        error: (err) => { console.error(err); this.loading.set(false); }
      });
  }

  // Generic Mutation helper
  private mutate(query: string, variables: any): Observable<any> {
    return this.http.post<GqlRes<any>>(this.graphqlUrl, { query, variables })
      .pipe(map(r => {
        if (!r.data) throw new Error(r.errors?.[0]?.message || 'Error GQL');
        return r.data;
      }));
  }

  createFaculty(name: string) { return this.mutate(CREATE_FACULTY, { name }); }
  updateFaculty(id: string, name: string) { return this.mutate(UPDATE_FACULTY, { id, name }); }
  deleteFaculty(id: string) { return this.mutate(DELETE_FACULTY, { id }); }

  createCourse(name: string, facultyId: string) { return this.mutate(CREATE_COURSE, { name, facultyId }); }
  updateCourse(id: string, name: string, facultyId: string) { return this.mutate(UPDATE_COURSE, { id, name, facultyId }); }
  deleteCourse(id: string) { return this.mutate(DELETE_COURSE, { id }); }

  createInterest(name: string) { return this.mutate(CREATE_INTEREST, { name }); }
  updateInterest(id: string, name: string) { return this.mutate(UPDATE_INTEREST, { id, name }); }
  deleteInterest(id: string) { return this.mutate(DELETE_INTEREST, { id }); }

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
  resetEvents(): void { this.events.set([]); }

  loadEvents(limit = 20, offset = 0, append = false, category?: string): void {
    this.loading.set(true);
    this.http.post<GqlRes<{ universityEvents: AdminEvent[] }>>(this.graphqlUrl, { 
      query: GET_ADMIN_EVENTS, 
      variables: { limit, offset, category } 
    })
      .pipe(map(r => {
        if (!r.data) throw new Error('Error GQL');
        return r.data.universityEvents;
      }))
      .subscribe({
        next: (data) => {
          if (append) this.events.update(c => [...c, ...data]);
          else this.events.set(data);
          this.loading.set(false);
        },
        error: (err) => { console.error(err); this.loading.set(false); }
      });
  }

  createEvent(input: any) { return this.mutate(CREATE_EVENT_MUTATION, { input }); }
  updateEvent(id: string, input: any) { return this.mutate(UPDATE_EVENT_MUTATION, { id, input }); }
  deleteEvent(id: string) { return this.mutate(DELETE_EVENT_MUTATION, { id }); }

  updateUserStatus(userId: string, isActive: boolean): Observable<UserProfile> {
    return this.http.post<GqlRes<{ updateUserStatus: UserProfile }>>(this.graphqlUrl, {
      query: UPDATE_USER_STATUS_MUTATION,
      variables: { userId, isActive }
    }).pipe(map(r => {
      if (!r.data) throw new Error('Error GQL');
      return r.data.updateUserStatus;
    }));
  }

  updateUserAdmin(userId: string, input: any): Observable<UserProfile> {
    return this.http.post<GqlRes<{ updateProfileAdmin: UserProfile }>>(this.graphqlUrl, {
      query: UPDATE_USER_ADMIN_MUTATION,
      variables: { userId, input }
    }).pipe(map(r => {
      if (!r.data) throw new Error('Error GQL');
      return r.data.updateProfileAdmin;
    }));
  }
}
