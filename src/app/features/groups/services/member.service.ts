import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable, catchError, of } from 'rxjs';
import {
  GROUP_MEMBERS_QUERY,
  PENDING_MEMBERS_QUERY,
  UPDATE_MEMBER_ROLE_MUTATION,
  REMOVE_MEMBER_MUTATION,
  APPROVE_MEMBERSHIP_MUTATION,
} from '../../../graphql/graphql.queries';
import { GroupMembership } from '../interfaces/group.model';

interface ApproveMembershipMutationResponse {
  aprobarMembresia: GroupMembership;
}

interface GroupMembersQueryResponse {
  groupMembers: GroupMember[];
}

interface PendingMembersQueryResponse {
  pendingMembers: PendingMember[];
}

interface UpdateMemberRoleMutationResponse {
  actualizarRolMiembro: GroupMembership;
}

interface RemoveMemberMutationResponse {
  removerMiembro: boolean;
}

export interface GroupMember {
  userId: string;
  username: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: 'OWNER' | 'MODERATOR' | 'MEMBER';
  status: string;
}

export interface PendingMember {
  membershipId: string;
  userId: string;
  username: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private readonly apollo = inject(Apollo);

  getGroupMembers(groupId: string): Observable<GroupMember[]> {
    return this.apollo
      .query<GroupMembersQueryResponse>({
        query: GROUP_MEMBERS_QUERY,
        variables: { groupId },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.groupMembers ?? []),
        catchError(() => of([]))
      );
  }

  getPendingMembers(groupId: string): Observable<PendingMember[]> {
    return this.apollo
      .query<PendingMembersQueryResponse>({
        query: PENDING_MEMBERS_QUERY,
        variables: { groupId },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.pendingMembers ?? []),
        catchError(() => of([]))
      );
  }

  approveMembership(groupId: string, membershipId: string): Observable<GroupMembership | null> {
    return this.apollo
      .mutate<ApproveMembershipMutationResponse>({
        mutation: APPROVE_MEMBERSHIP_MUTATION,
        variables: { groupId, membershipId },
      })
      .pipe(
        map((result) => result.data?.aprobarMembresia ?? null),
        catchError(() => of(null))
      );
  }

  updateMemberRole(groupId: string, targetUserId: string, role: string): Observable<GroupMembership | null> {
    return this.apollo
      .mutate<UpdateMemberRoleMutationResponse>({
        mutation: UPDATE_MEMBER_ROLE_MUTATION,
        variables: { groupId, targetUserId, role },
      })
      .pipe(
        map((result) => result.data?.actualizarRolMiembro ?? null),
        catchError(() => of(null))
      );
  }

  removeMember(groupId: string, targetUserId: string): Observable<boolean> {
    return this.apollo
      .mutate<RemoveMemberMutationResponse>({
        mutation: REMOVE_MEMBER_MUTATION,
        variables: { groupId, targetUserId },
      })
      .pipe(
        map((result) => result.data?.removerMiembro ?? false),
        catchError(() => of(false))
      );
  }
}
