import { gql } from 'apollo-angular';

export const FEED_POSTS_QUERY = gql`
	query FeedPosts($limit: Int!, $offset: Int!) {
		obtenerFeedPrincipal(limit: $limit, offset: $offset) {
			id
			titulo
			contenido
			imageUrl
			location
			isOfficial
			createdAt
			commentsCount
			likesCount
			isLiked
			autor {
				id
				username
				fullName
				avatarUrl
			}
		}
	}
`;

export const POST_BY_ID_QUERY = gql`
	query PostById($postId: ID!) {
		obtenerPublicacionPorId(postId: $postId) {
			id
			titulo
			contenido
			imageUrl
			location
			isOfficial
			createdAt
			commentsCount
			likesCount
			isLiked
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

export const AVAILABLE_TAGS_QUERY = gql`
	query AvailableTags($search: String, $limit: Int) {
		availableTags(search: $search, limit: $limit) {
			id
			name
			usageCount
		}
	}
`;

export const COMMENT_THREADS_QUERY = gql`
		query CommentThreads($postId: ID!) {
			comentariosPorPost(postId: $postId) {
			id
			postId
			parentId
			autor {
				id
				username
				fullName
				avatarUrl
			}
			contenido
			createdAt
			likesCount
			isLiked
			respuestas {
				id
				postId
				parentId
				autor {
					id
					username
					fullName
					avatarUrl
				}
				contenido
				createdAt
				likesCount
				isLiked
				respuestas {
					id
					postId
					parentId
					autor {
						id
						username
						fullName
						avatarUrl
					}
					contenido
					createdAt
					likesCount
					isLiked
					respuestas {
						id
						postId
						parentId
						autor {
							id
							username
							fullName
							avatarUrl
						}
						contenido
						createdAt
						likesCount
						isLiked
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
      autor {
				id
				username
				fullName
				avatarUrl
			}
      contenido
      createdAt
      likesCount
      isLiked
    }
  }
`;

export const EDIT_COMMENT_MUTATION = gql`
  mutation EditComment($commentId: ID!, $contenido: String!) {
    editarComentario(commentId: $commentId, contenido: $contenido) {
      id
      postId
      parentId
      autor {
				id
				username
				fullName
				avatarUrl
			}
      contenido
      createdAt
      likesCount
      isLiked
    }
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($commentId: ID!) {
    eliminarComentario(commentId: $commentId)
  }
`;

export const TOGGLE_COMMENT_LIKE_MUTATION = gql`
  mutation ToggleCommentLike($commentId: ID!) {
    toggleCommentLike(commentId: $commentId)
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
