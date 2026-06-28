import { gql } from 'apollo-angular';

const ACADEMIC_RESOURCE_FIELDS = gql`
  fragment AcademicResourceFields on AcademicResource {
    id
    title
    description
    type
    fileUrl
    fileSize
    fileFormat
    averageRating
    ratingsCount
    userRating
    downloadCount
    createdAt
    updatedAt
    author {
      id
      username
      fullName
      avatarUrl
    }
    category {
      id
      name
      career {
        id
        name
      }
    }
  }
`;

export const GET_RESOURCES_QUERY = gql`
  query Resources(
    $limit: Int
    $offset: Int
    $filter: ResourceFilter
  ) {
    resources(limit: $limit, offset: $offset, filter: $filter) {
      ...AcademicResourceFields
    }
  }
  ${ACADEMIC_RESOURCE_FIELDS}
`;

export const GET_RESOURCE_BY_ID_QUERY = gql`
  query ResourceById($id: ID!) {
    resourceById(id: $id) {
      ...AcademicResourceFields
    }
  }
  ${ACADEMIC_RESOURCE_FIELDS}
`;

export const GET_MY_RESOURCES_QUERY = gql`
  query MyResources($limit: Int, $offset: Int) {
    myResources(limit: $limit, offset: $offset) {
      ...AcademicResourceFields
    }
  }
  ${ACADEMIC_RESOURCE_FIELDS}
`;

export const GET_RESOURCE_CATEGORIES_QUERY = gql`
  query ResourceCategories($careerId: ID) {
    resourceCategories(careerId: $careerId) {
      id
      name
      career {
        id
        name
      }
    }
  }
`;

export const GET_RESOURCE_DOWNLOAD_URL_QUERY = gql`
  query ResourceDownloadUrl($resourceId: ID!) {
    resourceDownloadUrl(resourceId: $resourceId)
  }
`;

export const CREATE_RESOURCE_MUTATION = gql`
  mutation CreateResource($input: ResourceInput!) {
    createResource(input: $input) {
      ...AcademicResourceFields
    }
  }
  ${ACADEMIC_RESOURCE_FIELDS}
`;

export const UPDATE_RESOURCE_MUTATION = gql`
  mutation UpdateResource($id: ID!, $input: ResourceInput!) {
    updateResource(id: $id, input: $input) {
      ...AcademicResourceFields
    }
  }
  ${ACADEMIC_RESOURCE_FIELDS}
`;

export const DELETE_RESOURCE_MUTATION = gql`
  mutation DeleteResource($id: ID!) {
    deleteResource(id: $id)
  }
`;

export const RATE_RESOURCE_MUTATION = gql`
  mutation RateResource($resourceId: ID!, $rating: Int!) {
    rateResource(resourceId: $resourceId, rating: $rating) {
      id
      resourceId
      rating
      createdAt
    }
  }
`;
