import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClientService } from '../../../../../shared/services/api-client.service';
import { UniversityEvent } from '../interfaces/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly api = inject(ApiClientService);

  getEvents(limit: number = 20, offset: number = 0, category?: string): Observable<UniversityEvent[]> {
    const query = `
      query GetEvents($limit: Int, $offset: Int, $category: String) {
        universityEvents(limit: $limit, offset: $offset, category: $category) {
          id
          slug
          title
          description
          date
          location
          category
          attendeesCount
          image
          isUserRegistered
        }
      }
    `;

    return this.api.post<{ data: { universityEvents: UniversityEvent[] } }>('/graphql', {
      query,
      variables: { limit, offset, category }
    }).pipe(map(res => res.data.universityEvents));
  }

  getEventBySlug(slug: String): Observable<UniversityEvent> {
    const query = `
      query GetEventBySlug($slug: String!) {
        eventBySlug(slug: $slug) {
          id
          slug
          title
          description
          date
          location
          category
          attendeesCount
          image
          organizer {
            name
            role
          }
          communityLinks {
            whatsapp
            telegram
            discord
          }
          isUserRegistered
        }
      }
    `;

    return this.api.post<{ data: { eventBySlug: UniversityEvent } }>('/graphql', {
      query,
      variables: { slug }
    }).pipe(map(res => res.data.eventBySlug));
  }

  confirmRSVP(eventId: string): Observable<UniversityEvent> {
    const query = `
      mutation ConfirmRSVP($eventId: ID!) {
        confirmRSVP(eventId: $eventId) {
          id
          attendeesCount
          isUserRegistered
        }
      }
    `;

    return this.api.post<{ data: { confirmRSVP: UniversityEvent } }>('/graphql', {
      query,
      variables: { eventId }
    }).pipe(map(res => res.data.confirmRSVP));
  }
}
