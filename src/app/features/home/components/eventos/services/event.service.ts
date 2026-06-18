import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClientService } from '../../../../../shared/services/api-client.service';
import { UniversityEvent, CreateEventInput, UpdateEventInput } from '../interfaces/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly api = inject(ApiClientService);

  getEvents(limit = 20, offset = 0, category?: string): Observable<UniversityEvent[]> {
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

  getEventBySlug(slug: string): Observable<UniversityEvent> {
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

  createEvent(input: CreateEventInput): Observable<UniversityEvent> {
    const mutation = `
      mutation CrearEvento($input: CreateEventInput!) {
        crearEvento(input: $input) {
          id
          slug
          title
          description
          date
          location
          category
          attendeesCount
          image
        }
      }
    `;

    return this.api.post<{ data: { crearEvento: UniversityEvent } }>('/graphql', {
      query: mutation,
      variables: { input }
    }).pipe(map(res => res.data.crearEvento));
  }

  updateEvent(eventId: string, input: UpdateEventInput): Observable<UniversityEvent> {
    const mutation = `
      mutation EditarEvento($eventId: ID!, $input: UpdateEventInput!) {
        editarEvento(eventId: $eventId, input: $input) {
          id
          slug
          title
          description
          date
          location
          category
          image
        }
      }
    `;

    return this.api.post<{ data: { editarEvento: UniversityEvent } }>('/graphql', {
      query: mutation,
      variables: { eventId, input }
    }).pipe(map(res => res.data.editarEvento));
  }

  deleteEvent(eventId: string): Observable<boolean> {
    const mutation = `
      mutation EliminarEvento($eventId: ID!) {
        eliminarEvento(eventId: $eventId)
      }
    `;

    return this.api.post<{ data: { eliminarEvento: boolean } }>('/graphql', {
      query: mutation,
      variables: { eventId }
    }).pipe(map(res => res.data.eliminarEvento));
  }
}
