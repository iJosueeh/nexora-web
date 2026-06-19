import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable, catchError, of } from 'rxjs';
import {
  INVITATIONS_RECEIVED_QUERY,
  INVITE_MEMBER_MUTATION,
  ACCEPT_INVITATION_MUTATION,
  REJECT_INVITATION_MUTATION,
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

interface InvitationsQueryResponse {
  invitationsReceived: GroupInvitation[];
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
