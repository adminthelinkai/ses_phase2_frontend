import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../lib/supabase';

interface NotificationIconProps {
  unreadCount: number;
  onClick: () => void;
  isOpen?: boolean;
}

/**
 * Notification bell icon component with unread count badge
 * Professional design matching enterprise standards
 */
const NotificationIcon: React.FC<NotificationIconProps> = ({ unreadCount, onClick, isOpen = false }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-[var(--bg-panel)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-2 focus:ring-offset-[var(--bg-sidebar)]"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      aria-expanded={isOpen}
    >
      {/* Bell Icon */}
      <svg
        className={`w-5 h-5 transition-colors duration-200 ${
          unreadCount > 0 || isOpen
            ? 'text-[var(--accent-blue)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[11px] font-bold rounded-full border-2 border-white/20 shadow-lg shadow-blue-500/50 animate-in zoom-in-50 duration-200 ring-2 ring-blue-400/30"
          aria-label={`${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {/* Active indicator (subtle pulse when open) */}
      {isOpen && (
        <span className="absolute inset-0 rounded-lg bg-[var(--accent-blue)]/10 animate-pulse" />
      )}
    </button>
  );
};

export default NotificationIcon;

