import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable } from 'rxjs';

import { TOGGLE_FOLLOW_MUTATION, UPDATE_PROFILE_MUTATION, FOLLOWERS_QUERY, FOLLOWING_QUERY } from '../../../graphql/graphql.queries';
import { AuthUser } from '../../../interfaces/auth';

interface UpdateProfileResponse {
  actualizarPerfil: AuthUser;
}

interface ToggleFollowResponse {
  toggleFollow: boolean;
}

interface FollowersResponse {
  followers: AuthUser[];
}

interface FollowingResponse {
  following: AuthUser[];
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private readonly apollo: Apollo) {}

  getFollowers(userId: string): Observable<AuthUser[]> {
    return this.apollo
      .query<FollowersResponse>({
        query: FOLLOWERS_QUERY,
        variables: { userId },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data!.followers));
  }

  getFollowing(userId: string): Observable<AuthUser[]> {
    return this.apollo
      .query<FollowingResponse>({
        query: FOLLOWING_QUERY,
        variables: { userId },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data!.following));
  }

  updateProfile(input: Partial<AuthUser>): Observable<AuthUser> {
    return this.apollo
      .mutate<UpdateProfileResponse>({
        mutation: UPDATE_PROFILE_MUTATION,
        variables: {
          input: {
            username: input.username,
            fullName: input.fullName,
            bio: input.bio,
            career: input.career,
            avatarUrl: input.avatarUrl,
            bannerUrl: input.bannerUrl,
            academicInterests: input.academicInterests,
          },
        },
      })
      .pipe(map((result) => result.data!.actualizarPerfil));
  }

  toggleFollow(targetUserId: string): Observable<boolean> {
    return this.apollo
      .mutate<ToggleFollowResponse>({
        mutation: TOGGLE_FOLLOW_MUTATION,
        variables: {
          targetUserId,
        },
      })
      .pipe(map((result) => result.data!.toggleFollow));
  }
}
