import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable, catchError, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  INVITATIONS_RECEIVED_QUERY,
  INVITE_MEMBER_MUTATION,
  ACCEPT_INVITATION_MUTATION,
  REJECT_INVITATION_MUTATION,
  SEARCH_USERS_QUERY,
} from '../../../graphql/graphql.queries';

export interface GroupInvitation {
  invitationId: string;
  groupId: string;
  groupName: string;
  groupSlug: string;
  inviterUsername: string | null;
  inviterFullName: string | null;
  inviterAvatarUrl: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  invitedUserId: string;
}

export interface UserSearchResult {
  userId: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

interface InvitationsQueryResponse {
  invitationsReceived: GroupInvitation[];
}

interface SearchUsersQueryResponse {
  searchUsers: UserSearchResult[];
}

interface InviteMutationResponse {
  invitarMiembro: GroupInvitation;
}

interface AcceptInvitationMutationResponse {
  aceptarInvitacion: { id: string; groupId: string; userId: string; role: string; status: string; createdAt: string };
}

interface RejectInvitationMutationResponse {
  rechazarInvitacion: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  private readonly apollo = inject(Apollo);

  getInvitationsReceived(status?: string): Observable<GroupInvitation[]> {
    return this.apollo
      .query<InvitationsQueryResponse>({
        query: INVITATIONS_RECEIVED_QUERY,
        variables: { status: status || null },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.invitationsReceived ?? []),
        catchError(() => of([]))
      );
  }

  searchUsers(query: string): Observable<UserSearchResult[]> {
    if (query.trim().length < 2) return of([]);
    return this.apollo
      .query<SearchUsersQueryResponse>({
        query: SEARCH_USERS_QUERY,
        variables: { query },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.searchUsers ?? []),
        catchError(() => of([]))
      );
  }

  searchUsersDebounced(input$: Observable<string>): Observable<UserSearchResult[]> {
    return input$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => this.searchUsers(query)),
    );
  }

  inviteMember(groupId: string, username: string): Observable<GroupInvitation | null> {
    return this.apollo
      .mutate<InviteMutationResponse>({
        mutation: INVITE_MEMBER_MUTATION,
        variables: { groupId, username },
      })
      .pipe(
        map((result) => result.data?.invitarMiembro ?? null),
        catchError((err) => {
          console.error('Error inviting member:', err);
          return of(null);
        })
      );
  }

  acceptInvitation(invitationId: string): Observable<boolean> {
    return this.apollo
      .mutate<AcceptInvitationMutationResponse>({
        mutation: ACCEPT_INVITATION_MUTATION,
        variables: { invitationId },
      })
      .pipe(
        map((result) => !!result.data?.aceptarInvitacion),
        catchError(() => of(false))
      );
  }

  rejectInvitation(invitationId: string): Observable<boolean> {
    return this.apollo
      .mutate<RejectInvitationMutationResponse>({
        mutation: REJECT_INVITATION_MUTATION,
        variables: { invitationId },
      })
      .pipe(
        map((result) => result.data?.rechazarInvitacion ?? false),
        catchError(() => of(false))
      );
  }
}
