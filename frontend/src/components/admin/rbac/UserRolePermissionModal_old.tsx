import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import { 
  useGetUserRolePermissions, 
  useAssignUserRoles, 
  useAssignUserPermissions,
  useSearchRoles,
  useSearchPermissions
} from '../../../hooks/useRbac';
import { 
  AssignUserRoleInput, 
  AssignUserPermissionInput,
  Role,
  Permission
} from '../../../types/rbac.types';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface UserRolePermissionModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
}

const UserRolePermissionModal: React.FC<UserRolePermissionModalProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [roleAssignments, setRoleAssignments] = useState<Array<{
    roleId: string;
    effect: 'allow' | 'deny' | null;
  }>>([]);
  const [permissionAssignments, setPermissionAssignments] = useState<Array<{
    permissionId: string;
    effect: 'allow' | 'deny' | null;
  }>>([]);

  const { data: userRolePermissions, loading: userLoading, refetch: refetchUser } = useGetUserRolePermissions(user?.id);
  const { data: rolesData } = useSearchRoles({ page: 0, size: 100, isActive: true });
  const { data: permissionsData } = useSearchPermissions({ page: 0, size: 1000, isActive: true });
  
  const [assignUserRoles, { loading: assigningRoles }] = useAssignUserRoles();
  const [assignUserPermissions, { loading: assigningPermissions }] = useAssignUserPermissions();

  const roles = rolesData?.searchRoles?.roles || [];
  const permissions = permissionsData?.searchPermissions?.permissions || [];

  useEffect(() => {
    if (userRolePermissions && roles.length > 0) {
      const currentRoles = userRolePermissions.getUserRolePermissions?.roleAssignments || [];
      const newRoleAssignments = roles.map((role: Role) => {
        const existing = currentRoles.find((ra: any) => ra.role.id === role.id);
        return {
          roleId: role.id,
          effect: existing ? existing.effect : null,
        };
      });
      setRoleAssignments(newRoleAssignments);
    }
  }, [userRolePermissions, roles]);

  useEffect(() => {
    if (userRolePermissions && permissions.length > 0) {
      const currentPermissions = userRolePermissions.getUserRolePermissions?.directPermissions || [];
      const newPermissionAssignments = permissions.map((permission: Permission) => {
        const existing = currentPermissions.find((dp: any) => dp.permission.id === permission.id);
        return {
          permissionId: permission.id,
          effect: existing ? existing.effect : null,
        };
      });
      setPermissionAssignments(newPermissionAssignments);
    }
  }, [userRolePermissions, permissions]);

  const handleRoleChange = (roleId: string, effect: 'allow' | 'deny' | null) => {
    setRoleAssignments(prev => 
      prev.map(ra => 
        ra.roleId === roleId 
          ? { ...ra, effect }
          : ra
      )
    );
  };

  const handlePermissionChange = (permissionId: string, effect: 'allow' | 'deny' | null) => {
    setPermissionAssignments(prev => 
      prev.map(pa => 
        pa.permissionId === permissionId 
          ? { ...pa, effect }
          : pa
      )
    );
  };

  const handleSaveRoles = async () => {
    const activeAssignments = roleAssignments
      .filter(ra => ra.effect !== null)
      .map(ra => ({
        roleId: ra.roleId,
        effect: ra.effect!,
      }));

    const input: AssignUserRoleInput = {
      userId: user.id,
      assignments: activeAssignments,
    };

    try {
      await assignUserRoles({ variables: { input } });
      refetchUser();
    } catch (error) {
      console.error('Failed to assign user roles:', error);
    }
  };

  const handleSavePermissions = async () => {
    const activeAssignments = permissionAssignments
      .filter(pa => pa.effect !== null)
      .map(pa => ({
        permissionId: pa.permissionId,
        effect: pa.effect!,
      }));

    const input: AssignUserPermissionInput = {
      userId: user.id,
      assignments: activeAssignments,
    };

    try {
      await assignUserPermissions({ variables: { input } });
      refetchUser();
    } catch (error) {
      console.error('Failed to assign user permissions:', error);
    }
  };

  if (!isOpen) return null;

  const summary = userRolePermissions?.getUserRolePermissions?.summary;
  const effectivePermissions = userRolePermissions?.getUserRolePermissions?.effectivePermissions || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  {user.avatar ? (
                    <img
                      className="h-12 w-12 rounded-full"
                      src={user.avatar}
                      alt={user.displayName || user.username}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.displayName || user.username}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-semibold text-blue-600">
                  {summary?.totalRoleAssignments || 0}
                </div>
                <div className="text-sm text-gray-600">Roles</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-semibold text-green-600">
                  {summary?.totalDirectPermissions || 0}
                </div>
                <div className="text-sm text-gray-600">Direct Permissions</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-semibold text-purple-600">
                  {summary?.totalEffectivePermissions || 0}
                </div>
                <div className="text-sm text-gray-600">Total Permissions</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Last Updated</div>
                <div className="text-sm font-medium">
                  {summary?.lastUpdated ? new Date(summary.lastUpdated).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-500'
                    )
                  }
                >
                  Role Assignments
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-500'
                    )
                  }
                >
                  Permission Assignments
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-500'
                    )
                  }
                >
                  Effective Permissions
                </Tab>
              </Tab.List>
              
              <Tab.Panels>
                {/* Role Assignments Panel */}
                <Tab.Panel className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assignment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map((role: Role) => {
                          const assignment = roleAssignments.find(ra => ra.roleId === role.id);
                          return (
                            <tr key={role.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-3" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {role.displayName}
                                    </div>
                                    <div className="text-sm text-gray-500">{role.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center space-x-4">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name={`role-${role.id}`}
                                      checked={assignment?.effect === null}
                                      onChange={() => handleRoleChange(role.id, null)}
                                      className="form-radio h-4 w-4 text-gray-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">None</span>
                                  </label>
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name={`role-${role.id}`}
                                      checked={assignment?.effect === 'allow'}
                                      onChange={() => handleRoleChange(role.id, 'allow')}
                                      className="form-radio h-4 w-4 text-green-600"
                                    />
                                    <span className="ml-2 text-sm text-green-700">Allow</span>
                                  </label>
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name={`role-${role.id}`}
                                      checked={assignment?.effect === 'deny'}
                                      onChange={() => handleRoleChange(role.id, 'deny')}
                                      className="form-radio h-4 w-4 text-red-600"
                                    />
                                    <span className="ml-2 text-sm text-red-700">Deny</span>
                                  </label>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveRoles}
                      disabled={assigningRoles}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {assigningRoles ? 'Saving...' : 'Save Role Assignments'}
                    </button>
                  </div>
                </Tab.Panel>

                {/* Permission Assignments Panel */}
                <Tab.Panel className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Permission
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assignment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {permissions.map((permission: Permission) => {
                          const assignment = permissionAssignments.find(pa => pa.permissionId === permission.id);
                          return (
                            <tr key={permission.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <KeyIcon className="h-5 w-5 text-green-500 mr-3" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {permission.displayName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {permission.resource}:{permission.action}
                                      {permission.scope && `:${permission.scope}`}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center space-x-4">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name={`permission-${permission.id}`}
                                      checked={assignment?.effect === null}
                                      onChange={() => handlePermissionChange(permission.id, null)}
                                      className="form-radio h-4 w-4 text-gray-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">None</span>
                                  </label>
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name={`permission-${permission.id}`}
                                      checked={assignment?.effect === 'allow'}
                                      onChange={() => handlePermissionChange(permission.id, 'allow')}
                                      className="form-radio h-4 w-4 text-green-600"
                                    />
                                    <span className="ml-2 text-sm text-green-700">Allow</span>
                                  </label>
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name={`permission-${permission.id}`}
                                      checked={assignment?.effect === 'deny'}
                                      onChange={() => handlePermissionChange(permission.id, 'deny')}
                                      className="form-radio h-4 w-4 text-red-600"
                                    />
                                    <span className="ml-2 text-sm text-red-700">Deny</span>
                                  </label>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSavePermissions}
                      disabled={assigningPermissions}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {assigningPermissions ? 'Saving...' : 'Save Permission Assignments'}
                    </button>
                  </div>
                </Tab.Panel>

                {/* Effective Permissions Panel */}
                <Tab.Panel>
                  <div className="max-h-96 overflow-y-auto">
                    {effectivePermissions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No effective permissions found
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {effectivePermissions.map((permission: string, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                          >
                            {permission}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRolePermissionModal;