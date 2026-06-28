import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

import { AVAILABLE_TAGS_QUERY, TRENDING_TOPICS_QUERY, FEED_POSTS_QUERY } from '../../../graphql/graphql.queries';
import { Trend } from '../models/trend.model';

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

interface FeedPostQueryModel {
  id: string;
  titulo?: string | null;
  contenido: string;
  likesCount: number;
  commentsCount: number;
  tags?: string[] | null;
}

interface FeedPostsQueryResponse {
  obtenerFeedPrincipal: FeedPostQueryModel[];
}

/**
 * Service to manage feed tags and trends based on REAL interaction data.
 */
@Injectable({
  providedIn: 'root'
})
export class FeedTagsService {
  private readonly apollo = inject(Apollo);

  private readonly suggestedTags = [
    'ReactJS', 'Angular', 'TypeScript', 'Java', 'Python', 'AI', 'Research', 'Campus', 'Event'
  ];

  /**
   * Get suggested tags for autocomplete.
   */
  getSuggestedTags(search = '', limit = 12): Observable<string[]> {
    return this.apollo
      .query<AvailableTagsQueryResponse>({
        query: AVAILABLE_TAGS_QUERY,
        variables: { search, limit },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map((result) => result.data?.availableTags?.map((tag) => tag.name) ?? []),
        map((tags) => (tags.length > 0 ? tags : this.filterTags(search, this.suggestedTags).slice(0, limit))),
        catchError(() => of(this.filterTags(search, this.suggestedTags).slice(0, limit)))
      );
  }

  /**
   * Get trends mapped from real data in the backend or aggregated from recent posts.
   */
  getTrends(search = '', limit = 10): Observable<Trend[]> {
    return this.apollo.query<TrendingTopicsQueryResponse>({
      query: TRENDING_TOPICS_QUERY,
      variables: { limit },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data?.trendingTopics ?? []),
      switchMap(topics => {
        // If the backend returns trending topics, use them
        if (topics.length > 0) {
          return of(topics.map(topic => this.mapToTrend(topic.titulo || `#${topic.tags?.[0] || 'trend'}`, topic.interactionScore)));
        }
        
        // Fallback: Calculate trends locally from the most recent posts
        return this.calculateTrendsFromPosts(limit);
      }),
      catchError(() => this.calculateTrendsFromPosts(limit))
    );
  }

  /**
   * Aggregates real metrics (likes + comments) from the last 50 posts to identify current trends.
   */
  private calculateTrendsFromPosts(limit: number): Observable<Trend[]> {
    return this.apollo.query<FeedPostsQueryResponse>({
      query: FEED_POSTS_QUERY,
      variables: { limit: 50, offset: 0 },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        const posts = result.data?.obtenerFeedPrincipal ?? [];
        const tagMap = new Map<string, number>();

        for (const post of posts) {
          const tags = this.extractTags(post.titulo, post.contenido);
          const score = (post.likesCount || 0) + (post.commentsCount || 0);
          
          for (const tag of tags) {
            const current = tagMap.get(tag) || 0;
            tagMap.set(tag, current + score);
          }
        }

        // Sort by interaction score and convert to Trend model
        return Array.from(tagMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([tag, score]) => this.mapToTrend(`#${tag}`, score));
      }),
      catchError(() => of([]))
    );
  }

  private mapToTrend(title: string, score: number): Trend {
    const tagLower = title.replace(/^#/, '').toLowerCase();
    let category = 'Tendencias en Nexora';
    
    if (['java', 'python', 'reactjs', 'angular', 'typescript', 'webdevelopment'].includes(tagLower)) {
      category = 'Tecnología y Código';
    } else if (['ai', 'research', 'ia', 'investigación'].includes(tagLower)) {
      category = 'Ciencia e Innovación';
    } else if (['campus', 'event', 'utp', 'erpsummitperu2026'].includes(tagLower)) {
      category = 'Vida Universitaria';
    }

    return {
      category: category.toUpperCase(),
      title,
      conversations: this.formatInteractionCount(score)
    };
  }

  private extractTags(title?: string | null, content?: string): string[] {
    const source = [title, content].filter(Boolean).join(' ');
    const tags = source.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    return [...new Set(tags.map((tag) => tag.slice(1).toLowerCase()))];
  }

  private formatInteractionCount(score: number): string {
    if (score === 0) return '0 interacciones';
    if (score >= 1000) return (score / 1000).toFixed(1) + 'K interacciones';
    return `${score} interacciones`;
  }

  /**
   * Filter tags based on search query.
   */
  filterTags(query: string, allTags: string[]): string[] {
    if (!query.trim()) return allTags;
    const lowerQuery = query.toLowerCase();
    return allTags.filter((tag) => tag.toLowerCase().includes(lowerQuery));
  }
}
