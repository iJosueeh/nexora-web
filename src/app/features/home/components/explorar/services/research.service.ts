import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClientService } from '../../../../../shared/services/api-client.service';
import { ResearchPaper, CreateResearchPaperInput, UpdateResearchPaperInput } from '../interfaces/research-paper.model';

@Injectable({
  providedIn: 'root'
})
export class ResearchService {
  private readonly api = inject(ApiClientService);

  getResearchPapers(limit = 20, offset = 0, faculty?: string): Observable<ResearchPaper[]> {
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
            id
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

  getResearchBySlug(slug: string): Observable<ResearchPaper> {
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
            id
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

  createPaper(input: CreateResearchPaperInput): Observable<ResearchPaper> {
    const mutation = `
      mutation CrearRecurso($input: CreateResearchPaperInput!) {
        crearRecurso(input: $input) {
          id
          slug
          title
          summary
          faculty
          views
          author {
            id
            fullName
            avatarUrl
          }
          createdAt
          pdfUrl
        }
      }
    `;

    return this.api.post<{ data: { crearRecurso: ResearchPaper } }>('/graphql', {
      query: mutation,
      variables: { input }
    }).pipe(map(res => res.data.crearRecurso));
  }

  updatePaper(paperId: string, input: UpdateResearchPaperInput): Observable<ResearchPaper> {
    const mutation = `
      mutation EditarRecurso($paperId: ID!, $input: UpdateResearchPaperInput!) {
        editarRecurso(paperId: $paperId, input: $input) {
          id
          slug
          title
          summary
          faculty
          views
          author {
            id
            fullName
            avatarUrl
          }
          createdAt
          pdfUrl
        }
      }
    `;

    return this.api.post<{ data: { editarRecurso: ResearchPaper } }>('/graphql', {
      query: mutation,
      variables: { paperId, input }
    }).pipe(map(res => res.data.editarRecurso));
  }

  deletePaper(paperId: string): Observable<boolean> {
    const mutation = `
      mutation EliminarRecurso($paperId: ID!) {
        eliminarRecurso(paperId: $paperId)
      }
    `;

    return this.api.post<{ data: { eliminarRecurso: boolean } }>('/graphql', {
      query: mutation,
      variables: { paperId }
    }).pipe(map(res => res.data.eliminarRecurso));
  }
}
