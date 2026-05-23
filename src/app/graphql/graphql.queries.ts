import { gql } from 'apollo-angular';

export const FEED_POSTS_QUERY = gql`
	query FeedPosts($limit: Int!, $offset: Int!) {
		obtenerFeedPrincipal(limit: $limit, offset: $offset) {
			id
			titulo
			contenido
			tags
			location
			isOfficial
			createdAt
			commentsCount
			likesCount
			isLiked
			imageUrl
			autor {
				id
				username
				fullName
				avatarUrl
			}
		}
	}
`;

export const PROFILE_POSTS_QUERY = gql`
	query ProfilePosts($username: String!, $limit: Int!, $offset: Int!) {
		publicacionesPorUsuario(username: $username, limit: $limit, offset: $offset) {
			id
			titulo
			contenido
			tags
			location
			isOfficial
			createdAt
			commentsCount
			likesCount
			isLiked
			imageUrl
			autor {
				id
				username
				fullName
				avatarUrl
			}
		}
	}
`;

export const CREATE_PUBLICATION_MUTATION = gql`
	mutation CreatePublication($input: CreatePublicationInput!) {
		crearPublicacion(input: $input) {
			id
			titulo
			contenido
			tags
			location
			isOfficial
			createdAt
			commentsCount
			likesCount
			isLiked
			imageUrl
			autor {
				id
				username
				fullName
				avatarUrl
			}
		}
	}
`;

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

export const AVAILABLE_TAGS_QUERY = gql`
	query AvailableTags($search: String, $limit: Int) {
		availableTags(search: $search, limit: $limit) {
			id
			name
			usageCount
		}
	}
`;

export const NOTIFICATION_HISTORY_QUERY = gql`
	query NotificationHistory($limit: Int!, $offset: Int!) {
		notificationHistory(limit: $limit, offset: $offset) {
			id
			type
			content
			isRead
			createdAt
			sender {
				id
				username
				fullName
				avatarUrl
			}
			post {
				id
				titulo
				imageUrl
			}
		}
	}
`;

export const UNREAD_NOTIFICATIONS_COUNT_QUERY = gql`
	query UnreadNotificationsCount {
		unreadNotificationsCount
	}
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
	mutation MarkNotificationAsRead($notificationId: ID!) {
		markNotificationAsRead(notificationId: $notificationId)
	}
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
	mutation MarkAllNotificationsAsRead {
		markAllNotificationsAsRead
	}
`;

export const DELETE_POST_MUTATION = gql`
	mutation DeletePost($postId: ID!) {
		deletePost(postId: $postId)
	}
`;

export const TOGGLE_LIKE_MUTATION = gql`
	mutation ToggleLike($postId: ID!) {
		toggleLike(postId: $postId)
	}
`;

export const COMMENT_THREADS_QUERY = gql`
		query CommentThreads($postId: ID!) {
			comentariosPorPost(postId: $postId) {
			id
			postId
			parentId
			autorId
			contenido
			createdAt
			respuestas {
				id
				postId
				parentId
				autorId
				contenido
				createdAt
				respuestas {
					id
					postId
					parentId
					autorId
					contenido
					createdAt
					respuestas {
						id
						postId
						parentId
						autorId
						contenido
						createdAt
					}
				}
			}
		}
	}
`;

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    crearComentario(input: $input) {
      id
      postId
      parentId
      autorId
      contenido
      createdAt
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

export const TRENDING_TOPICS_QUERY = gql`
  query GetTrendingTopics($limit: Int) {
    trendingTopics(limit: $limit) {
      id
      titulo
      commentsCount
      likesCount
      interactionScore
      tags
    }
  }
`;

