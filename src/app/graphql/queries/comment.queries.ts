import { gql } from 'apollo-angular';

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
