/**
 * ============================================================================
 * PROJECT MANAGEMENT HOOKS - DYNAMIC GRAPHQL VERSION
 * ============================================================================
 * 
 * Migrated from Apollo Client to Dynamic GraphQL
 * Uses universal hooks for better performance and type safety
 * 
 * @author Senior Full-Stack Engineer
 * @version 2.0.0 - Dynamic GraphQL Migration
 */

import { useMemo } from 'react';
import { gql, useMutation } from '@apollo/client';
import {
  useFindMany,
  useFindUnique,
  useCreateOne,
  useUpdateOne,
  useDeleteOne,
} from './useDynamicGraphQL';

// ==================== TYPE DEFINITIONS ====================

export interface Project {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
  members?: ProjectMember[];
  tasks?: Task[];
  chatMessages?: any[];
  _count?: {
    tasks: number;
    chatMessages: number;
    members: number;
  };
}

export interface ProjectMember {
  id: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'WORK' | 'PERSONAL' | 'SHOPPING' | 'HEALTH' | 'OTHER';
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string[];
  mentions?: string[];
  tags?: string[];
  projectId?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  avatar?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  avatar?: string;
  isArchived?: boolean;
}

export interface AddMemberInput {
  userId: string;
  role: 'admin' | 'member';
}

export interface UpdateMemberRoleInput {
  memberId: string;
  role: 'admin' | 'member';
}

// ==================== QUERY HOOKS ====================

/**
 * Hook: Get all user's projects (for Sidebar)
 * Only returns projects where user is owner OR member
 * 
 * @example
 * const { data: projects, loading, refetch } = useMyProjects(false);
 */
export const useMyProjects = (includeArchived = false) => {
  // Get current user ID from localStorage
  const userId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user.id;
    } catch {
      return null;
    }
  }, []);

  const where = useMemo(() => {
    const conditions: any = {
      isArchived: includeArchived ? undefined : { equals: false },
    };

    // Only show projects where user is owner OR member
    if (userId) {
      conditions.OR = [
        { ownerId: { equals: userId } },
        { members: { some: { userId: { equals: userId } } } }
      ];
    }

    return conditions;
  }, [includeArchived, userId]);

  const { data, loading, error, refetch } = useFindMany<Project>('project', {
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
          chatMessages: true,
          members: true,
        },
      },
    },
  }, {
    skip: !userId, // Don't query if no userId
  });

  // Debug: Log query results
  console.log('[useMyProjects] Debug:', {
    userId,
    where,
    projectCount: data?.length || 0,
    projects: data?.map(p => ({
      id: p.id,
      name: p.name,
      ownerId: p.ownerId,
      memberCount: p.members?.length || 0,
      members: p.members?.map(m => ({ userId: m.user.id, role: m.role }))
    }))
  });

  return {
    data: { myProjects: data || [] },
    loading,
    error,
    refetch,
  };
};

/**
 * Hook: Get project details
 * 
 * @example
 * const { data: project, loading } = useProject(projectId);
 */
export const useProject = (projectId: string | null) => {
  const { data, loading, error, refetch } = useFindUnique<Project>(
    'project',
    projectId || '',
    {
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            chatMessages: true,
          },
        },
      },
    },
    { skip: !projectId }
  );

  return {
    data: data ? { project: data } : undefined,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook: Get project members (for @mention, member management)
 * 
 * @example
 * const { data: members, loading } = useProjectMembers(projectId);
 */
export const useProjectMembers = (projectId: string | null) => {
  const { data, loading, error, refetch } = useFindMany<ProjectMember>('projectMember', {
    where: {
      projectId: { equals: projectId },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  }, {
    skip: !projectId,
  });

  return {
    data: { projectMembers: data || [] },
    loading,
    error,
    refetch,
  };
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook: Create new project
 * IMPORTANT: Uses custom mutation (not Dynamic GraphQL) because backend
 * has special logic to auto-add owner to members
 * 
 * @example
 * const [createProject, { loading }] = useCreateProject();
 * await createProject({ 
 *   variables: { 
 *     input: { name: "New Project", description: "..." } 
 *   } 
 * });
 */
export const useCreateProject = () => {
  const [mutate, { data, loading, error }] = useMutation(
    gql`
      mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) {
          id
          name
          description
          avatar
          isArchived
          createdAt
          updatedAt
          ownerId
          owner {
            id
            firstName
            lastName
            email
            avatar
          }
          members {
            id
            userId
            projectId
            role
            joinedAt
            user {
              id
              firstName
              lastName
              email
              avatar
            }
          }
          _count {
            tasks
            chatMessages
            members
          }
        }
      }
    `,
    {
      refetchQueries: ['FindManyProject'],
      awaitRefetchQueries: true,
    }
  );

  const createProject = async (options: { variables: { input: CreateProjectInput } }) => {
    const result = await mutate(options);
    return result;
  };

  return [createProject, { loading, error }] as const;
};

/**
 * Hook: Create new project (OLD - Dynamic GraphQL version)
 * DO NOT USE - Does not add owner to members!
 * Use useCreateProject() instead
 * 
 * @deprecated Use useCreateProject() which calls custom mutation
 */
export const useCreateProjectDynamic = () => {
  const [createOne, { data, loading, error }] = useCreateOne<Project>('project', {
    refetchQueries: ['FindManyProject'], // Auto refetch project list after create
  });

  const createProject = async (options: { variables: { input: CreateProjectInput } }) => {
    const result = await createOne({
      data: options.variables.input,
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            chatMessages: true,
          },
        },
      },
    });

    return { data: { createProject: result } };
  };

  return [createProject, { loading, error }] as const;
};

/**
 * Hook: Update existing project
 * 
 * @example
 * const [updateProject] = useUpdateProject();
 * await updateProject({ 
 *   variables: { 
 *     id: "uuid", 
 *     input: { name: "Updated Name" } 
 *   } 
 * });
 */
export const useUpdateProject = () => {
  const [updateOne, { data, loading, error }] = useUpdateOne<Project>('project', {
    refetchQueries: ['FindManyProject'], // Auto refetch project list after update
  });

  const updateProject = async (options: { 
    variables: { 
      id: string; 
      input: UpdateProjectInput 
    } 
  }) => {
    const result = await updateOne({
      where: options.variables.id,
      data: options.variables.input,
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        isArchived: true,
        updatedAt: true,
      },
    });

    return { data: { updateProject: result } };
  };

  return [updateProject, { loading, error }] as const;
};

/**
 * Hook: Delete/Archive project (soft delete)
 * 
 * @example
 * const [deleteProject, { loading }] = useDeleteProject();
 * await deleteProject({ variables: { id: "uuid" } });
 */
export const useDeleteProject = () => {
  const [deleteOne, { data, loading, error }] = useDeleteOne<Project>('project', {
    refetchQueries: ['FindManyProject'], // Auto refetch project list after delete
  });

  const deleteProject = async (options: { variables: { id: string } }) => {
    const result = await deleteOne({
      where: options.variables.id,
      select: {
        id: true,
        name: true,
        isArchived: true,
      },
    });

    return { data: { deleteProject: result } };
  };

  return [deleteProject, { loading, error }] as const;
};

/**
 * Hook: Permanently delete project (hard delete)
 * CẢNH BÁO: Xóa vĩnh viễn, không thể khôi phục!
 * 
 * @example
 * const [permanentlyDelete, { loading }] = usePermanentlyDeleteProject();
 * await permanentlyDelete({ variables: { id: "uuid" } });
 */
export const usePermanentlyDeleteProject = () => {
  const [mutate, { loading, error }] = useMutation(
    gql`
      mutation PermanentlyDeleteProject($id: ID!) {
        permanentlyDeleteProject(id: $id)
      }
    `,
    {
      refetchQueries: ['FindManyProject'],
      awaitRefetchQueries: true,
    }
  );

  const permanentlyDeleteProject = async (options: { variables: { id: string } }) => {
    const result = await mutate(options);
    return result;
  };

  return [permanentlyDeleteProject, { loading, error }] as const;
};

/**
 * Hook: Restore archived project
 * 
 * @example
 * const [restoreProject, { loading }] = useRestoreProject();
 * await restoreProject({ variables: { id: "uuid" } });
 */
export const useRestoreProject = () => {
  const [updateOne, { data, loading, error }] = useUpdateOne<Project>('project', {
    refetchQueries: ['FindManyProject'],
  });

  const restoreProject = async (options: { variables: { id: string } }) => {
    const result = await updateOne({
      where: options.variables.id,
      data: {
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        isArchived: true,
      },
    });

    return { data: { restoreProject: result } };
  };

  return [restoreProject, { loading, error }] as const;
};

/**
 * Hook: Add member to project
 * Note: This requires custom backend mutation, not covered by Dynamic GraphQL CRUD
 * We'll keep using the custom GraphQL mutation for this
 */
export const useAddMember = () => {
  // This will be implemented with custom mutation
  // For now, return placeholder
  const addMember = async () => {
    throw new Error('useAddMember: Not implemented yet - requires custom mutation');
  };

  return [addMember, { loading: false, error: null }] as const;
};

/**
 * Hook: Remove member from project
 * Note: This requires custom backend mutation
 */
export const useRemoveMember = () => {
  const removeMember = async () => {
    throw new Error('useRemoveMember: Not implemented yet - requires custom mutation');
  };

  return [removeMember, { loading: false, error: null }] as const;
};

/**
 * Hook: Update member role
 * Note: This requires custom backend mutation
 */
export const useUpdateMemberRole = () => {
  const updateRole = async () => {
    throw new Error('useUpdateMemberRole: Not implemented yet - requires custom mutation');
  };

  return [updateRole, { loading: false, error: null }] as const;
};

// ==================== EXPORT ALL ====================

export default {
  // Queries
  useMyProjects,
  useProject,
  useProjectMembers,
  // Mutations
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  usePermanentlyDeleteProject,
  useRestoreProject,
  useAddMember,
  useRemoveMember,
  useUpdateMemberRole,
};
