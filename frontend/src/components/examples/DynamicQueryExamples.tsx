'use client';

import React, { useState } from 'react';
import {
  useDynamicFindMany,
  useDynamicFindUnique,
  useDynamicCreate,
  useDynamicUpdate,
  useDynamicDelete,
  useDynamicCount,
  useDynamicAggregate,
  useDynamicCRUD,
} from '@/lib/graphql/universal-dynamic-hooks';

/**
 * Example 1: Simple List Component
 * Hiển thị danh sách users với pagination
 */
export function UserListExample() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, loading, error } = useDynamicFindMany({
    model: 'user',
    where: { isActive: true },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    pagination: {
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  });

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const users = data?.dynamicFindMany?.data || [];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Users List</h2>
      
      <div className="space-y-2">
        {users.map((user: any) => (
          <div key={user.id} className="p-3 border rounded">
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Example 2: Detail View Component
 * Hiển thị chi tiết 1 user với relations
 */
export function UserDetailExample({ userId }: { userId: string }) {
  const { data, loading, error } = useDynamicFindUnique({
    model: 'user',
    where: { id: userId },
    include: {
      posts: true,
      tasks: true,
    },
  });

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const user = data?.dynamicFindUnique;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{user?.name}</h2>
      <p className="text-gray-600">{user?.email}</p>
      
      <div className="mt-4">
        <h3 className="font-semibold">Posts: {user?.posts?.length || 0}</h3>
        <h3 className="font-semibold">Tasks: {user?.tasks?.length || 0}</h3>
      </div>
    </div>
  );
}

/**
 * Example 3: Create Form Component
 * Form tạo task mới
 */
export function CreateTaskExample() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [createTask, { loading, error }] = useDynamicCreate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createTask({
        variables: {
          input: {
            model: 'task',
            data: {
              title,
              description,
              status: 'TODO',
              priority: 'MEDIUM',
            },
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

      console.log('Created task:', result.data?.dynamicCreate);
      setTitle('');
      setDescription('');
      alert('Task created successfully!');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Create New Task</h2>
      
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Task'}
      </button>

      {error && <div className="text-red-500">Error: {error.message}</div>}
    </form>
  );
}

/**
 * Example 4: Update Component
 * Cập nhật thông tin user
 */
export function UpdateUserExample({ userId }: { userId: string }) {
  const [name, setName] = useState('');
  
  const [updateUser, { loading, error }] = useDynamicUpdate();

  const handleUpdate = async () => {
    try {
      await updateUser({
        variables: {
          input: {
            model: 'user',
            where: { id: userId },
            data: { name },
            select: { id: true, name: true },
          },
        },
      });

      alert('User updated successfully!');
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Update User</h2>
      
      <div>
        <label className="block font-semibold mb-1">New Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading || !name}
        className="px-6 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update'}
      </button>

      {error && <div className="text-red-500">Error: {error.message}</div>}
    </div>
  );
}

/**
 * Example 5: Delete Component
 * Xóa task
 */
export function DeleteTaskExample({ taskId }: { taskId: string }) {
  const [deleteTask, { loading }] = useDynamicDelete();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await deleteTask({
        variables: {
          input: {
            model: 'task',
            where: { id: taskId },
          },
        },
      });

      alert('Task deleted successfully!');
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete Task'}
    </button>
  );
}

/**
 * Example 6: Count & Statistics
 * Hiển thị thống kê
 */
export function TaskStatisticsExample() {
  const { data: countData } = useDynamicCount({
    model: 'task',
    where: { status: 'COMPLETED' },
  });

  const { data: aggregateData } = useDynamicAggregate({
    model: 'task',
    _count: true,
    where: { status: { in: ['TODO', 'IN_PROGRESS', 'COMPLETED'] } },
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Task Statistics</h2>
      
      <div className="space-y-2">
        <div className="p-3 bg-gray-100 rounded">
          <div className="font-semibold">Completed Tasks</div>
          <div className="text-2xl">{countData?.dynamicCount?._all || 0}</div>
        </div>

        <div className="p-3 bg-gray-100 rounded">
          <div className="font-semibold">Total Tasks</div>
          <div className="text-2xl">
            {typeof aggregateData?.dynamicAggregate?._count === 'number'
              ? aggregateData.dynamicAggregate._count
              : aggregateData?.dynamicAggregate?._count?._all || 0}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 7: CRUD Hook (All Operations)
 * Sử dụng useDynamicCRUD để có tất cả operations
 */
export function CompleteCRUDExample() {
  const taskCRUD = useDynamicCRUD('task');
  const [title, setTitle] = useState('');

  const handleCreate = async () => {
    try {
      const result = await taskCRUD.create({
        title,
        status: 'TODO',
        priority: 'MEDIUM',
      });
      
      console.log('Created:', result);
      setTitle('');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleUpdate = async (taskId: string) => {
    try {
      await taskCRUD.update(
        { id: taskId },
        { status: 'COMPLETED' }
      );
      
      console.log('Updated task');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await taskCRUD.delete({ id: taskId });
      console.log('Deleted task');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Complete CRUD Operations</h2>
      
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-full px-3 py-2 border rounded"
        />
        <button
          onClick={handleCreate}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
        >
          Create Task
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p>Model: {taskCRUD.model}</p>
        <p>Available operations: create, update, delete, findMany, findUnique</p>
      </div>
    </div>
  );
}

/**
 * Example 8: Search with Filters
 * Tìm kiếm users với nhiều điều kiện
 */
export function UserSearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const { data, loading } = useDynamicFindMany({
    model: 'user',
    where: {
      AND: [
        searchTerm ? {
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { name: { contains: searchTerm, mode: 'insensitive' } },
          ],
        } : {},
        isActive !== undefined ? { isActive } : {},
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
    },
    pagination: {
      page: 1,
      limit: 20,
    },
  }, {
    skip: !searchTerm && isActive === undefined, // Skip query if no filters
  });

  const users = data?.dynamicFindMany?.data || [];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Search Users</h2>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 px-3 py-2 border rounded"
        />
        
        <select
          value={isActive === undefined ? '' : isActive.toString()}
          onChange={(e) => setIsActive(e.target.value === '' ? undefined : e.target.value === 'true')}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {loading && <div>Searching...</div>}

      <div className="space-y-2">
        {users.map((user: any) => (
          <div key={user.id} className="p-3 border rounded flex justify-between">
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
            <div className={`px-2 py-1 rounded text-sm ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center text-gray-500">No users found</div>
      )}
    </div>
  );
}
