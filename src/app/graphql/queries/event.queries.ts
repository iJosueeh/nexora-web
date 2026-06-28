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

export const GET_EVENTS_QUERY = gql`
  query GetEvents($limit: Int, $offset: Int, $category: String) {
    universityEvents(limit: $limit, offset: $offset, category: $category) {
      id
      slug
      title
      description
      date
      location
      category
      attendeesCount
      image
      isUserRegistered
    }
  }
`;

export const GET_EVENT_BY_SLUG_QUERY = gql`
  query GetEventBySlug($slug: String!) {
    eventBySlug(slug: $slug) {
      id
      slug
      title
      description
      date
      location
      category
      attendeesCount
      image
      organizer {
        name
        role
      }
      communityLinks {
        whatsapp
        telegram
        discord
      }
      isUserRegistered
    }
  }
`;

export const CREATE_EVENT_MUTATION = gql`
  mutation CrearEvento($input: CreateEventInput!) {
    crearEvento(input: $input) {
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

export const UPDATE_EVENT_MUTATION = gql`
  mutation EditarEvento($eventId: ID!, $input: UpdateEventInput!) {
    editarEvento(eventId: $eventId, input: $input) {
      id
      slug
      title
      description
      date
      location
      category
      image
    }
  }
`;

export const DELETE_EVENT_MUTATION = gql`
  mutation EliminarEvento($eventId: ID!) {
    eliminarEvento(eventId: $eventId)
  }
`;

export const CONFIRM_RSVP_MUTATION = gql`
  mutation ConfirmRSVP($eventId: ID!) {
    confirmRSVP(eventId: $eventId) {
      id
      attendeesCount
      isUserRegistered
    }
  }
`;
