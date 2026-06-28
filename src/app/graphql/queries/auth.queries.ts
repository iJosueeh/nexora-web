import { gql } from 'apollo-angular';

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    actualizarPerfil(input: $input) {
      id
      email
      username
      fullName
      bio
      career
      avatarUrl
      bannerUrl
      followersCount
      followingCount
      academicInterests
      profileComplete
    }
  }
`;

export const TOGGLE_FOLLOW_MUTATION = gql`
	mutation ToggleFollow($targetUserId: ID!) {
		toggleFollow(targetUserId: $targetUserId)
	}
`;

export const FOLLOWERS_QUERY = gql`
  query Followers($userId: ID!) {
    followers(userId: $userId) {
      id
      username
      fullName
      avatarUrl
      isFollowing
      bio
    }
  }
`;

export const FOLLOWING_QUERY = gql`
  query Following($userId: ID!) {
    following(userId: $userId) {
      id
      username
      fullName
      avatarUrl
      isFollowing
      bio
    }
  }
`;
