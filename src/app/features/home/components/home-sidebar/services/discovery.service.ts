import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { GRAPHQL_URL } from '../../../../../core/tokens/api-endpoints.token';
import { Trend, UserSuggestion } from '../discovery.model';

export interface DiscoverySidebarData {
  trends: Trend[];
  suggestions: UserSuggestion[];
}

type TrendingTopicRow = {
  id: string;
  titulo: string | null;
  tags: string[];
  commentsCount: number;
  likesCount: number;
};

type UserRow = {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

@Injectable({ providedIn: 'root' })
export class DiscoveryService {
  private readonly http = inject(HttpClient);
  private readonly graphqlUrl = inject(GRAPHQL_URL);

  getSidebarData(): Observable<DiscoverySidebarData> {
    return forkJoin({
      trends: this.query<{ trendingTopics: TrendingTopicRow[] }>({
        query: `
          query HomeSidebarTrendingTopics($limit: Int) {
            trendingTopics(limit: $limit) {
              id
              titulo
              tags
              commentsCount
              likesCount
            }
          }
        `,
        variables: { limit: 5 },
        key: 'trendingTopics',
      }),
      suggestions: this.query<{ allUsers: UserRow[] }>({
        query: `
          query HomeSidebarUsers($limit: Int, $offset: Int, $search: String) {
            allUsers(limit: $limit, offset: $offset, search: $search) {
              id
              username
              fullName
              avatarUrl
            }
          }
        `,
        variables: { limit: 5, offset: 0, search: '' },
        key: 'allUsers',
      }),
    }).pipe(map(({ trends, suggestions }) => ({
      trends: trends.map((topic) => ({
        id: topic.id,
        category: topic.tags[0] ?? 'Tendencia',
        title: topic.titulo?.startsWith('#') ? topic.titulo : `#${topic.titulo ?? 'Sin título'}`,
        postsCount: topic.commentsCount + topic.likesCount,
      })),
      suggestions: suggestions.map((user) => ({
        id: user.id,
        name: user.fullName?.trim() || user.username?.trim() || 'Usuario Nexora',
        username: user.username?.trim() || 'nexora',
        avatarUrl: user.avatarUrl?.trim() || 'https://api.dicebear.com/7.x/avataaars/svg?seed=nexora',
      })),
    })));
  }

  private query<T extends Record<string, unknown>>({
    query,
    variables,
    key,
  }: {
    query: string;
    variables: Record<string, unknown>;
    key: string;
  }): Observable<T[keyof T]> {
    return this.http.post<{ data?: T; errors?: Array<{ message: string }> }>(this.graphqlUrl, { query, variables }).pipe(
      map((response) => {
        const data = response.data?.[key as keyof T];

        if (!data) {
          throw new Error(response.errors?.[0]?.message || 'Error en la respuesta de GraphQL');
        }

        return data;
      }),
    );
  }
}
