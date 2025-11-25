export enum TodoViewMode {
  DASHBOARD = 'DASHBOARD',
  LIST = 'LIST',
  TABLE = 'TABLE',
  KANBAN = 'KANBAN',
  GANTT = 'GANTT',
}

export interface ViewModeConfig {
  mode: TodoViewMode;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
}

export interface TodoViewProps {
  tasks: any[];
  loading?: boolean;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskCreate?: (task: any) => void;
}
