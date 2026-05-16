import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable } from 'rxjs';

import { TOGGLE_FOLLOW_MUTATION, UPDATE_PROFILE_MUTATION } from '../../../graphql/graphql.queries';
import { AuthUser } from '../../../interfaces/auth';

interface UpdateProfileResponse {
  actualizarPerfil: AuthUser;
}

interface ToggleFollowResponse {
  toggleFollow: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apollo = inject(Apollo);

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
