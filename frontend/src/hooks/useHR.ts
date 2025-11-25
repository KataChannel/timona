import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { useCallback } from 'react';
import {
  GET_EMPLOYEE_PROFILE,
  GET_EMPLOYEE_PROFILE_BY_USER_ID,
  LIST_EMPLOYEE_PROFILES,
  CREATE_EMPLOYEE_PROFILE,
  UPDATE_EMPLOYEE_PROFILE,
  DELETE_EMPLOYEE_PROFILE,
  GET_EMPLOYMENT_HISTORY,
  GET_ONBOARDING_CHECKLIST,
  GET_ONBOARDING_CHECKLIST_BY_EMPLOYEE,
  LIST_ONBOARDING_CHECKLISTS,
  CREATE_ONBOARDING_CHECKLIST,
  UPDATE_ONBOARDING_CHECKLIST,
  COMPLETE_ONBOARDING_TASK,
  GET_OFFBOARDING_PROCESS,
  LIST_OFFBOARDING_PROCESSES,
  CREATE_OFFBOARDING_PROCESS,
  UPDATE_OFFBOARDING_PROCESS,
  COMPLETE_OFFBOARDING,
  GET_HR_STATISTICS,
  GET_EMPLOYEE_DOCUMENT,
  LIST_EMPLOYEE_DOCUMENTS,
  CREATE_EMPLOYEE_DOCUMENT,
  UPDATE_EMPLOYEE_DOCUMENT,
  DELETE_EMPLOYEE_DOCUMENT,
} from '../graphql/hr/queries';
import {
  EmployeeProfile,
  EmployeeListResponse,
  CreateEmployeeProfileInput,
  UpdateEmployeeProfileInput,
  EmploymentHistory,
  OnboardingChecklist,
  OnboardingListResponse,
  CreateOnboardingChecklistInput,
  UpdateOnboardingChecklistInput,
  OffboardingProcess,
  OffboardingListResponse,
  CreateOffboardingProcessInput,
  UpdateOffboardingProcessInput,
  OnboardingStatus,
  OffboardingStatus,
  ClearanceStatus,
  HRStatistics,
  EmployeeDocument,
  EmployeeDocumentListResponse,
  CreateEmployeeDocumentInput,
  UpdateEmployeeDocumentInput,
  DocumentType,
} from '../types/hr';

// ============================================
// EMPLOYEE PROFILE HOOKS
// ============================================

export const useEmployeeProfile = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{ employeeProfile: EmployeeProfile }>(
    GET_EMPLOYEE_PROFILE,
    {
      variables: { id },
      skip: !id,
    }
  );

  return {
    employeeProfile: data?.employeeProfile,
    loading,
    error,
    refetch,
  };
};

export const useEmployeeProfileByUserId = (userId: string) => {
  const { data, loading, error, refetch } = useQuery<{ employeeProfileByUserId: EmployeeProfile }>(
    GET_EMPLOYEE_PROFILE_BY_USER_ID,
    {
      variables: { userId },
      skip: !userId,
    }
  );

  return {
    employeeProfile: data?.employeeProfileByUserId,
    loading,
    error,
    refetch,
  };
};

export const useEmployeeProfiles = (filters?: {
  department?: string;
  position?: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
}) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<{
    listEmployeeProfiles: EmployeeListResponse;
  }>(LIST_EMPLOYEE_PROFILES, {
    variables: filters,
  });

  const loadMore = useCallback(() => {
    if (data?.listEmployeeProfiles.hasMore) {
      fetchMore({
        variables: {
          ...filters,
          skip: data.listEmployeeProfiles.employees.length,
        },
      });
    }
  }, [data, fetchMore, filters]);

  return {
    employees: data?.listEmployeeProfiles.employees || [],
    total: data?.listEmployeeProfiles.total || 0,
    hasMore: data?.listEmployeeProfiles.hasMore || false,
    loading,
    error,
    refetch,
    loadMore,
  };
};

export const useCreateEmployeeProfile = () => {
  const [createEmployee, { data, loading, error }] = useMutation<
    { createEmployeeProfile: EmployeeProfile },
    { input: CreateEmployeeProfileInput }
  >(CREATE_EMPLOYEE_PROFILE, {
    refetchQueries: [LIST_EMPLOYEE_PROFILES, GET_HR_STATISTICS],
  });

  const createEmployeeProfile = useCallback(
    async (input: CreateEmployeeProfileInput) => {
      try {
        const result = await createEmployee({ variables: { input } });
        return result.data?.createEmployeeProfile;
      } catch (err) {
        throw err;
      }
    },
    [createEmployee]
  );

  return {
    createEmployeeProfile,
    loading,
    error,
    data: data?.createEmployeeProfile,
  };
};

export const useUpdateEmployeeProfile = () => {
  const [updateEmployee, { data, loading, error }] = useMutation<
    { updateEmployeeProfile: EmployeeProfile },
    { id: string; input: UpdateEmployeeProfileInput }
  >(UPDATE_EMPLOYEE_PROFILE);

  const updateEmployeeProfile = useCallback(
    async (id: string, input: UpdateEmployeeProfileInput) => {
      try {
        const result = await updateEmployee({ variables: { id, input } });
        return result.data?.updateEmployeeProfile;
      } catch (err) {
        throw err;
      }
    },
    [updateEmployee]
  );

  return {
    updateEmployeeProfile,
    loading,
    error,
    data: data?.updateEmployeeProfile,
  };
};

export const useDeleteEmployeeProfile = () => {
  const [deleteEmployee, { loading, error }] = useMutation<
    { deleteEmployeeProfile: { success: boolean; message: string } },
    { id: string }
  >(DELETE_EMPLOYEE_PROFILE, {
    refetchQueries: [LIST_EMPLOYEE_PROFILES, GET_HR_STATISTICS],
  });

  const deleteEmployeeProfile = useCallback(
    async (id: string) => {
      try {
        const result = await deleteEmployee({ variables: { id } });
        return result.data?.deleteEmployeeProfile;
      } catch (err) {
        throw err;
      }
    },
    [deleteEmployee]
  );

  return {
    deleteEmployeeProfile,
    loading,
    error,
  };
};

// ============================================
// EMPLOYMENT HISTORY HOOKS
// ============================================

export const useEmploymentHistory = (employeeProfileId: string) => {
  const { data, loading, error, refetch } = useQuery<{
    employmentHistory: EmploymentHistory[];
  }>(GET_EMPLOYMENT_HISTORY, {
    variables: { employeeProfileId },
    skip: !employeeProfileId,
  });

  return {
    employmentHistory: data?.employmentHistory || [],
    loading,
    error,
    refetch,
  };
};

// ============================================
// ONBOARDING HOOKS
// ============================================

export const useOnboardingChecklist = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{ onboardingChecklist: OnboardingChecklist }>(
    GET_ONBOARDING_CHECKLIST,
    {
      variables: { id },
      skip: !id,
    }
  );

  return {
    onboardingChecklist: data?.onboardingChecklist,
    loading,
    error,
    refetch,
  };
};

export const useOnboardingChecklistByEmployee = (employeeProfileId: string) => {
  const { data, loading, error, refetch } = useQuery<{
    onboardingChecklistByEmployee: OnboardingChecklist;
  }>(GET_ONBOARDING_CHECKLIST_BY_EMPLOYEE, {
    variables: { employeeProfileId },
    skip: !employeeProfileId,
  });

  return {
    onboardingChecklist: data?.onboardingChecklistByEmployee,
    loading,
    error,
    refetch,
  };
};

export const useOnboardingChecklists = (filters?: {
  status?: OnboardingStatus;
  skip?: number;
  take?: number;
}) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<{
    listOnboardingChecklists: OnboardingListResponse;
  }>(LIST_ONBOARDING_CHECKLISTS, {
    variables: filters,
  });

  const loadMore = useCallback(() => {
    if (data?.listOnboardingChecklists.hasMore) {
      fetchMore({
        variables: {
          ...filters,
          skip: data.listOnboardingChecklists.checklists.length,
        },
      });
    }
  }, [data, fetchMore, filters]);

  return {
    checklists: data?.listOnboardingChecklists.checklists || [],
    total: data?.listOnboardingChecklists.total || 0,
    hasMore: data?.listOnboardingChecklists.hasMore || false,
    loading,
    error,
    refetch,
    loadMore,
  };
};

export const useCreateOnboardingChecklist = () => {
  const [createChecklist, { data, loading, error }] = useMutation<
    { createOnboardingChecklist: OnboardingChecklist },
    { input: CreateOnboardingChecklistInput }
  >(CREATE_ONBOARDING_CHECKLIST, {
    refetchQueries: [LIST_ONBOARDING_CHECKLISTS, GET_HR_STATISTICS],
  });

  const createOnboardingChecklist = useCallback(
    async (input: CreateOnboardingChecklistInput) => {
      try {
        const result = await createChecklist({ variables: { input } });
        return result.data?.createOnboardingChecklist;
      } catch (err) {
        throw err;
      }
    },
    [createChecklist]
  );

  return {
    createOnboardingChecklist,
    loading,
    error,
    data: data?.createOnboardingChecklist,
  };
};

export const useUpdateOnboardingChecklist = () => {
  const [updateChecklist, { data, loading, error }] = useMutation<
    { updateOnboardingChecklist: OnboardingChecklist },
    { id: string; input: UpdateOnboardingChecklistInput }
  >(UPDATE_ONBOARDING_CHECKLIST);

  const updateOnboardingChecklist = useCallback(
    async (id: string, input: UpdateOnboardingChecklistInput) => {
      try {
        const result = await updateChecklist({ variables: { id, input } });
        return result.data?.updateOnboardingChecklist;
      } catch (err) {
        throw err;
      }
    },
    [updateChecklist]
  );

  return {
    updateOnboardingChecklist,
    loading,
    error,
    data: data?.updateOnboardingChecklist,
  };
};

export const useCompleteOnboardingTask = () => {
  const [completeTask, { loading, error }] = useMutation<
    { completeOnboardingTask: OnboardingChecklist },
    { checklistId: string; taskId: string }
  >(COMPLETE_ONBOARDING_TASK);

  const completeOnboardingTask = useCallback(
    async (checklistId: string, taskId: string) => {
      try {
        const result = await completeTask({ variables: { checklistId, taskId } });
        return result.data?.completeOnboardingTask;
      } catch (err) {
        throw err;
      }
    },
    [completeTask]
  );

  return {
    completeOnboardingTask,
    loading,
    error,
  };
};

// ============================================
// OFFBOARDING HOOKS
// ============================================

export const useOffboardingProcess = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{ offboardingProcess: OffboardingProcess }>(
    GET_OFFBOARDING_PROCESS,
    {
      variables: { id },
      skip: !id,
    }
  );

  return {
    offboardingProcess: data?.offboardingProcess,
    loading,
    error,
    refetch,
  };
};

export const useOffboardingProcesses = (filters?: {
  status?: OffboardingStatus;
  clearanceStatus?: ClearanceStatus;
  skip?: number;
  take?: number;
}) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<{
    listOffboardingProcesses: OffboardingListResponse;
  }>(LIST_OFFBOARDING_PROCESSES, {
    variables: filters,
  });

  const loadMore = useCallback(() => {
    if (data?.listOffboardingProcesses.hasMore) {
      fetchMore({
        variables: {
          ...filters,
          skip: data.listOffboardingProcesses.processes.length,
        },
      });
    }
  }, [data, fetchMore, filters]);

  return {
    processes: data?.listOffboardingProcesses.processes || [],
    total: data?.listOffboardingProcesses.total || 0,
    hasMore: data?.listOffboardingProcesses.hasMore || false,
    loading,
    error,
    refetch,
    loadMore,
  };
};

export const useCreateOffboardingProcess = () => {
  const [createProcess, { data, loading, error }] = useMutation<
    { createOffboardingProcess: OffboardingProcess },
    { input: CreateOffboardingProcessInput }
  >(CREATE_OFFBOARDING_PROCESS, {
    refetchQueries: [LIST_OFFBOARDING_PROCESSES, GET_HR_STATISTICS],
  });

  const createOffboardingProcess = useCallback(
    async (input: CreateOffboardingProcessInput) => {
      try {
        const result = await createProcess({ variables: { input } });
        return result.data?.createOffboardingProcess;
      } catch (err) {
        throw err;
      }
    },
    [createProcess]
  );

  return {
    createOffboardingProcess,
    loading,
    error,
    data: data?.createOffboardingProcess,
  };
};

export const useUpdateOffboardingProcess = () => {
  const [updateProcess, { data, loading, error }] = useMutation<
    { updateOffboardingProcess: OffboardingProcess },
    { id: string; input: UpdateOffboardingProcessInput }
  >(UPDATE_OFFBOARDING_PROCESS);

  const updateOffboardingProcess = useCallback(
    async (id: string, input: UpdateOffboardingProcessInput) => {
      try {
        const result = await updateProcess({ variables: { id, input } });
        return result.data?.updateOffboardingProcess;
      } catch (err) {
        throw err;
      }
    },
    [updateProcess]
  );

  return {
    updateOffboardingProcess,
    loading,
    error,
    data: data?.updateOffboardingProcess,
  };
};

export const useCompleteOffboarding = () => {
  const [complete, { loading, error }] = useMutation<
    { completeOffboarding: OffboardingProcess },
    { id: string }
  >(COMPLETE_OFFBOARDING, {
    refetchQueries: [LIST_OFFBOARDING_PROCESSES, GET_HR_STATISTICS],
  });

  const completeOffboarding = useCallback(
    async (id: string) => {
      try {
        const result = await complete({ variables: { id } });
        return result.data?.completeOffboarding;
      } catch (err) {
        throw err;
      }
    },
    [complete]
  );

  return {
    completeOffboarding,
    loading,
    error,
  };
};

// ============================================
// HR STATISTICS HOOKS
// ============================================

export const useHRStatistics = () => {
  const { data, loading, error, refetch } = useQuery<{ hrStatistics: HRStatistics }>(
    GET_HR_STATISTICS
  );

  return {
    statistics: data?.hrStatistics,
    loading,
    error,
    refetch,
  };
};

// ============================================
// EMPLOYEE DOCUMENT HOOKS
// ============================================

export const useEmployeeDocument = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{ employeeDocument: EmployeeDocument }>(
    GET_EMPLOYEE_DOCUMENT,
    { variables: { id }, skip: !id }
  );

  return {
    document: data?.employeeDocument,
    loading,
    error,
    refetch,
  };
};

export const useEmployeeDocuments = (employeeProfileId: string, options?: { documentType?: DocumentType; skip?: number; take?: number }) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<{ employeeDocuments: EmployeeDocumentListResponse }>(
    LIST_EMPLOYEE_DOCUMENTS,
    {
      variables: {
        employeeProfileId,
        documentType: options?.documentType,
        skip: options?.skip || 0,
        take: options?.take || 50,
      },
      skip: !employeeProfileId,
    }
  );

  const loadMore = useCallback(async () => {
    if (data?.employeeDocuments.hasMore) {
      await fetchMore({
        variables: {
          skip: data.employeeDocuments.documents.length,
        },
      });
    }
  }, [fetchMore, data]);

  return {
    documents: data?.employeeDocuments.documents || [],
    total: data?.employeeDocuments.total || 0,
    hasMore: data?.employeeDocuments.hasMore || false,
    loading,
    error,
    refetch,
    loadMore,
  };
};

export const useCreateEmployeeDocument = () => {
  const [create, { loading, error }] = useMutation<
    { createEmployeeDocument: EmployeeDocument },
    { input: CreateEmployeeDocumentInput }
  >(CREATE_EMPLOYEE_DOCUMENT, {
    refetchQueries: [LIST_EMPLOYEE_DOCUMENTS],
  });

  const createDocument = useCallback(
    async (input: CreateEmployeeDocumentInput) => {
      try {
        const result = await create({ variables: { input } });
        return result.data?.createEmployeeDocument;
      } catch (err) {
        throw err;
      }
    },
    [create]
  );

  return {
    createDocument,
    loading,
    error,
  };
};

export const useUpdateEmployeeDocument = () => {
  const [update, { loading, error }] = useMutation<
    { updateEmployeeDocument: EmployeeDocument },
    { id: string; input: UpdateEmployeeDocumentInput }
  >(UPDATE_EMPLOYEE_DOCUMENT, {
    refetchQueries: [LIST_EMPLOYEE_DOCUMENTS, GET_EMPLOYEE_DOCUMENT],
  });

  const updateDocument = useCallback(
    async (id: string, input: UpdateEmployeeDocumentInput) => {
      try {
        const result = await update({ variables: { id, input } });
        return result.data?.updateEmployeeDocument;
      } catch (err) {
        throw err;
      }
    },
    [update]
  );

  return {
    updateDocument,
    loading,
    error,
  };
};

export const useDeleteEmployeeDocument = () => {
  const [deleteDoc, { loading, error }] = useMutation<
    { deleteEmployeeDocument: boolean },
    { id: string }
  >(DELETE_EMPLOYEE_DOCUMENT, {
    refetchQueries: [LIST_EMPLOYEE_DOCUMENTS],
  });

  const deleteDocument = useCallback(
    async (id: string) => {
      try {
        const result = await deleteDoc({ variables: { id } });
        return result.data?.deleteEmployeeDocument;
      } catch (err) {
        throw err;
      }
    },
    [deleteDoc]
  );

  return {
    deleteDocument,
    loading,
    error,
  };
};
