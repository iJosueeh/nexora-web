import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

import { AVAILABLE_TAGS_QUERY, TRENDING_TOPICS_QUERY } from '../../../graphql/graphql.queries';
import { map as rxMap } from 'rxjs/operators';
import { Trend, DEFAULT_TREND_CATEGORY } from '../models/trend.model';

interface AvailableTagQueryModel {
  id: string;
  name: string;
  usageCount: number;
}

interface AvailableTagsQueryResponse {
  availableTags: AvailableTagQueryModel[];
}

interface TrendingTopicModel {
  id: string;
  titulo: string;
  commentsCount: number;
  likesCount: number;
  interactionScore: number;
  tags: string[];
}

interface TrendingTopicsQueryResponse {
  trendingTopics: TrendingTopicModel[];
}

/**
 * Service to manage feed tags and trends.
 */
@Injectable({
  providedIn: 'root'
})
export class FeedTagsService {
  private readonly apollo = inject(Apollo);

  private readonly suggestedTags = [
    'ReactJS',
    'Angular',
    'TypeScript',
    'Java',
    'Python',
    'AI',
    'Research',
    'Campus',
    'Event'
  ];

  /**
   * Get suggested tags for autocomplete.
   */
  getSuggestedTags(search = '', limit = 12): Observable<string[]> {
    return this.apollo
      .query<AvailableTagsQueryResponse>({
        query: AVAILABLE_TAGS_QUERY,
        variables: {
          search,
          limit
        },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map((result) => result.data?.availableTags?.map((tag) => tag.name) ?? []),
        map((tags) => (tags.length > 0 ? tags : this.filterTags(search, this.suggestedTags).slice(0, limit))),
        catchError(() => of(this.filterTags(search, this.suggestedTags).slice(0, limit)))
      );
  }

  /**
   * Get trends mapped from real data in the backend.
   */
  getTrends(search = '', limit = 6): Observable<Trend[]> {
    return this.apollo.query<TrendingTopicsQueryResponse>({
      query: TRENDING_TOPICS_QUERY,
      variables: { limit },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data?.trendingTopics ?? []),
      switchMap(topics => {
        if (topics.length === 0) {
          return this.getMockTrends(search, limit);
        }
        
        return of(topics.map(topic => {
          const tag = topic.tags?.[0]?.toLowerCase() || '';
          let category = 'Tendencias en Nexora';
          
          if (['java', 'python', 'reactjs', 'angular', 'typescript'].includes(tag)) {
            category = 'Tecnología y Código';
          } else if (['ai', 'research', 'ia'].includes(tag)) {
            category = 'Ciencia e Innovación';
          } else if (['campus', 'event', 'utp'].includes(tag)) {
            category = 'Vida Universitaria';
          }

          return {
            category: category.toUpperCase(),
            title: topic.titulo || `#${tag}`,
            conversations: this.formatInteractionCount(topic.interactionScore)
          };
        }));
      }),
      catchError(() => this.getMockTrends(search, limit))
    );
  }

  private getMockTrends(search = '', limit = 6): Observable<Trend[]> {
    return this.getSuggestedTags(search, limit).pipe(
      rxMap((tags) =>
        tags.map((t, i) => {
          let category = 'TENDENCIAS';
          if (i % 3 === 0) category = 'CIENCIA Y CÓDIGO';
          if (i % 3 === 1) category = 'VIDA UNIVERSITARIA';
          
          const count = Math.floor(Math.random() * 15) + 2;
          return {
            category,
            title: `#${t}`,
            conversations: `${count} debates`
          };
        })
      )
    );
  }

  private formatInteractionCount(score: number): string {
    if (score >= 1000) {
      return (score / 1000).toFixed(1) + 'K';
    }
    return `${score} interacciones`;
  }

  /**
   * Filter tags based on search query.
   */
  filterTags(query: string, allTags: string[]): string[] {
    if (!query.trim()) {
      return allTags;
    }
    const lowerQuery = query.toLowerCase();
    return allTags.filter((tag) => tag.toLowerCase().includes(lowerQuery));
  }
}
