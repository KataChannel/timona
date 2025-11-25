/**
 * ============================================================================
 * DYNAMIC GRAPHQL - USAGE EXAMPLES
 * ============================================================================
 * 
 * Complete examples showing how to use the Dynamic GraphQL system
 * 
 * @version 2.0.0
 */

import React, { useState } from 'react';
import {
  useFindMany,
  useFindUnique,
  useFindManyPaginated,
  useCount,
  useAggregate,
  useGroupBy,
  useCreateOne,
  useUpdateOne,
  useDeleteOne,
  useCreateMany,
  useUpdateMany,
  useDeleteMany,
  useCRUD,
} from '@/hooks/useDynamicGraphQL';
import { Task, User, Post, Product } from '@/types/dynamic-graphql';

// ========================================
// EXAMPLE 1: Simple Task List
// ========================================

export function TaskListExample() {
  const { data: tasks, loading, error, refetch } = useFindMany<Task>('task', {
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
    take: 20,
  });

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="task-list">
      <button onClick={() => refetch()}>Refresh</button>
      {tasks?.map(task => (
        <div key={task.id} className="task-card">
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <span className="status">{task.status}</span>
          <span className="priority">{task.priority}</span>
          {task.user && <span className="author">{task.user.email}</span>}
        </div>
      ))}
    </div>
  );
}

// ========================================
// EXAMPLE 2: User Profile with All Relations
// ========================================

export function UserProfileExample({ userId }: { userId: string }) {
  const { data: user, loading } = useFindUnique<User>('user', 
    { id: userId },
    {
      include: {
        tasks: { where: { status: 'ACTIVE' } },
        posts: { where: { published: true } },
        _count: { tasks: true, posts: true, comments: true }
      }
    }
  );

  if (loading) return <div>Loading profile...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img src={user.avatar} alt={user.username} />
        <h2>{user.firstName} {user.lastName}</h2>
        <p>@{user.username}</p>
        <p>{user.email}</p>
      </div>

      <div className="stats">
        <div>Tasks: {user._count?.tasks}</div>
        <div>Posts: {user._count?.posts}</div>
        <div>Comments: {user._count?.comments}</div>
      </div>

      <div className="active-tasks">
        <h3>Active Tasks</h3>
        {user.tasks?.map(task => (
          <div key={task.id}>{task.title}</div>
        ))}
      </div>

      <div className="published-posts">
        <h3>Published Posts</h3>
        {user.posts?.map(post => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// EXAMPLE 3: Paginated Product List
// ========================================

export function PaginatedProductsExample() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: products,
    meta,
    loading,
    page,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
  } = useFindManyPaginated<Product>('product', {
    page: 1,
    limit: 12,
    where: {
      isActive: true,
      ...(selectedCategory && { categoryId: selectedCategory }),
      stock: { gt: 0 }
    },
    include: { 
      category: true,
      images: true 
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="product-grid">
      {/* Filter */}
      <div className="filters">
        <select onChange={(e) => setSelectedCategory(e.target.value || null)}>
          <option value="">All Categories</option>
          {/* Render categories */}
        </select>
      </div>

      {/* Products */}
      <div className="products">
        {loading ? (
          <div>Loading...</div>
        ) : (
          products?.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="price">${product.price}</p>
              <p className="stock">{product.stock} in stock</p>
              {product.category && <span>{product.category.name}</span>}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta && (
        <div className="pagination">
          <button onClick={prevPage} disabled={!meta.hasPrevPage}>
            Previous
          </button>
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>
          <button onClick={nextPage} disabled={!meta.hasNextPage}>
            Next
          </button>

          <select value={meta.limit} onChange={(e) => changeLimit(Number(e.target.value))}>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={48}>48 per page</option>
          </select>
        </div>
      )}
    </div>
  );
}

// ========================================
// EXAMPLE 4: Dashboard with Analytics
// ========================================

export function DashboardExample({ userId }: { userId: string }) {
  // Count different task statuses
  const { count: todoCount } = useCount('task', { userId, status: 'TODO' });
  const { count: inProgressCount } = useCount('task', { userId, status: 'IN_PROGRESS' });
  const { count: completedCount } = useCount('task', { userId, status: 'COMPLETED' });

  // Group tasks by priority
  const { data: tasksByPriority } = useGroupBy('task', {
    by: ['priority'],
    _count: { _all: true },
    where: { userId },
    orderBy: { priority: 'desc' }
  });

  // Aggregate invoice amounts
  const { data: invoiceStats } = useAggregate('invoice', {
    _sum: { amount: true },
    _avg: { amount: true },
    _count: true,
    where: { customerId: userId, status: 'PAID' }
  });

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Task Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Todo</h3>
          <p className="count">{todoCount}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="count">{inProgressCount}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="count">{completedCount}</p>
        </div>
      </div>

      {/* Tasks by Priority */}
      <div className="priority-breakdown">
        <h3>Tasks by Priority</h3>
        {tasksByPriority?.map((group: any) => (
          <div key={group.priority}>
            {group.priority}: {group._count._all} tasks
          </div>
        ))}
      </div>

      {/* Invoice Stats */}
      {invoiceStats && (
        <div className="invoice-stats">
          <h3>Invoice Statistics</h3>
          <p>Total Paid: ${invoiceStats._sum?.amount || 0}</p>
          <p>Average: ${invoiceStats._avg?.amount || 0}</p>
          <p>Count: {invoiceStats._count}</p>
        </div>
      )}
    </div>
  );
}

// ========================================
// EXAMPLE 5: Task Manager with CRUD
// ========================================

export function TaskManagerExample() {
  const [createTask, { loading: creating }] = useCreateOne<Task>('task');
  const [updateTask, { loading: updating }] = useUpdateOne<Task>('task');
  const [deleteTask, { loading: deleting }] = useDeleteOne('task');

  const { data: tasks, refetch } = useFindMany<Task>('task', {
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const handleCreate = async () => {
    const newTask = await createTask({
      data: {
        title: 'New Task',
        description: 'Task description',
        status: 'TODO',
        priority: 'MEDIUM',
        category: 'WORK',
        userId: 'current-user-id'
      }
    });
    console.log('Created:', newTask);
    refetch();
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    await updateTask({
      where: { id: taskId },
      data: { status }
    });
    refetch();
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure?')) {
      await deleteTask({ where: { id: taskId } });
      refetch();
    }
  };

  return (
    <div className="task-manager">
      <button onClick={handleCreate} disabled={creating}>
        {creating ? 'Creating...' : 'Create Task'}
      </button>

      <div className="task-list">
        {tasks?.map(task => (
          <div key={task.id} className="task-item">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            
            <select 
              value={task.status} 
              onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
              disabled={updating}
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <button 
              onClick={() => handleDelete(task.id)} 
              disabled={deleting}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// EXAMPLE 6: Bulk Operations
// ========================================

export function BulkOperationsExample() {
  const [createMany] = useCreateMany('task');
  const [updateMany] = useUpdateMany('task');
  const [deleteMany] = useDeleteMany('task');

  const handleBulkCreate = async () => {
    const result = await createMany({
      data: [
        { title: 'Task 1', userId: 'user-id', status: 'TODO', priority: 'LOW', category: 'WORK' },
        { title: 'Task 2', userId: 'user-id', status: 'TODO', priority: 'MEDIUM', category: 'WORK' },
        { title: 'Task 3', userId: 'user-id', status: 'TODO', priority: 'HIGH', category: 'WORK' },
      ],
      skipDuplicates: true
    });
    alert(`Created ${result.count} tasks`);
  };

  const handleMarkAllAsHighPriority = async () => {
    const result = await updateMany({
      where: { status: 'TODO' },
      data: { priority: 'HIGH' }
    });
    alert(`Updated ${result.count} tasks`);
  };

  const handleDeleteCompleted = async () => {
    if (confirm('Delete all completed tasks?')) {
      const result = await deleteMany({ status: 'COMPLETED' });
      alert(`Deleted ${result.count} tasks`);
    }
  };

  return (
    <div className="bulk-operations">
      <h2>Bulk Operations</h2>
      <button onClick={handleBulkCreate}>Create 3 Tasks</button>
      <button onClick={handleMarkAllAsHighPriority}>Mark All Todo as High Priority</button>
      <button onClick={handleDeleteCompleted}>Delete All Completed</button>
    </div>
  );
}

// ========================================
// EXAMPLE 7: All-in-One CRUD Hook
// ========================================

export function CompleteCRUDExample() {
  const crud = useCRUD<Task>('task');

  const handleOperations = async () => {
    try {
      // Find many
      const tasks = await crud.findMany({ 
        where: { status: 'ACTIVE' },
        orderBy: { priority: 'desc' }
      });
      console.log('Tasks:', tasks);

      // Find one
      const task = await crud.findUnique({ id: 'task-id' });
      console.log('Task:', task);

      // Count
      const count = await crud.count({ status: 'ACTIVE' });
      console.log('Count:', count);

      // Create
      const newTask = await crud.createOne({
        data: {
          title: 'New Task via CRUD',
          userId: 'user-id',
          status: 'TODO',
          priority: 'MEDIUM',
          category: 'WORK'
        }
      });
      console.log('Created:', newTask);

      // Update
      const updated = await crud.updateOne({
        where: { id: newTask.id },
        data: { status: 'IN_PROGRESS' }
      });
      console.log('Updated:', updated);

      // Create many
      const bulkResult = await crud.createMany({
        data: [
          { title: 'Bulk 1', userId: 'user-id', status: 'TODO', priority: 'LOW', category: 'WORK' },
          { title: 'Bulk 2', userId: 'user-id', status: 'TODO', priority: 'LOW', category: 'WORK' },
        ]
      });
      console.log('Bulk created:', bulkResult.count);

      // Delete
      await crud.deleteOne({
        where: { id: newTask.id }
      });
      console.log('Deleted');

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="crud-example">
      <h2>Complete CRUD Operations</h2>
      <button onClick={handleOperations} disabled={crud.loading}>
        {crud.loading ? 'Processing...' : 'Run All Operations'}
      </button>

      {/* Display states */}
      <div className="states">
        <p>Creating: {crud.states.createOne.loading ? 'Yes' : 'No'}</p>
        <p>Updating: {crud.states.updateOne.loading ? 'Yes' : 'No'}</p>
        <p>Deleting: {crud.states.deleteOne.loading ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

// ========================================
// EXAMPLE 8: Complex Blog Example
// ========================================

export function BlogExample() {
  const { data: posts } = useFindMany<Post>('post', {
    where: { published: true },
    include: {
      author: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: { comments: true, likes: true }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <div className="blog">
      {posts?.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p className="meta">
            By {post.author?.firstName} {post.author?.lastName} •
            {post._count?.comments} comments •
            {post._count?.likes} likes
          </p>
          <div className="content">{post.content}</div>
          
          <div className="comments">
            <h4>Recent Comments</h4>
            {post.comments?.map(comment => (
              <div key={comment.id} className="comment">
                <strong>{comment.user?.firstName}</strong>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export default {
  TaskListExample,
  UserProfileExample,
  PaginatedProductsExample,
  DashboardExample,
  TaskManagerExample,
  BulkOperationsExample,
  CompleteCRUDExample,
  BlogExample,
};
