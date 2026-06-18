import { gql } from 'apollo-angular';

export const SEARCH_EVENTS_QUERY = gql`
  query SearchEvents($query: String!, $limit: Int!, $offset: Int!) {
    searchEvents(query: $query, limit: $limit, offset: $offset) {
      id
      slug
      title
      description
      date
      location
      category
      attendeesCount
      image
    }
  }
`;
