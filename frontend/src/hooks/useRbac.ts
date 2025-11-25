import { useMutation, useQuery } from '@apollo/client';
import { 
  SEARCH_PERMISSIONS,
  GET_PERMISSION_BY_ID,
  CREATE_PERMISSION,
  UPDATE_PERMISSION,
  DELETE_PERMISSION,
  SEARCH_ROLES,
  GET_ROLE_BY_ID,
  CREATE_ROLE,
  UPDATE_ROLE,
  DELETE_ROLE,
  ASSIGN_ROLE_PERMISSIONS,
  GET_USER_ROLE_PERMISSIONS,
  ASSIGN_USER_ROLES,
  ASSIGN_USER_PERMISSIONS
} from '../graphql/rbac.queries';
import { toast } from 'sonner';

// Permission hooks
export const useSearchPermissions = (input: any) => {
  return useQuery(SEARCH_PERMISSIONS, {
    variables: { input },
    errorPolicy: 'all',
    onError: (error) => {
      console.error('Error searching permissions:', error);
      toast.error('Failed to search permissions');
    },
  });
};

export const useGetPermissionById = (id: string) => {
  return useQuery(GET_PERMISSION_BY_ID, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
    onError: (error) => {
      console.error('Error getting permission:', error);
      toast.error('Failed to get permission');
    },
  });
};

export const useCreatePermission = () => {
  return useMutation(CREATE_PERMISSION, {
    onCompleted: () => {
      toast.success('Permission created successfully');
    },
    onError: (error) => {
      console.error('Error creating permission:', error);
      toast.error('Failed to create permission');
    },
    refetchQueries: ['SearchPermissions'],
  });
};

export const useUpdatePermission = () => {
  return useMutation(UPDATE_PERMISSION, {
    onCompleted: () => {
      toast.success('Permission updated successfully');
    },
    onError: (error) => {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    },
    refetchQueries: ['SearchPermissions', 'GetPermissionById'],
  });
};

export const useDeletePermission = () => {
  return useMutation(DELETE_PERMISSION, {
    onCompleted: () => {
      toast.success('Permission deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting permission:', error);
      toast.error('Failed to delete permission');
    },
    refetchQueries: ['SearchPermissions'],
  });
};

// Role hooks
export const useSearchRoles = (input: any) => {
  return useQuery(SEARCH_ROLES, {
    variables: { input },
    errorPolicy: 'all',
    onError: (error) => {
      console.error('Error searching roles:', error);
      toast.error('Failed to search roles');
    },
  });
};

export const useGetRoleById = (id: string) => {
  return useQuery(GET_ROLE_BY_ID, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
    onError: (error) => {
      console.error('Error getting role:', error);
      toast.error('Failed to get role');
    },
  });
};

export const useCreateRole = () => {
  return useMutation(CREATE_ROLE, {
    onCompleted: () => {
      toast.success('Role created successfully');
    },
    onError: (error) => {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    },
    refetchQueries: ['SearchRoles'],
  });
};

export const useUpdateRole = () => {
  return useMutation(UPDATE_ROLE, {
    onCompleted: () => {
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    },
    refetchQueries: ['SearchRoles', 'GetRoleById'],
  });
};

export const useDeleteRole = () => {
  return useMutation(DELETE_ROLE, {
    onCompleted: () => {
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    },
    refetchQueries: ['SearchRoles'],
  });
};

export const useAssignRolePermissions = () => {
  return useMutation(ASSIGN_ROLE_PERMISSIONS, {
    onCompleted: () => {
      toast.success('Role permissions updated successfully');
    },
    onError: (error) => {
      console.error('Error assigning role permissions:', error);
      toast.error('Failed to update role permissions');
    },
    refetchQueries: ['SearchRoles', 'GetRoleById'],
  });
};

// User RBAC hooks
export const useGetUserRolePermissions = (userId: string) => {
  return useQuery(GET_USER_ROLE_PERMISSIONS, {
    variables: { userId },
    skip: !userId,
    errorPolicy: 'all',
    onError: (error) => {
      console.error('Error getting user role permissions:', error);
      toast.error('Failed to get user permissions');
    },
  });
};

export const useAssignUserRoles = () => {
  return useMutation(ASSIGN_USER_ROLES, {
    onCompleted: () => {
      toast.success('User roles updated successfully');
    },
    onError: (error) => {
      console.error('Error assigning user roles:', error);
      toast.error('Failed to update user roles');
    },
    refetchQueries: ['GetUserRolePermissions', 'SearchUsers'],
  });
};

export const useAssignUserPermissions = () => {
  return useMutation(ASSIGN_USER_PERMISSIONS, {
    onCompleted: () => {
      toast.success('User permissions updated successfully');
    },
    onError: (error) => {
      console.error('Error assigning user permissions:', error);
      toast.error('Failed to update user permissions');
    },
    refetchQueries: ['GetUserRolePermissions', 'SearchUsers'],
  });
};