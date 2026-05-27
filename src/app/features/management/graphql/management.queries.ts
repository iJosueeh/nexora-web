export const GET_ADMIN_STATS = `
  query GetAdminStats {
    adminStats {
      totalUsers
      totalPosts
      activeEvents
      recentActivity {
        id
        type
        description
        createdAt
      }
    }
  }
`;

export const GET_ALL_USERS = `
  query GetAllUsers($limit: Int, $offset: Int, $search: String) {
    allUsers(limit: $limit, offset: $offset, search: $search) {
      id
      email
      username
      fullName
      career
      avatarUrl
      profileComplete
    }
  }
`;

export const GET_ADMIN_POSTS = `
  query GetAdminPosts($limit: Int, $offset: Int) {
    obtenerFeedPrincipal(limit: $limit, offset: $offset) {
      id
      titulo
      contenido
      isOfficial
      createdAt
      imageUrl
      location
      tags
      likesCount
      commentsCount
      autor {
        id
        username
        fullName
        avatarUrl
      }
    }
  }
`;

export const MARK_AS_OFFICIAL_MUTATION = `
  mutation MarkAsOfficial($postId: ID!, $isOfficial: Boolean!) {
    markPostAsOfficial(postId: $postId, isOfficial: $isOfficial) {
      id
      isOfficial
    }
  }
`;

export const DELETE_POST_ADMIN_MUTATION = `
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;

export const UPDATE_USER_STATUS_MUTATION = `
  mutation UpdateUserStatus($userId: ID!, $isActive: Boolean!) {
    updateUserStatus(userId: $userId, isActive: $isActive) {
      id
      email
      profileComplete
    }
  }
`;
