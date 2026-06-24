import { gql } from 'apollo-angular';

export const TOGGLE_BOOKMARK_MUTATION = gql`
  mutation ToggleBookmark($postId: ID!) {
    toggleBookmark(postId: $postId)
  }
`;

export const IS_BOOKMARKED_QUERY = gql`
  query IsBookmarked($postId: ID!) {
    isBookmarked(postId: $postId)
  }
`;

export const BOOKMARKS_QUERY = gql`
  query GetBookmarks($limit: Int!, $offset: Int!) {
    bookmarks(limit: $limit, offset: $offset) {
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
