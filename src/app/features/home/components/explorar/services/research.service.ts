import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClientService } from '../../../../../shared/services/api-client.service';
import { ResearchPaper } from '../interfaces/research-paper.model';

@Injectable({
  providedIn: 'root'
})
export class ResearchService {
  private readonly api = inject(ApiClientService);

  getResearchPapers(limit: number = 20, offset: number = 0, faculty?: string): Observable<ResearchPaper[]> {
    const query = `
      query GetResearchPapers($limit: Int, $offset: Int, $faculty: String) {
        researchPapers(limit: $limit, offset: $offset, faculty: $faculty) {
          id
          slug
          title
          summary
          faculty
          views
          author {
            fullName
            avatarUrl
          }
          createdAt
        }
      }
    `;

    return this.api.post<{ data: { researchPapers: ResearchPaper[] } }>('/graphql', {
      query,
      variables: { limit, offset, faculty }
    }).pipe(map(res => res.data.researchPapers));
  }

  getResearchBySlug(slug: String): Observable<ResearchPaper> {
    const query = `
      query GetResearchBySlug($slug: String!) {
        researchBySlug(slug: $slug) {
          id
          slug
          title
          summary
          faculty
          views
          author {
            fullName
            avatarUrl
          }
          createdAt
          pdfUrl
        }
      }
    `;

    return this.api.post<{ data: { researchBySlug: ResearchPaper } }>('/graphql', {
      query,
      variables: { slug }
    }).pipe(map(res => res.data.researchBySlug));
  }
}
