import { gql } from 'apollo-angular';

export const SEARCH_PAPERS_QUERY = gql`
  query SearchPapers($query: String!, $limit: Int!, $offset: Int!) {
    searchPapers(query: $query, limit: $limit, offset: $offset) {
      id
      slug
      title
      summary
      faculty
      views
      createdAt
      pdfUrl
      author {
        id
        username
        fullName
        avatarUrl
      }
    }
  }
`;
