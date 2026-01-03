import React, { lazy, Suspense } from 'react';
import { useTaskNotificationContext } from '../providers/TaskNotificationProvider';
import { Task } from '../lib/supabase';

// Lazy load components for code splitting
const NotificationIcon = lazy(() => import('./NotificationIcon'));
const NotificationDropdown = lazy(() => import('./NotificationDropdown'));

interface NotificationContainerProps {
  onViewTask?: (taskId: string, projectId: string | null) => void;
}

/**
 * Container component for notification icon and dropdown
 * Lazy loads components for performance
 */
const NotificationContainer: React.FC<NotificationContainerProps> = ({ onViewTask }) => {
  const {
    tasks,
    unreadCount,
    isLoading,
    isDropdownOpen,
    markAsRead,
    markAllAsRead,
    toggleDropdown,
    closeDropdown,
  } = useTaskNotificationContext();

  const handleViewTask = (taskId: string, projectId: string | null) => {
    if (onViewTask) {
      onViewTask(taskId, projectId);
    }
  };

  return (
    <div className="relative">
      <Suspense fallback={<div className="w-9 h-9" />}>
        <NotificationIcon
          unreadCount={unreadCount}
          onClick={toggleDropdown}
          isOpen={isDropdownOpen}
        />
        {isDropdownOpen && (
          <NotificationDropdown
            tasks={tasks}
            isLoading={isLoading}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onViewTask={handleViewTask}
            onClose={closeDropdown}
            isOpen={isDropdownOpen}
          />
        )}
      </Suspense>
    </div>
  );
};

export default NotificationContainer;

