import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_MY_PROJECTS, GET_PROJECT, GET_PROJECT_MEMBERS } from '@/graphql/project/queries';
import {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  ADD_PROJECT_MEMBER,
  REMOVE_PROJECT_MEMBER,
  UPDATE_MEMBER_ROLE,
} from '@/graphql/project/mutations';

// ==================== QUERY HOOKS ====================

/**
 * Hook: Lấy danh sách projects (Sidebar)
 */
export const useMyProjects = (includeArchived = false) => {
  return useQuery(GET_MY_PROJECTS, {
    variables: { includeArchived },
    fetchPolicy: 'cache-and-network',
  });
};

/**
 * Hook: Lấy chi tiết project
 */
export const useProject = (projectId: string | null) => {
  return useQuery(GET_PROJECT, {
    variables: { id: projectId },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  });
};

/**
 * Hook: Lấy members cho @mention
 */
export const useProjectMembers = (projectId: string | null) => {
  return useQuery(GET_PROJECT_MEMBERS, {
    variables: { projectId },
    skip: !projectId,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook: Tạo project mới
 */
export const useCreateProject = () => {
  const client = useApolloClient();

  return useMutation(CREATE_PROJECT, {
    update(cache, { data }) {
      // Update cache với project mới
      const existing: any = cache.readQuery({
        query: GET_MY_PROJECTS,
        variables: { includeArchived: false },
      });

      if (existing?.myProjects) {
        cache.writeQuery({
          query: GET_MY_PROJECTS,
          variables: { includeArchived: false },
          data: {
            myProjects: [data.createProject, ...existing.myProjects],
          },
        });
      }
    },
    onCompleted: () => {
      client.refetchQueries({ include: [GET_MY_PROJECTS] });
    },
  });
};

/**
 * Hook: Update project
 */
export const useUpdateProject = () => {
  return useMutation(UPDATE_PROJECT, {
    refetchQueries: [GET_MY_PROJECTS],
  });
};

/**
 * Hook: Delete/Archive project
 */
export const useDeleteProject = () => {
  const client = useApolloClient();

  return useMutation(DELETE_PROJECT, {
    update(cache, { data }) {
      // Remove from cache
      const existing: any = cache.readQuery({
        query: GET_MY_PROJECTS,
        variables: { includeArchived: false },
      });

      if (existing?.myProjects) {
        cache.writeQuery({
          query: GET_MY_PROJECTS,
          variables: { includeArchived: false },
          data: {
            myProjects: existing.myProjects.filter(
              (p: any) => p.id !== data.deleteProject.id
            ),
          },
        });
      }
    },
    onCompleted: () => {
      client.refetchQueries({ include: [GET_MY_PROJECTS] });
    },
  });
};

/**
 * Hook: Thêm member
 */
export const useAddMember = () => {
  return useMutation(ADD_PROJECT_MEMBER, {
    refetchQueries: [GET_PROJECT, GET_PROJECT_MEMBERS],
  });
};

/**
 * Hook: Xóa member
 */
export const useRemoveMember = () => {
  return useMutation(REMOVE_PROJECT_MEMBER, {
    refetchQueries: [GET_PROJECT, GET_PROJECT_MEMBERS],
  });
};

/**
 * Hook: Update role
 */
export const useUpdateMemberRole = () => {
  return useMutation(UPDATE_MEMBER_ROLE, {
    refetchQueries: [GET_PROJECT, GET_PROJECT_MEMBERS],
  });
};
