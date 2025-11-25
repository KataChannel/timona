import { InMemoryCache, FieldPolicy, FieldReadFunction } from '@apollo/client';

/**
 * Apollo Client Cache Configuration
 * Optimized for HR Management System
 * 
 * Features:
 * - Normalized cache for efficient data storage
 * - Field policies for list pagination
 * - Type policies for cache key generation
 * - Optimistic responses for better UX
 */

// Type Policies - Define how objects are cached
const typePolicies = {
  Query: {
    fields: {
      // Employee Profiles Pagination
      employeeProfiles: {
        keyArgs: ['search', 'department', 'position', 'isActive', 'contractType'],
        merge(existing: any, incoming: any, { args }: any) {
          if (!existing) return incoming;
          
          const skip = args?.skip || 0;
          
          if (skip === 0) {
            // Fresh query, replace existing
            return incoming;
          }
          
          // Append to existing (load more)
          return {
            ...incoming,
            employees: [...(existing.employees || []), ...(incoming.employees || [])],
          };
        },
        read(existing: any, { args }: any) {
          if (!existing) return undefined;
          
          const skip = args?.skip || 0;
          const take = args?.take || 20;
          
          const employees = existing.employees?.slice(skip, skip + take);
          
          return {
            ...existing,
            employees,
          };
        },
      },
      
      // Onboarding Checklists Pagination
      onboardingChecklists: {
        keyArgs: ['status', 'employeeProfileId'],
        merge(existing: any, incoming: any, { args }: any) {
          if (!existing) return incoming;
          
          const skip = args?.skip || 0;
          
          if (skip === 0) {
            return incoming;
          }
          
          return {
            ...incoming,
            checklists: [...(existing.checklists || []), ...(incoming.checklists || [])],
          };
        },
      },
      
      // Offboarding Processes Pagination
      offboardingProcesses: {
        keyArgs: ['status', 'employeeProfileId'],
        merge(existing: any, incoming: any, { args }: any) {
          if (!existing) return incoming;
          
          const skip = args?.skip || 0;
          
          if (skip === 0) {
            return incoming;
          }
          
          return {
            ...incoming,
            processes: [...(existing.processes || []), ...(incoming.processes || [])],
          };
        },
      },
      
      // Employee Documents Pagination
      employeeDocuments: {
        keyArgs: ['employeeProfileId', 'documentType'],
        merge(existing: any, incoming: any, { args }: any) {
          if (!existing) return incoming;
          
          const skip = args?.skip || 0;
          
          if (skip === 0) {
            return incoming;
          }
          
          return {
            ...incoming,
            documents: [...(existing.documents || []), ...(incoming.documents || [])],
          };
        },
      },
      
      // HR Statistics - Cache for 5 minutes
      hrStatistics: {
        read(existing: any) {
          return existing;
        },
      },
    },
  },
  
  EmployeeProfile: {
    keyFields: ['id'],
    fields: {
      // Denormalized user field
      user: {
        merge(existing: any, incoming: any) {
          return incoming || existing;
        },
      },
    },
  },
  
  OnboardingChecklist: {
    keyFields: ['id'],
    fields: {
      // Tasks are stored as JSON, no need to normalize
      tasks: {
        merge(existing: any, incoming: any) {
          return incoming || existing;
        },
      },
      // Computed field for progress
      progressPercentage: {
        read(existing: number, { readField }: any) {
          if (existing !== undefined) return existing;
          
          const tasks = readField('tasks');
          if (!tasks || !Array.isArray(tasks)) return 0;
          
          const completed = tasks.filter((t: any) => t.completed).length;
          return Math.round((completed / tasks.length) * 100);
        },
      },
    },
  },
  
  OffboardingProcess: {
    keyFields: ['id'],
    fields: {
      // JSON fields
      assetReturnList: {
        merge(existing: any, incoming: any) {
          return incoming || existing;
        },
      },
      knowledgeTransferPlan: {
        merge(existing: any, incoming: any) {
          return incoming || existing;
        },
      },
      accessRevocationList: {
        merge(existing: any, incoming: any) {
          return incoming || existing;
        },
      },
      approvalWorkflow: {
        merge(existing: any, incoming: any) {
          return incoming || existing;
        },
      },
      // Computed total settlement
      totalSettlement: {
        read(existing: number, { readField }: any) {
          if (existing !== undefined) return existing;
          
          const salary = readField('finalSalaryAmount') || 0;
          const leave = readField('leavePayout') || 0;
          const bonus = readField('bonusAmount') || 0;
          
          return salary + leave + bonus;
        },
      },
    },
  },
  
  EmployeeDocument: {
    keyFields: ['id'],
  },
  
  User: {
    keyFields: ['id'],
  },
};

/**
 * Create optimized Apollo InMemory Cache
 */
export function createCache() {
  return new InMemoryCache({
    typePolicies,
    
    // Cache data normalization
    dataIdFromObject(object: any) {
      switch (object.__typename) {
        case 'EmployeeProfile':
        case 'OnboardingChecklist':
        case 'OffboardingProcess':
        case 'EmployeeDocument':
        case 'User':
          return `${object.__typename}:${object.id}`;
        default:
          return undefined;
      }
    },
    
    // Add type name to all queries
    addTypename: true,
  });
}

/**
 * Optimistic Response Helpers
 * For better UX during mutations
 */

export const optimisticResponses = {
  // Update employee
  updateEmployeeProfile: (id: string, input: any) => ({
    __typename: 'Mutation',
    updateEmployeeProfile: {
      __typename: 'EmployeeProfile',
      id,
      ...input,
      updatedAt: new Date().toISOString(),
    },
  }),
  
  // Complete onboarding task
  completeOnboardingTask: (id: string, taskIndex: number, completed: boolean) => ({
    __typename: 'Mutation',
    completeOnboardingTask: {
      __typename: 'OnboardingChecklist',
      id,
      tasks: [], // Will be updated from server
      progressPercentage: 0, // Will be recalculated
      updatedAt: new Date().toISOString(),
    },
  }),
  
  // Update offboarding status
  updateOffboardingProcess: (id: string, input: any) => ({
    __typename: 'Mutation',
    updateOffboardingProcess: {
      __typename: 'OffboardingProcess',
      id,
      ...input,
      updatedAt: new Date().toISOString(),
    },
  }),
  
  // Verify document
  updateEmployeeDocument: (id: string, input: any) => ({
    __typename: 'Mutation',
    updateEmployeeDocument: {
      __typename: 'EmployeeDocument',
      id,
      ...input,
      updatedAt: new Date().toISOString(),
      ...(input.isVerified && {
        verifiedAt: new Date().toISOString(),
      }),
    },
  }),
};

/**
 * Cache eviction helpers
 * For manual cache management
 */

export const cacheEviction = {
  // Clear employee list cache
  clearEmployeeList: (cache: InMemoryCache) => {
    cache.evict({ fieldName: 'employeeProfiles' });
    cache.gc();
  },
  
  // Clear specific employee
  clearEmployee: (cache: InMemoryCache, id: string) => {
    cache.evict({ id: `EmployeeProfile:${id}` });
    cache.gc();
  },
  
  // Clear onboarding lists
  clearOnboardingLists: (cache: InMemoryCache) => {
    cache.evict({ fieldName: 'onboardingChecklists' });
    cache.gc();
  },
  
  // Clear offboarding lists
  clearOffboardingLists: (cache: InMemoryCache) => {
    cache.evict({ fieldName: 'offboardingProcesses' });
    cache.gc();
  },
  
  // Clear statistics
  clearStatistics: (cache: InMemoryCache) => {
    cache.evict({ fieldName: 'hrStatistics' });
    cache.gc();
  },
  
  // Clear all HR data
  clearAllHRData: (cache: InMemoryCache) => {
    cache.evict({ fieldName: 'employeeProfiles' });
    cache.evict({ fieldName: 'onboardingChecklists' });
    cache.evict({ fieldName: 'offboardingProcesses' });
    cache.evict({ fieldName: 'employeeDocuments' });
    cache.evict({ fieldName: 'hrStatistics' });
    cache.gc();
  },
};

/**
 * Cache persistence configuration
 * For offline support
 */

export const cachePersistConfig = {
  key: 'apollo-cache-hr',
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  maxSize: 1048576 * 5, // 5MB
  debug: process.env.NODE_ENV === 'development',
};
