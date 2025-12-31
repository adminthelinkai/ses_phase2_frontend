import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../../lib/supabase';

interface ChatSessionPanelProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onEditSession: (sessionId: string, newTitle: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isLoading: boolean;
  viewMode: 'project_chat' | 'global_chat';
}

const ChatSessionPanel: React.FC<ChatSessionPanelProps> = ({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  onEditSession,
  isCollapsed,
  onToggleCollapse,
  isLoading,
  viewMode,
}) => {
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSessionId]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setDeletingSessionId(sessionId);
    await onDeleteSession(sessionId);
    setDeletingSessionId(null);
  };

  const handleEditClick = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingSessionId && editTitle.trim()) {
      onEditSession(editingSessionId, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-[var(--bg-panel)]/50 border-r border-[var(--border-color)] flex flex-col items-center py-3 shrink-0">
        {/* Expand button */}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-[var(--bg-base)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          title="Expand chat history"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* New chat button */}
        <button
          onClick={onNewChat}
          className="mt-3 p-2 rounded-lg bg-[var(--accent-blue)]/10 hover:bg-[var(--accent-blue)]/20 transition-colors text-[var(--accent-blue)]"
          title="New chat"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-[var(--bg-panel)]/50 border-r border-[var(--border-color)] flex flex-col shrink-0 animate-in slide-in-from-left-2 duration-200">
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {viewMode === 'project_chat' ? 'Project Chats' : 'Global Chats'}
          </span>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-[var(--bg-base)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Collapse panel"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--accent-blue)] hover:bg-blue-600 transition-all text-white text-xs font-bold shadow-lg shadow-blue-900/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-[var(--bg-base)] rounded-lg" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          // Empty state
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--bg-base)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">No chats yet</p>
            <p className="text-[9px] text-[var(--text-muted)] mt-1">Start a new conversation</p>
          </div>
        ) : (
          // Sessions
          sessions.map((session) => (
            <div
              key={session.id}
              role="button"
              tabIndex={0}
              onClick={() => editingSessionId !== session.id && onSessionSelect(session.id)}
              onKeyDown={(e) => e.key === 'Enter' && editingSessionId !== session.id && onSessionSelect(session.id)}
              onMouseEnter={() => setHoveredSessionId(session.id)}
              onMouseLeave={() => setHoveredSessionId(null)}
              className={`w-full group relative p-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                activeSessionId === session.id
                  ? 'bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30'
                  : 'hover:bg-[var(--bg-base)] border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editingSessionId === session.id ? (
                    // Edit mode
                    <form onSubmit={handleEditSubmit} onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleEditCancel}
                        className="w-full text-xs font-medium bg-[var(--bg-base)] border border-[var(--accent-blue)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
                        placeholder="Chat title..."
                      />
                    </form>
                  ) : (
                    // Display mode
                    <>
                      <p className={`text-xs font-medium truncate ${
                        activeSessionId === session.id 
                          ? 'text-[var(--accent-blue)]' 
                          : 'text-[var(--text-primary)]'
                      }`}>
                        {session.title || 'New Chat'}
                      </p>
                      <p className="text-[9px] text-[var(--text-muted)] mt-0.5">
                        {formatDate(session.updated_at)}
                      </p>
                    </>
                  )}
                </div>

                {/* Action buttons - show on hover */}
                {(hoveredSessionId === session.id || deletingSessionId === session.id) && editingSessionId !== session.id && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {/* Edit button */}
                    <button
                      onClick={(e) => handleEditClick(e, session)}
                      className="p-1 rounded-md hover:bg-[var(--accent-blue)]/20 text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
                      title="Edit title"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      disabled={deletingSessionId === session.id}
                      className="p-1 rounded-md hover:bg-rose-500/20 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                      title="Delete chat"
                    >
                      {deletingSessionId === session.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSessionPanel;
