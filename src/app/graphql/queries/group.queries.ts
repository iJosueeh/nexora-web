import { gql } from 'apollo-angular';

export const STUDY_GROUPS_QUERY = gql`
  query GetStudyGroups($limit: Int!, $offset: Int!, $category: String) {
    studyGroups(limit: $limit, offset: $offset, category: $category) {
      id
      slug
      name
      description
      category
      memberCount
      maxMembers
      isMember
      myRole
      createdAt
    }
  }
`;

export const STUDY_GROUP_BY_SLUG_QUERY = gql`
  query GetStudyGroupBySlug($slug: String!) {
    studyGroupBySlug(slug: $slug) {
      id
      slug
      name
      description
      category
      memberCount
      maxMembers
      isMember
      myRole
      createdAt
    }
  }
`;

export const MY_GROUPS_QUERY = gql`
  query GetMyGroups {
    myGroups {
      id
      slug
      name
      description
      category
      memberCount
      maxMembers
      isMember
      myRole
      createdAt
    }
  }
`;

export const CREATE_GROUP_MUTATION = gql`
  mutation CreateStudyGroup($input: CreateStudyGroupInput!) {
    crearGrupo(input: $input) {
      id
      slug
      name
      description
      category
      memberCount
      maxMembers
      isMember
      myRole
      createdAt
    }
  }
`;

export const UPDATE_GROUP_MUTATION = gql`
  mutation UpdateStudyGroup($groupId: ID!, $input: UpdateStudyGroupInput!) {
    editarGrupo(groupId: $groupId, input: $input) {
      id
      slug
      name
      description
      category
      memberCount
      maxMembers
      isMember
      myRole
      createdAt
    }
  }
`;

export const DELETE_GROUP_MUTATION = gql`
  mutation DeleteStudyGroup($groupId: ID!) {
    eliminarGrupo(groupId: $groupId)
  }
`;

export const JOIN_GROUP_MUTATION = gql`
  mutation JoinStudyGroup($groupId: ID!) {
    unirseGrupo(groupId: $groupId) {
      id
      groupId
      userId
      role
      status
      createdAt
    }
  }
`;

export const LEAVE_GROUP_MUTATION = gql`
  mutation LeaveStudyGroup($groupId: ID!) {
    salirGrupo(groupId: $groupId)
  }
`;

export const APPROVE_MEMBERSHIP_MUTATION = gql`
  mutation ApproveMembership($groupId: ID!, $membershipId: ID!) {
    aprobarMembresia(groupId: $groupId, membershipId: $membershipId) {
      id
      groupId
      userId
      role
      status
      createdAt
    }
  }
`;
