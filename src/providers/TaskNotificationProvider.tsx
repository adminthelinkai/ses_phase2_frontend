import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useTaskNotifications } from '../hooks/useTaskNotifications';
import { Task, markAllTasksAsRead } from '../lib/supabase';

interface TaskNotificationContextType {
  tasks: Task[];
  unreadCount: number;
  isLoading: boolean;
  isDropdownOpen: boolean;
  markAsRead: (taskId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toggleDropdown: () => void;
  closeDropdown: () => void;
  refresh: () => Promise<void>;
}

const TaskNotificationContext = createContext<TaskNotificationContextType | undefined>(undefined);

interface TaskNotificationProviderProps {
  children: ReactNode;
  participantId: string | null;
  onViewTask?: (taskId: string, projectId: string | null) => void;
}

/**
 * Provider for task notifications with real-time updates
 * Manages notification state and provides context for components
 */
export const TaskNotificationProvider: React.FC<TaskNotificationProviderProps> = ({
  children,
  participantId,
  onViewTask,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { tasks, unreadCount, isLoading, markAsRead, refresh } = useTaskNotifications(participantId);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!participantId) return;

    // Update in database
    const success = await markAllTasksAsRead(participantId);
    if (!success) {
      // Rollback on error - refresh from server
      await refresh();
    }
  }, [participantId, refresh]);

  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleViewTask = useCallback((taskId: string, projectId: string | null) => {
    if (onViewTask) {
      onViewTask(taskId, projectId);
    }
    setIsDropdownOpen(false);
  }, [onViewTask]);

  const value: TaskNotificationContextType = {
    tasks,
    unreadCount,
    isLoading,
    isDropdownOpen,
    markAsRead,
    markAllAsRead: handleMarkAllAsRead,
    toggleDropdown: handleToggleDropdown,
    closeDropdown: handleCloseDropdown,
    refresh,
  };

  return (
    <TaskNotificationContext.Provider value={value}>
      {children}
    </TaskNotificationContext.Provider>
  );
};

/**
 * Hook to use task notifications context
 */
export const useTaskNotificationContext = (): TaskNotificationContextType => {
  const context = useContext(TaskNotificationContext);
  if (context === undefined) {
    throw new Error('useTaskNotificationContext must be used within TaskNotificationProvider');
  }
  return context;
};

