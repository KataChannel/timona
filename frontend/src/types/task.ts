// Enums for better type safety
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  completedAt?: string | Date;
  authorId: string;
  assigneeId?: string;
  tags?: string[];
  subtasks?: SubTask[];
  completedSubtasks?: number;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  collaborators?: TaskCollaborator[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string | Date;
  completedAt?: string | Date;
}

export interface TaskAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string | Date;
  uploadedBy: string;
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  mentions?: string[];
}

export interface TaskCollaborator {
  userId: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  role: 'VIEWER' | 'EDITOR' | 'OWNER';
  joinedAt: string | Date;
  isEditing?: boolean;
  editingField?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string | Date;
  assigneeId?: string;
  tags?: string[];
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string | Date;
  assigneeId?: string;
  tags?: string[];
}

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  assignee?: string[];
  tags?: string[];
  dueDate?: {
    from?: string | Date;
    to?: string | Date;
  };
  search?: string;
}

export interface TaskSortOptions {
  field: 'title' | 'priority' | 'status' | 'dueDate' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface TaskListResponse {
  tasks: Task[];
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// GraphQL types
export interface TaskConnection {
  edges: TaskEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface TaskEdge {
  node: Task;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startCursor?: string;
  endCursor?: string;
}