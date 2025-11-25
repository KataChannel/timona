import React from 'react';
import { TodoViewMode } from '@/types/todo-views';
import {
  ChartBarIcon,
  ListBulletIcon,
  TableCellsIcon,
  ViewColumnsIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface ViewModeSelectorProps {
  currentMode: TodoViewMode;
  onModeChange: (mode: TodoViewMode) => void;
}

const VIEW_MODES = [
  {
    mode: TodoViewMode.DASHBOARD,
    label: 'Dashboard',
    icon: ChartBarIcon,
  },
  {
    mode: TodoViewMode.LIST,
    label: 'Danh sách',
    icon: ListBulletIcon,
  },
  {
    mode: TodoViewMode.TABLE,
    label: 'Bảng',
    icon: TableCellsIcon,
  },
  {
    mode: TodoViewMode.KANBAN,
    label: 'Kanban',
    icon: ViewColumnsIcon,
  },
  {
    mode: TodoViewMode.GANTT,
    label: 'Gantt',
    icon: CalendarDaysIcon,
  },
];

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  currentMode,
  onModeChange
}) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
      {VIEW_MODES.map((viewMode) => {
        const Icon = viewMode.icon;
        const isActive = currentMode === viewMode.mode;
        
        return (
          <button
            key={viewMode.mode}
            onClick={() => onModeChange(viewMode.mode)}
            title={viewMode.label}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-white text-blue-700 shadow-sm border border-blue-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{viewMode.label}</span>
          </button>
        );
      })}
    </div>
  );
};
