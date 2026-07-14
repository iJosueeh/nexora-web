import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable, catchError, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  INVITATIONS_RECEIVED_QUERY,
  INVITE_MEMBER_MUTATION,
  ACCEPT_INVITATION_MUTATION,
  REJECT_INVITATION_MUTATION,
  GROUP_INVITATIONS_QUERY,
  CANCEL_INVITATION_MUTATION,
  SEARCH_USERS_QUERY,
  DISCOVER_USERS_QUERY,
} from '../../../graphql/queries/group.queries';

export interface GroupInvitation {
  invitationId: string;
  groupId: string;
  groupName: string;
  groupSlug: string;
  inviterUsername: string | null;
  inviterFullName: string | null;
  inviterAvatarUrl: string | null;
  invitedUsername: string | null;
  invitedFullName: string | null;
  invitedAvatarUrl: string | null;
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

interface GroupInvitationsQueryResponse {
  groupInvitations: GroupInvitation[];
}

interface SearchUsersQueryResponse {
  searchUsers: UserSearchResult[];
}

interface DiscoverUsersQueryResponse {
  discoverUsers: UserSearchResult[];
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

interface CancelInvitationMutationResponse {
  cancelarInvitacion: boolean;
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

  discoverUsers(excludeUserIds: string[] = []): Observable<UserSearchResult[]> {
    return this.apollo
      .query<DiscoverUsersQueryResponse>({
        query: DISCOVER_USERS_QUERY,
        variables: { excludeUserIds: excludeUserIds.length > 0 ? excludeUserIds : null },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.discoverUsers ?? []),
        catchError(() => of([]))
      );
  }

  inviteMember(groupId: string, username: string): Observable<GroupInvitation> {
    return this.apollo
      .mutate<InviteMutationResponse>({
        mutation: INVITE_MEMBER_MUTATION,
        variables: { groupId, username },
      })
      .pipe(
        map((result) => {
          if (!result.data?.invitarMiembro) throw new Error('No se pudo enviar la invitación');
          return result.data.invitarMiembro;
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
        map((result) => {
          if (!result.data?.aceptarInvitacion) throw new Error('No se pudo aceptar la invitación');
          return true;
        })
      );
  }

  rejectInvitation(invitationId: string): Observable<boolean> {
    return this.apollo
      .mutate<RejectInvitationMutationResponse>({
        mutation: REJECT_INVITATION_MUTATION,
        variables: { invitationId },
      })
      .pipe(
        map((result) => {
          if (!result.data?.rechazarInvitacion) throw new Error('No se pudo rechazar la invitación');
          return true;
        })
      );
  }

  getGroupInvitations(groupId: string): Observable<GroupInvitation[]> {
    return this.apollo
      .query<GroupInvitationsQueryResponse>({
        query: GROUP_INVITATIONS_QUERY,
        variables: { groupId },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.groupInvitations ?? []),
        catchError(() => of([]))
      );
  }

  cancelInvitation(invitationId: string): Observable<boolean> {
    return this.apollo
      .mutate<CancelInvitationMutationResponse>({
        mutation: CANCEL_INVITATION_MUTATION,
        variables: { invitationId },
      })
      .pipe(
        map((result) => {
          if (!result.data?.cancelarInvitacion) throw new Error('No se pudo cancelar la invitación');
          return true;
        })
      );
  }
}
