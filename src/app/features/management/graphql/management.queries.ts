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
      userGrowth {
        label
        value
      }
      careerDistribution {
        category
        count
        percentage
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

export const UPDATE_USER_ADMIN_MUTATION = `
  mutation UpdateUserAdmin($userId: ID!, $input: UpdateProfileInput!) {
    updateProfileAdmin(userId: $userId, input: $input) {
      id
      username
      fullName
      career
    }
  }
`;

export const GET_CATALOGS = `
  query GetCatalogs {
    faculties { id name }
    courses { id name faculty { id name } }
    academicInterests { id name }
  }
`;

export const CREATE_FACULTY = `
  mutation CreateFaculty($name: String!) {
    createFaculty(name: $name) { id name }
  }
`;

export const UPDATE_FACULTY = `
  mutation UpdateFaculty($id: ID!, $name: String!) {
    updateFaculty(id: $id, name: $name) { id name }
  }
`;

export const DELETE_FACULTY = `
  mutation DeleteFaculty($id: ID!) {
    deleteFaculty(id: $id)
  }
`;

export const CREATE_COURSE = `
  mutation CreateCourse($name: String!, $facultyId: ID!) {
    createCourse(name: $name, facultyId: $facultyId) { id name faculty { id name } }
  }
`;

export const UPDATE_COURSE = `
  mutation UpdateCourse($id: ID!, $name: String!, $facultyId: ID!) {
    updateCourse(id: $id, name: $name, facultyId: $facultyId) { id name faculty { id name } }
  }
`;

export const DELETE_COURSE = `
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

export const CREATE_INTEREST = `
  mutation CreateInterest($name: String!) {
    createAcademicInterest(name: $name) { id name }
  }
`;

export const UPDATE_INTEREST = `
  mutation UpdateInterest($id: ID!, $name: String!) {
    updateAcademicInterest(id: $id, name: $name) { id name }
  }
`;

export const DELETE_INTEREST = `
  mutation DeleteInterest($id: ID!) {
    deleteAcademicInterest(id: $id)
  }
`;

export const GET_ADMIN_EVENTS = `
  query GetAdminEvents($limit: Int, $offset: Int, $category: String) {
    universityEvents(limit: $limit, offset: $offset, category: $category) {
      id
      title
      description
      date
      location
      category
      attendeesCount
      image
      communityLinks { whatsapp telegram discord }
    }
  }
`;

export const CREATE_EVENT_MUTATION = `
  mutation CrearEvento($input: CreateEventInput!) {
    crearEvento(input: $input) { id title }
  }
`;

export const UPDATE_EVENT_MUTATION = `
  mutation EditarEvento($id: ID!, $input: UpdateEventInput!) {
    editarEvento(eventId: $id, input: $input) { id title }
  }
`;

export const DELETE_EVENT_MUTATION = `
  mutation EliminarEvento($id: ID!) {
    eliminarEvento(eventId: $id)
  }
`;
