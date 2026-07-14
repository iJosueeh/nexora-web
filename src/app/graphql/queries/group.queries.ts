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

export const GROUP_MEMBERS_QUERY = gql`
  query GetGroupMembers($groupId: ID!) {
    groupMembers(groupId: $groupId) {
      userId
      username
      fullName
      avatarUrl
      role
      status
    }
  }
`;

export const PENDING_MEMBERS_QUERY = gql`
  query GetPendingMembers($groupId: ID!) {
    pendingMembers(groupId: $groupId) {
      membershipId
      userId
      username
      fullName
      avatarUrl
      status
      role
    }
  }
`;

export const UPDATE_MEMBER_ROLE_MUTATION = gql`
  mutation UpdateMemberRole($groupId: ID!, $targetUserId: ID!, $role: GroupRole!) {
    actualizarRolMiembro(groupId: $groupId, targetUserId: $targetUserId, role: $role) {
      id
      groupId
      userId
      role
      status
    }
  }
`;

export const REMOVE_MEMBER_MUTATION = gql`
  mutation RemoveMember($groupId: ID!, $targetUserId: ID!) {
    removerMiembro(groupId: $groupId, targetUserId: $targetUserId)
  }
`;

export const INVITATIONS_RECEIVED_QUERY = gql`
  query GetInvitationsReceived($status: String) {
    invitationsReceived(status: $status) {
      invitationId
      groupId
      groupName
      groupSlug
      inviterUsername
      inviterFullName
      inviterAvatarUrl
      status
      invitedUserId
    }
  }
`;

export const INVITE_MEMBER_MUTATION = gql`
  mutation InviteMember($groupId: ID!, $username: String!) {
    invitarMiembro(groupId: $groupId, username: $username) {
      invitationId
      groupId
      groupName
      groupSlug
      inviterUsername
      inviterFullName
      inviterAvatarUrl
      invitedUsername
      invitedFullName
      invitedAvatarUrl
      status
      invitedUserId
    }
  }
`;

export const ACCEPT_INVITATION_MUTATION = gql`
  mutation AcceptInvitation($invitationId: ID!) {
    aceptarInvitacion(invitationId: $invitationId) {
      id
      groupId
      userId
      role
      status
      createdAt
    }
  }
`;

export const REJECT_INVITATION_MUTATION = gql`
  mutation RejectInvitation($invitationId: ID!) {
    rechazarInvitacion(invitationId: $invitationId)
  }
`;

export const GROUP_INVITATIONS_QUERY = gql`
  query GetGroupInvitations($groupId: ID!) {
    groupInvitations(groupId: $groupId) {
      invitationId
      groupId
      groupName
      groupSlug
      inviterUsername
      inviterFullName
      inviterAvatarUrl
      invitedUsername
      invitedFullName
      invitedAvatarUrl
      status
      invitedUserId
    }
  }
`;

export const CANCEL_INVITATION_MUTATION = gql`
  mutation CancelInvitation($invitationId: ID!) {
    cancelarInvitacion(invitationId: $invitationId)
  }
`;

export const SEARCH_USERS_QUERY = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      userId
      username
      fullName
      avatarUrl
    }
  }
`;

export const DISCOVER_USERS_QUERY = gql`
  query DiscoverUsers($excludeUserIds: [ID!]) {
    discoverUsers(excludeUserIds: $excludeUserIds) {
      userId
      username
      fullName
      avatarUrl
    }
  }
`;
