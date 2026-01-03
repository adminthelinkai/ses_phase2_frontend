import React, { lazy, Suspense, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
 * Uses portal for dropdown to avoid clipping
 */
const NotificationContainer: React.FC<NotificationContainerProps> = ({ onViewTask }) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

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

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isDropdownOpen && iconRef.current) {
      const updatePosition = () => {
        if (!iconRef.current) return;
        
        const rect = iconRef.current.getBoundingClientRect();
        const dropdownWidth = 420;
        const dropdownMaxHeight = 600;
        const gap = 8; // Gap between icon and dropdown
        const padding = 8; // Viewport padding
        
        // Default position: to the right of icon, below it
        let left = rect.right + gap;
        let top = rect.bottom + gap;
        
        // Check if dropdown goes off right edge
        if (left + dropdownWidth > window.innerWidth - padding) {
          // Align right edge with viewport right edge (with padding)
          left = window.innerWidth - dropdownWidth - padding;
        }
        
        // Check if dropdown goes off left edge
        if (left < padding) {
          left = padding;
        }
        
        // Check if dropdown goes off bottom edge
        if (top + dropdownMaxHeight > window.innerHeight - padding) {
          // Position above icon instead
          top = rect.top - dropdownMaxHeight - gap;
          // If still goes off top, align with top edge
          if (top < padding) {
            top = padding;
          }
        }
        
        setDropdownPosition({ top, left });
      };
      
      updatePosition();
      
      // Update position on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setDropdownPosition(null);
    }
  }, [isDropdownOpen]);

  return (
    <>
      <div ref={iconRef} className="relative">
        <Suspense fallback={<div className="w-9 h-9" />}>
          <NotificationIcon
            unreadCount={unreadCount}
            onClick={toggleDropdown}
            isOpen={isDropdownOpen}
          />
        </Suspense>
      </div>
      {isDropdownOpen && dropdownPosition && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 10000,
          }}
        >
          <Suspense fallback={<div className="w-[420px] h-[400px] bg-[var(--bg-panel)] rounded-xl" />}>
            <NotificationDropdown
              tasks={tasks}
              isLoading={isLoading}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onViewTask={handleViewTask}
              onClose={closeDropdown}
              isOpen={isDropdownOpen}
            />
          </Suspense>
        </div>,
        document.body
      )}
    </>
  );
};

export default NotificationContainer;

