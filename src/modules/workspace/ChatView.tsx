import React, { useState, useRef, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { sendProjectChatQuery, sendGlobalChatQuery } from '../../api/chat';
import { Department } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  ChatSession,
  ChatMessage,
  getProjectChatSessions,
  getGlobalChatSessions,
  createProjectChatSession,
  createGlobalChatSession,
  deleteProjectChatSession,
  deleteGlobalChatSession,
  getProjectChatMessages,
  getGlobalChatMessages,
  saveProjectChatMessage,
  saveGlobalChatMessage,
  buildConversationHistory,
  getParticipantByDepartment,
  getDefaultBackendProjectId,
  updateProjectChatSessionTitle,
  updateGlobalChatSessionTitle,
  Participant,
} from '../../lib/supabase';

// Lazy load the components
const DepartmentBackgroundProvider = lazy(() => import('../../components/backgrounds/DepartmentBackgroundProvider'));
const ChatSessionPanel = lazy(() => import('./ChatSessionPanel'));

interface ChatViewProps {
  department?: Department;
  viewMode: 'project_chat' | 'global_chat';
  onViewModeSelect: (mode: 'project_chat' | 'global_chat') => void;
  projectId: string;
  userId: string;
}

// Loading fallback for background
const BackgroundFallback = () => (
  <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
);

// Loading fallback for session panel
const SessionPanelSkeleton = () => (
  <div className="w-64 h-full bg-[var(--bg-panel)]/50 border-r border-[var(--border-color)] flex flex-col shrink-0 animate-pulse">
    <div className="p-3 border-b border-[var(--border-color)]">
      <div className="h-4 bg-[var(--bg-base)] rounded w-24 mb-3" />
      <div className="h-10 bg-[var(--bg-base)] rounded-xl" />
    </div>
    <div className="p-2 space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-[var(--bg-base)] rounded-lg" />
      ))}
    </div>
  </div>
);

// Department-specific quick prompts
const getDepartmentPrompts = (department?: Department): { icon: string; label: string; prompt: string }[] => {
  const basePrompts = [
    { icon: '📊', label: 'Progress Report', prompt: 'Generate a summary of current project progress' },
    { icon: '⚠️', label: 'Risk Analysis', prompt: 'Identify potential risks in active deliverables' },
  ];

  switch (department) {
    case Department.PROJECT_MANAGEMENT:
      return [
        { icon: '📅', label: 'Schedule Status', prompt: 'Show me the current project schedule status and any delays' },
        { icon: '👥', label: 'Resource Allocation', prompt: 'Analyze resource allocation across all departments' },
        { icon: '📈', label: 'KPI Dashboard', prompt: 'Generate KPI metrics for this month' },
        { icon: '🎯', label: 'Milestone Tracker', prompt: 'List upcoming milestones and their status' },
      ];
    case Department.CSA:
      return [
        { icon: '🧱', label: 'Structural Clash', prompt: 'Run structural clash analysis for active models' },
        { icon: '📐', label: 'RCC Detailing', prompt: 'Check RCC detailing compliance for current drawings' },
        { icon: '🏗️', label: 'Foundation Status', prompt: 'Show foundation work progress and issues' },
        { icon: '📋', label: 'QA Checklist', prompt: 'Generate QA checklist for structural elements' },
      ];
    case Department.ELECTRICAL:
      return [
        { icon: '⚡', label: 'Load Calculation', prompt: 'Review electrical load calculations for current phase' },
        { icon: '🔌', label: 'Cable Routing', prompt: 'Analyze cable routing and tray fill status' },
        { icon: '💡', label: 'Lighting Design', prompt: 'Check lighting lux level compliance' },
        { icon: '🔋', label: 'Power Distribution', prompt: 'Show power distribution single line diagram status' },
      ];
    case Department.MECHANICAL:
      return [
        { icon: '🔧', label: 'Equipment List', prompt: 'Show mechanical equipment delivery status' },
        { icon: '❄️', label: 'HVAC Analysis', prompt: 'Analyze HVAC load calculations and sizing' },
        { icon: '🔩', label: 'Piping Status', prompt: 'Check piping isometrics completion status' },
        { icon: '⚙️', label: 'Rotating Equipment', prompt: 'List rotating equipment specifications' },
      ];
    case Department.PROCESS:
      return [
        { icon: '🧪', label: 'P&ID Review', prompt: 'Review P&ID markups and comments status' },
        { icon: '📊', label: 'Material Balance', prompt: 'Check material balance calculations' },
        { icon: '🌡️', label: 'Heat Exchanger', prompt: 'Analyze heat exchanger datasheets' },
        { icon: '💨', label: 'Line Sizing', prompt: 'Verify line sizing calculations' },
      ];
    case Department.INSTRUMENT:
      return [
        { icon: '📡', label: 'I/O Count', prompt: 'Generate I/O count summary for current phase' },
        { icon: '📏', label: 'Instrument Index', prompt: 'Show instrument index completion status' },
        { icon: '🎛️', label: 'Control Loops', prompt: 'List control loop diagrams status' },
        { icon: '📶', label: 'Signal Routing', prompt: 'Check signal routing and cable schedule' },
      ];
    case Department.ADMIN:
      return [
        { icon: '👤', label: 'User Activity', prompt: 'Show user activity logs for this week' },
        { icon: '🔐', label: 'Access Report', prompt: 'Generate access control report' },
        { icon: '📁', label: 'System Health', prompt: 'Check system health and performance metrics' },
        { icon: '📝', label: 'Audit Trail', prompt: 'Show recent audit trail entries' },
      ];
    case Department.MANAGEMENT:
      return [
        { icon: '💼', label: 'Executive Summary', prompt: 'Generate executive summary for stakeholders' },
        { icon: '💰', label: 'Budget Status', prompt: 'Show current budget utilization and forecast' },
        { icon: '📊', label: 'Department KPIs', prompt: 'Compare KPIs across all departments' },
        { icon: '🎯', label: 'Strategic Goals', prompt: 'Track strategic goals progress' },
      ];
    default:
      return basePrompts;
  }
};

// Get greeting based on time
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Get department display name
const getDepartmentDisplayName = (department?: Department): string => {
  const names: Record<Department, string> = {
    [Department.ADMIN]: 'Administration',
    [Department.MANAGEMENT]: 'Management',
    [Department.CSA]: 'Civil & Structural',
    [Department.ELECTRICAL]: 'Electrical',
    [Department.INSTRUMENT]: 'Instrumentation',
    [Department.PROJECT_MANAGEMENT]: 'Project Management',
    [Department.PROCESS]: 'Process',
    [Department.MECHANICAL]: 'Mechanical',
  };
  return department ? names[department] : 'Engineering';
};

const ChatView: React.FC<ChatViewProps> = ({ 
  department,
  viewMode,
  onViewModeSelect,
  projectId,
  userId,
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Session management state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSessionPanelOpen, setIsSessionPanelOpen] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  
  // Ref to skip auto-loading messages during submit
  const isSubmittingRef = useRef(false);
  
  // Ref to track if user intentionally started a new chat
  const isNewChatModeRef = useRef(false);
  
  // Participant and backend project state
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [backendProjectId, setBackendProjectId] = useState<string>('');
  
  // Load participant and backend project on mount
  useEffect(() => {
    const loadParticipantAndProject = async () => {
      if (department) {
        const p = await getParticipantByDepartment(department);
        setParticipant(p);
      }
      const projId = await getDefaultBackendProjectId();
      setBackendProjectId(projId);
    };
    loadParticipantAndProject();
  }, [department]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessions when viewMode or projectId changes
  const loadSessions = useCallback(async (autoSelect: boolean = true) => {
    if (!userId || !projectId) return;
    
    setIsLoadingSessions(true);
    try {
      const loadedSessions = viewMode === 'project_chat'
        ? await getProjectChatSessions(userId, projectId)
        : await getGlobalChatSessions(userId, projectId);
      
      setSessions(loadedSessions);
      
      // Only auto-select first session on initial load
      if (autoSelect && loadedSessions.length > 0 && !isNewChatModeRef.current) {
        setActiveSessionId(loadedSessions[0].id);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [userId, projectId, viewMode]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Load messages when active session changes
  useEffect(() => {
    const loadMessages = async () => {
      // Skip loading if we're in the middle of submitting (to avoid duplicates)
      if (isSubmittingRef.current) {
        return;
      }
      
      if (!activeSessionId) {
        setMessages([]);
        return;
      }

      try {
        const loadedMessages = viewMode === 'project_chat'
          ? await getProjectChatMessages(activeSessionId)
          : await getGlobalChatMessages(activeSessionId);
        
        setMessages(loadedMessages);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setMessages([]);
      }
    };

    loadMessages();
  }, [activeSessionId, viewMode]);

  // Reset active session when viewMode changes
  useEffect(() => {
    isNewChatModeRef.current = false; // Reset new chat mode when switching view
    setActiveSessionId(null);
    setMessages([]);
  }, [viewMode]);

  const handleNewChat = () => {
    isNewChatModeRef.current = true; // Prevent auto-selecting existing session
    setActiveSessionId(null);
    setMessages([]);
    setQuery('');
    setError(null);
    inputRef.current?.focus();
  };

  const handleSessionSelect = (sessionId: string) => {
    isNewChatModeRef.current = false; // User selected a session, exit new chat mode
    setActiveSessionId(sessionId);
    setError(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const success = viewMode === 'project_chat'
        ? await deleteProjectChatSession(sessionId)
        : await deleteGlobalChatSession(sessionId);

      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleEditSession = async (sessionId: string, newTitle: string) => {
    try {
      const success = viewMode === 'project_chat'
        ? await updateProjectChatSessionTitle(sessionId, newTitle)
        : await updateGlobalChatSessionTitle(sessionId, newTitle);

      if (success) {
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, title: newTitle, updated_at: new Date().toISOString() } : s
        ));
      }
    } catch (err) {
      console.error('Failed to edit session:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessageContent = query.trim();
    setQuery('');
    setIsLoading(true);
    setError(null);
    isSubmittingRef.current = true;

    console.log('handleSubmit - activeSessionId:', activeSessionId, 'isNewChatMode:', isNewChatModeRef.current);

    try {
      let currentSessionId = activeSessionId;

      // If no active session, create one with the first message as title
      if (!currentSessionId) {
        console.log('Creating new session with title:', userMessageContent.slice(0, 50));
        const title = userMessageContent.slice(0, 50) + (userMessageContent.length > 50 ? '...' : '');
        const newSession = viewMode === 'project_chat'
          ? await createProjectChatSession(userId, projectId, title)
          : await createGlobalChatSession(userId, projectId, title);

        if (!newSession) {
          throw new Error('Failed to create chat session');
        }

        console.log('New session created:', newSession);
        currentSessionId = newSession.id;
        setActiveSessionId(currentSessionId);
        setSessions(prev => [newSession, ...prev]);
        isNewChatModeRef.current = false; // Session created, exit new chat mode
      } else {
        console.log('Using existing session:', currentSessionId);
      }

      // Save user message to database
      const savedUserMessage = viewMode === 'project_chat'
        ? await saveProjectChatMessage(currentSessionId, 'user', userMessageContent)
        : await saveGlobalChatMessage(currentSessionId, 'user', userMessageContent);

      if (!savedUserMessage) {
        throw new Error('Failed to save message');
      }

      // Update local messages state immediately (use functional update to get current messages)
      const currentMessages = [...messages];
      setMessages(prev => [...prev, savedUserMessage]);

      // Build conversation history from all messages including the new one
      const conversationHistory = buildConversationHistory([...currentMessages, savedUserMessage]);

      // Send to API with correct participant_id and backend project_id
      const apiProjectId = backendProjectId || projectId;
      const response = viewMode === 'project_chat'
        ? await sendProjectChatQuery(
            participant?.participant_id || '', 
            userMessageContent, 
            conversationHistory, 
            apiProjectId, 
            true
          )
        : await sendGlobalChatQuery(
            userMessageContent, 
            conversationHistory, 
            apiProjectId
          );

      if (response.error) {
        setError(response.error);
      } else {
        // Save assistant response to database
        const savedAssistantMessage = viewMode === 'project_chat'
          ? await saveProjectChatMessage(currentSessionId, 'assistant', response.message)
          : await saveGlobalChatMessage(currentSessionId, 'assistant', response.message);

        if (savedAssistantMessage) {
          setMessages(prev => [...prev, savedAssistantMessage]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send query. Please try again.');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
    inputRef.current?.focus();
  };

  const quickPrompts = getDepartmentPrompts(department);
  const userName = user?.name || 'Engineer';
  const greeting = getGreeting();
  const deptName = getDepartmentDisplayName(department);

  return (
    <div className="flex-1 flex h-full bg-inherit relative overflow-hidden transition-colors">
      {/* Department-specific Background - Absolutely Positioned */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Suspense fallback={<BackgroundFallback />}>
          <DepartmentBackgroundProvider department={department} />
        </Suspense>
      </div>

      {/* Chat Session Panel - Collapsible */}
      <div className="relative z-10">
        <Suspense fallback={<SessionPanelSkeleton />}>
          <ChatSessionPanel
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onEditSession={handleEditSession}
            isCollapsed={!isSessionPanelOpen}
            onToggleCollapse={() => setIsSessionPanelOpen(!isSessionPanelOpen)}
            isLoading={isLoadingSessions}
            viewMode={viewMode}
          />
        </Suspense>
      </div>
    
      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col items-center">
          <div className="w-full max-w-4xl">
            {messages.length === 0 && !activeSessionId ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Welcome Header */}
                <div className="text-center mb-10 mt-4">
                  {/* Animated Icon */}
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-blue)] to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Personalized Greeting */}
                  <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
                    {greeting}, <span className="text-[var(--accent-blue)]">{userName}</span>
                  </h1>
                  
                  {/* Department Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-panel)]/80 backdrop-blur-sm border border-[var(--border-color)] rounded-full mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                      {deptName} Division
                    </span>
                  </div>

                  <p className="text-[var(--text-secondary)] text-[13px] max-w-md mx-auto leading-relaxed opacity-80 text-center">
                    {viewMode === 'project_chat' 
                      ? 'Your AI-powered project intelligence assistant. Ask anything about deliverables, schedules, or technical data.'
                      : 'Your global EPCM intelligence assistant. Ask about industry standards, general engineering queries, or company policies.'}
                  </p>
                </div>

                {/* Quick Actions Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent opacity-50"></div>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Quick Actions</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-[var(--border-color)] to-transparent opacity-50"></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                    {quickPrompts.map((item, index) => (
                      <button 
                        key={index}
                        onClick={() => handlePromptClick(item.prompt)}
                        className="group p-3 bg-[var(--bg-panel)]/70 backdrop-blur-md border border-[var(--border-color)] rounded-xl hover:border-[var(--accent-blue)] hover:bg-[var(--bg-panel)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left relative overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-blue)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Icon */}
                        <div className="text-xl mb-1.5 transform group-hover:scale-110 transition-transform duration-300">
                          {item.icon}
                        </div>
                        
                        {/* Label */}
                        <div className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--accent-blue)] transition-colors">
                          {item.label}
                        </div>
                        
                        {/* Corner Accent */}
                        <div className="absolute top-0 right-0 w-6 h-6 opacity-0 group-hover:opacity-20 transition-opacity border-t border-r border-[var(--accent-blue)]"></div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-[var(--bg-panel)]/50 backdrop-blur-sm border border-[var(--border-color)] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] mb-0.5">Pro Tip</h3>
                      <p className="text-[10.5px] text-[var(--text-muted)] leading-relaxed">
                        Try: <span className="text-[var(--accent-blue)] font-medium cursor-pointer hover:underline" onClick={() => handlePromptClick('Show me all pending RFIs for CSA-BR-900')}>
                          "Show me all pending RFIs for CSA-BR-900"
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-6 mt-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-[var(--accent-blue)] text-white'
                          : 'bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--text-primary)]'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl animate-in fade-in duration-300">
                    <p className="text-sm text-rose-400">{error}</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="pb-8 pt-4 px-6 md:px-10 relative z-20 w-full">
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-[var(--bg-base)] to-transparent pointer-events-none"></div>
            
            {/* VIEW MODE TOGGLE */}
            <div className="flex justify-end mb-4">
              <div className="bg-[var(--bg-panel)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-full p-0.5 flex gap-0.5 shadow-lg">
                <button 
                  onClick={() => onViewModeSelect('project_chat')}
                  className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                    viewMode === 'project_chat' 
                      ? 'bg-[var(--accent-blue)] text-white shadow-md' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Project Chat
                </button>
                <button 
                  onClick={() => onViewModeSelect('global_chat')}
                  className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                    viewMode === 'global_chat' 
                      ? 'bg-[var(--accent-blue)] text-white shadow-md' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Global Chat
                </button>
              </div>
            </div>

            <form 
              onSubmit={handleSubmit} 
              className="relative bg-[var(--bg-panel)]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl flex items-center shadow-2xl transition-all duration-300 focus-within:border-[var(--accent-blue)] focus-within:ring-4 ring-[var(--accent-blue)]/10 overflow-hidden"
            >
              <input 
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={viewMode === 'project_chat' ? "Ask anything about your project..." : "Ask anything globally..."} 
                disabled={isLoading}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-6 py-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] disabled:opacity-50 h-14"
              />
              <div className="flex items-center gap-1.5 pr-2">
                 <button 
                   type="button"
                   className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-white/5"
                   title="Attach file"
                 >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                 </button>
                 <button 
                   type="submit"
                   disabled={isLoading || !query.trim()}
                   className="bg-[var(--accent-blue)] w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-xl hover:bg-blue-600 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                 >
                   {isLoading ? (
                     <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                   )}
                 </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
