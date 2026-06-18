import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable, catchError, of } from 'rxjs';
import {
  STUDY_GROUPS_QUERY,
  STUDY_GROUP_BY_SLUG_QUERY,
  MY_GROUPS_QUERY,
  CREATE_GROUP_MUTATION,
  UPDATE_GROUP_MUTATION,
  DELETE_GROUP_MUTATION,
  JOIN_GROUP_MUTATION,
  LEAVE_GROUP_MUTATION,
  APPROVE_MEMBERSHIP_MUTATION,
} from '../../../graphql/graphql.queries';
import { StudyGroup, CreateStudyGroupInput, UpdateStudyGroupInput, GroupMembership } from '../interfaces/group.model';

interface StudyGroupsQueryResponse {
  studyGroups: StudyGroup[];
}

interface StudyGroupBySlugQueryResponse {
  studyGroupBySlug: StudyGroup;
}

interface MyGroupsQueryResponse {
  myGroups: StudyGroup[];
}

interface CreateGroupMutationResponse {
  crearGrupo: StudyGroup;
}

interface UpdateGroupMutationResponse {
  editarGrupo: StudyGroup;
}

interface DeleteGroupMutationResponse {
  eliminarGrupo: boolean;
}

interface JoinGroupMutationResponse {
  unirseGrupo: GroupMembership;
}

interface LeaveGroupMutationResponse {
  salirGrupo: boolean;
}

interface ApproveMembershipMutationResponse {
  aprobarMembresia: GroupMembership;
}

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly apollo = inject(Apollo);

  getGroups(limit = 20, offset = 0, category?: string): Observable<StudyGroup[]> {
    return this.apollo
      .query<StudyGroupsQueryResponse>({
        query: STUDY_GROUPS_QUERY,
        variables: { limit, offset, category: category || null },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.studyGroups ?? []),
        catchError(() => of([]))
      );
  }

  getGroupBySlug(slug: string): Observable<StudyGroup | null> {
    return this.apollo
      .query<StudyGroupBySlugQueryResponse>({
        query: STUDY_GROUP_BY_SLUG_QUERY,
        variables: { slug },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.studyGroupBySlug ?? null),
        catchError(() => of(null))
      );
  }

  getMyGroups(): Observable<StudyGroup[]> {
    return this.apollo
      .query<MyGroupsQueryResponse>({
        query: MY_GROUPS_QUERY,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.myGroups ?? []),
        catchError(() => of([]))
      );
  }

  createGroup(input: CreateStudyGroupInput): Observable<StudyGroup | null> {
    return this.apollo
      .mutate<CreateGroupMutationResponse>({
        mutation: CREATE_GROUP_MUTATION,
        variables: { input },
      })
      .pipe(
        map((result) => result.data?.crearGrupo ?? null),
        catchError(() => of(null))
      );
  }

  updateGroup(groupId: string, input: UpdateStudyGroupInput): Observable<StudyGroup | null> {
    return this.apollo
      .mutate<UpdateGroupMutationResponse>({
        mutation: UPDATE_GROUP_MUTATION,
        variables: { groupId, input },
      })
      .pipe(
        map((result) => result.data?.editarGrupo ?? null),
        catchError(() => of(null))
      );
  }

  deleteGroup(groupId: string): Observable<boolean> {
    return this.apollo
      .mutate<DeleteGroupMutationResponse>({
        mutation: DELETE_GROUP_MUTATION,
        variables: { groupId },
      })
      .pipe(
        map((result) => result.data?.eliminarGrupo ?? false),
        catchError(() => of(false))
      );
  }

  joinGroup(groupId: string): Observable<GroupMembership | null> {
    return this.apollo
      .mutate<JoinGroupMutationResponse>({
        mutation: JOIN_GROUP_MUTATION,
        variables: { groupId },
      })
      .pipe(
        map((result) => result.data?.unirseGrupo ?? null),
        catchError(() => of(null))
      );
  }

  leaveGroup(groupId: string): Observable<boolean> {
    return this.apollo
      .mutate<LeaveGroupMutationResponse>({
        mutation: LEAVE_GROUP_MUTATION,
        variables: { groupId },
      })
      .pipe(
        map((result) => result.data?.salirGrupo ?? false),
        catchError(() => of(false))
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
}
