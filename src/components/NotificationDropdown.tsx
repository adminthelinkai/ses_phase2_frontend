import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task } from '../lib/supabase';

interface NotificationDropdownProps {
  tasks: Task[];
  isLoading: boolean;
  onMarkAsRead: (taskId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete?: (taskId: string) => void;
  onViewTask?: (taskId: string, projectId: string | null) => void;
  onClose: () => void;
  isOpen: boolean;
}

type FilterType = 'all' | 'unread' | 'read';

/**
 * Professional notification dropdown component
 * Displays task notifications with read/unread status and management features
 */
const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  tasks,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onViewTask,
  onClose,
  isOpen,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'unread':
        return tasks.filter(task => !task.is_read);
      case 'read':
        return tasks.filter(task => task.is_read);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const unreadCount = tasks.filter(task => !task.is_read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'medium':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'low':
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'text-emerald-400';
      case 'IN_PROGRESS':
        return 'text-blue-400';
      case 'FAILED':
        return 'text-rose-400';
      case 'PENDING':
      default:
        return 'text-slate-400';
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleTaskClick = async (task: Task) => {
    if (!task.is_read) {
      await onMarkAsRead(task.task_id);
    }
    if (onViewTask) {
      onViewTask(task.task_id, task.project_id);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="w-[420px] bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-color)] rounded-xl shadow-2xl flex flex-col max-h-[600px] animate-in fade-in slide-in-from-top-2 duration-200"
      role="dialog"
      aria-label="Notifications"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-full border border-rose-500/30">
              {unreadCount} NEW
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
            aria-label="Filter notifications"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          {/* Mark All as Read */}
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-blue)] hover:text-blue-400 transition-colors px-2 py-1"
              aria-label="Mark all as read"
            >
              Mark All Read
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--bg-base)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="Close notifications"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-base)] flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-[11px] font-medium text-[var(--text-secondary)] text-center">
              {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {filteredTasks.map((task) => (
              <div
                key={task.task_id}
                className={`p-4 hover:bg-[var(--bg-base)] transition-colors cursor-pointer group ${
                  !task.is_read ? 'bg-[var(--accent-blue)]/5 border-l-2 border-l-[var(--accent-blue)]' : ''
                }`}
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-start gap-3">
                  {/* Unread Indicator */}
                  {!task.is_read && (
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-blue)] mt-2 shrink-0 animate-pulse"></div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-bold text-[var(--text-primary)] leading-tight ${
                        !task.is_read ? '' : 'opacity-70'
                      }`}>
                        {task.title}
                      </h4>
                      {task.priority && (
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border shrink-0 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className={`text-[11px] text-[var(--text-secondary)] line-clamp-2 mb-2 ${
                        !task.is_read ? '' : 'opacity-60'
                      }`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.created_at && (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {formatDate(task.created_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!task.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(task.task_id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-panel)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent-blue)]"
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(task.task_id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 transition-colors text-[var(--text-muted)] hover:text-rose-400"
                        aria-label="Delete notification"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

