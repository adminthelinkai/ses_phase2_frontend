import React, { memo, useMemo, useState } from 'react';
import { ChatMessage } from '../lib/supabase';

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  previousMessage?: ChatMessage;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  children: React.ReactNode;
}

/**
 * Format timestamp to relative time (e.g., "2 minutes ago", "Today at 3:45 PM")
 */
const formatTimestamp = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  // Format as "Today at HH:MM" or "MMM DD at HH:MM"
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

/**
 * Check if we should show a time separator between messages
 */
const shouldShowTimeSeparator = (current: ChatMessage, previous?: ChatMessage): boolean => {
  if (!previous) return false;
  const currentTime = new Date(current.created_at).getTime();
  const previousTime = new Date(previous.created_at).getTime();
  const diffMins = (currentTime - previousTime) / (1000 * 60);
  return diffMins > 5;
};

/**
 * Check if messages should be grouped (same sender, within 2 minutes)
 */
const shouldGroupWithPrevious = (current: ChatMessage, previous?: ChatMessage): boolean => {
  if (!previous) return false;
  if (current.role !== previous.role) return false;
  const currentTime = new Date(current.created_at).getTime();
  const previousTime = new Date(previous.created_at).getTime();
  const diffMins = (currentTime - previousTime) / (1000 * 60);
  return diffMins < 2;
};

/**
 * Optimized message bubble component with React.memo for performance.
 * Includes avatars, timestamps, and action buttons.
 */
const MessageBubble: React.FC<MessageBubbleProps> = memo(({
  message,
  index,
  previousMessage,
  onCopy,
  onRegenerate,
  onEdit,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Memoize timestamp formatting
  const timestamp = useMemo(() => formatTimestamp(message.created_at), [message.created_at]);
  
  // Memoize grouping and separator checks
  const showTimeSeparator = useMemo(
    () => shouldShowTimeSeparator(message, previousMessage),
    [message, previousMessage]
  );
  
  const isGrouped = useMemo(
    () => shouldGroupWithPrevious(message, previousMessage),
    [message, previousMessage]
  );

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isUser = message.role === 'user';

  return (
    <>
      {/* Time Separator */}
      {showTimeSeparator && (
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent opacity-50"></div>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">
            {formatTimestamp(message.created_at)}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--border-color)] to-transparent opacity-50"></div>
        </div>
      )}

      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`max-w-[80%] flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          {!isGrouped && (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isUser
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-primary)]'
              }`}
            >
              {isUser ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
            </div>
          )}

          {/* Message Content */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {/* Message Bubble */}
            <div
              className={`message-bubble group relative ${
                isUser
                  ? 'bg-gradient-to-br from-[var(--accent-blue)] to-blue-600 text-white'
                  : 'bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--text-primary)]'
              } p-4 rounded-2xl shadow-lg transition-all duration-200 ${
                isHovered ? 'shadow-xl' : ''
              }`}
            >
              {/* Message Actions - Show on hover */}
              {isHovered && (
                <div
                  className={`absolute ${isUser ? 'left-2' : 'right-2'} -top-10 flex items-center gap-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-1 shadow-lg z-10 animate-in fade-in slide-in-from-bottom-2 duration-200`}
                >
                  {!isUser && onRegenerate && (
                    <button
                      onClick={() => onRegenerate(message.id)}
                      className="p-1.5 rounded-md hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
                      title="Regenerate response"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                  {isUser && onEdit && (
                    <button
                      onClick={() => onEdit(message.id, message.content)}
                      className="p-1.5 rounded-md hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
                      title="Edit message"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
                    title={isCopied ? 'Copied!' : 'Copy message'}
                  >
                    {isCopied ? (
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* Message content */}
              <div className="message-content">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;

