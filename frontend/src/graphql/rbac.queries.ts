import { gql } from '@apollo/client';

// Permission Queries
export const SEARCH_PERMISSIONS = gql`
  query SearchPermissions($input: PermissionSearchInput!) {
    searchPermissions(input: $input) {
      permissions {
        id
        name
        displayName
        description
        resource
        action
        scope
        category
        conditions
        metadata
        isActive
        isSystemPerm
        createdAt
        updatedAt
      }
      total
      page
      size
      totalPages
    }
  }
`;

export const GET_PERMISSION_BY_ID = gql`
  query GetPermissionById($id: String!) {
    getPermissionById(id: $id) {
      id
      name
      displayName
      description
      resource
      action
      scope
      category
      conditions
      metadata
      isActive
      isSystemPerm
      createdAt
      updatedAt
    }
  }
`;

// Permission Mutations
export const CREATE_PERMISSION = gql`
  mutation CreatePermission($input: CreatePermissionInput!) {
    createPermission(input: $input) {
      id
      name
      displayName
      description
      resource
      action
      scope
      category
      conditions
      metadata
      isActive
      isSystemPerm
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PERMISSION = gql`
  mutation UpdatePermission($id: String!, $input: UpdatePermissionInput!) {
    updatePermission(id: $id, input: $input) {
      id
      name
      displayName
      description
      resource
      action
      scope
      category
      conditions
      metadata
      isActive
      isSystemPerm
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PERMISSION = gql`
  mutation DeletePermission($id: String!) {
    deletePermission(id: $id)
  }
`;

// Role Queries
export const SEARCH_ROLES = gql`
  query SearchRoles($input: RoleSearchInput!) {
    searchRoles(input: $input) {
      roles {
        id
        name
        displayName
        description
        isActive
        isSystemRole
        priority
        metadata
        parentId
        createdAt
        updatedAt
        permissions {
          id
          effect
          permission {
            id
            name
            displayName
            resource
            action
            scope
            description
            isActive
          }
        }
        children {
          id
          name
          displayName
        }
      }
      total
      page
      size
      totalPages
    }
  }
`;

export const GET_ROLE_BY_ID = gql`
  query GetRoleById($id: String!) {
    getRoleById(id: $id) {
      id
      name
      displayName
      description
      isActive
      isSystemRole
      priority
      metadata
      parentId
      createdAt
      updatedAt
      permissions {
        id
        effect
        permission {
          id
          name
          displayName
          resource
          action
          scope
        }
      }
      children {
        id
        name
        displayName
      }
    }
  }
`;

// Role Mutations
export const CREATE_ROLE = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      id
      name
      displayName
      description
      isActive
      isSystemRole
      priority
      metadata
      parentId
      createdAt
      updatedAt
      permissions {
        id
        effect
        permission {
          id
          name
          displayName
          resource
          action
          scope
        }
      }
      children {
        id
        name
        displayName
      }
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: String!, $input: UpdateRoleInput!) {
    updateRole(id: $id, input: $input) {
      id
      name
      displayName
      description
      isActive
      isSystemRole
      priority
      metadata
      parentId
      createdAt
      updatedAt
      permissions {
        id
        effect
        permission {
          id
          name
          displayName
          resource
          action
          scope
        }
      }
      children {
        id
        name
        displayName
      }
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation DeleteRole($id: String!) {
    deleteRole(id: $id)
  }
`;

export const ASSIGN_ROLE_PERMISSIONS = gql`
  mutation AssignRolePermissions($input: AssignRolePermissionInput!) {
    assignRolePermissions(input: $input)
  }
`;

// User RBAC Queries and Mutations
export const GET_USER_ROLE_PERMISSIONS = gql`
  query GetUserRolePermissions($userId: String!) {
    getUserRolePermissions(userId: $userId) {
      userId
      directPermissions {
        id
        effect
        conditions
        metadata
        permission {
          id
          name
          displayName
          resource
          action
          scope
        }
      }
      roleAssignments {
        id
        effect
        conditions
        metadata
        role {
          id
          name
          displayName
          permissions {
            id
            effect
            permission {
              id
              name
              displayName
              resource
              action
              scope
              description
              isActive
            }
          }
        }
      }
      effectivePermissions {
        id
        name
        displayName
        resource
        action
        scope
        description
        isActive
      }
      summary {
        totalDirectPermissions
        totalRoleAssignments
        totalEffectivePermissions
        lastUpdated
      }
    }
  }
`;

export const ASSIGN_USER_ROLES = gql`
  mutation AssignUserRoles($input: AssignUserRoleInput!) {
    assignUserRoles(input: $input)
  }
`;

export const ASSIGN_USER_PERMISSIONS = gql`
  mutation AssignUserPermissions($input: AssignUserPermissionInput!) {
    assignUserPermissions(input: $input)
  }
`;

// Current User Permissions & Roles
export const GET_MY_PERMISSIONS = gql`
  query GetMyPermissions {
    myPermissions {
      id
      name
      displayName
      resource
      action
      scope
      category
      description
    }
  }
`;

export const GET_MY_ROLES = gql`
  query GetMyRoles {
    myRoles {
      id
      role {
        id
        name
        displayName
        description
      }
      assignedAt
      expiresAt
    }
  }
`;

export const REMOVE_USER_ROLE = gql`
  mutation RemoveUserRole($userId: ID!, $roleId: ID!) {
    removeUserRole(userId: $userId, roleId: $roleId) {
      success
      message
    }
  }
`;

export const CHECK_USER_PERMISSION = gql`
  query CheckUserPermission($userId: ID!, $resource: String!, $action: String!, $scope: String) {
    checkUserPermission(userId: $userId, resource: $resource, action: $action, scope: $scope) {
      hasPermission
    }
  }
`;