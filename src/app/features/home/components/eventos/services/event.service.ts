import { Injectable, inject } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { Apollo } from 'apollo-angular';

import { UniversityEvent, CreateEventInput, UpdateEventInput } from '../interfaces/event.model';
import {
  GET_EVENTS_QUERY,
  GET_EVENT_BY_SLUG_QUERY,
  CREATE_EVENT_MUTATION,
  UPDATE_EVENT_MUTATION,
  DELETE_EVENT_MUTATION,
  CONFIRM_RSVP_MUTATION,
} from '../../../../../graphql/queries/event.queries';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apollo = inject(Apollo);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleApolloError(res: any): void {
    if (res.errors && res.errors.length > 0) {
      throw new Error(String(res.errors[0].message));
    }
  }

  getEvents(limit = 20, offset = 0, category?: string): Observable<UniversityEvent[]> {
    return this.apollo
      .query<{ universityEvents: UniversityEvent[] }>({
        query: GET_EVENTS_QUERY,
        variables: { limit, offset, category },
      })
      .pipe(
        map((res) => {
          this.handleApolloError(res);
          return res.data?.universityEvents ?? [];
        })
      );
  }

  getEventBySlug(slug: string): Observable<UniversityEvent> {
    return this.apollo
      .query<{ eventBySlug: UniversityEvent }>({
        query: GET_EVENT_BY_SLUG_QUERY,
        variables: { slug },
      })
      .pipe(
        map((res) => {
          this.handleApolloError(res);
          return res.data?.eventBySlug as UniversityEvent;
        })
      );
  }

  confirmRSVP(eventId: string): Observable<UniversityEvent> {
    return this.apollo
      .mutate<{ confirmRSVP: UniversityEvent }>({
        mutation: CONFIRM_RSVP_MUTATION,
        variables: { eventId },
      })
      .pipe(
        map((res) => {
          this.handleApolloError(res);
          return res.data!['confirmRSVP'] as UniversityEvent;
        })
      );
  }

  createEvent(input: CreateEventInput): Observable<UniversityEvent> {
    return this.apollo
      .mutate<{ crearEvento: UniversityEvent }>({
        mutation: CREATE_EVENT_MUTATION,
        variables: { input },
      })
      .pipe(
        map((res) => {
          this.handleApolloError(res);
          return res.data!['crearEvento'] as UniversityEvent;
        })
      );
  }

  updateEvent(eventId: string, input: UpdateEventInput): Observable<UniversityEvent> {
    return this.apollo
      .mutate<{ editarEvento: UniversityEvent }>({
        mutation: UPDATE_EVENT_MUTATION,
        variables: { eventId, input },
      })
      .pipe(
        map((res) => {
          this.handleApolloError(res);
          return res.data!['editarEvento'] as UniversityEvent;
        })
      );
  }

  deleteEvent(eventId: string): Observable<boolean> {
    return this.apollo
      .mutate<{ eliminarEvento: boolean }>({
        mutation: DELETE_EVENT_MUTATION,
        variables: { eventId },
      })
      .pipe(
        map((res) => {
          this.handleApolloError(res);
          return res.data!['eliminarEvento'] as boolean;
        })
      );
  }
}