import React, { useState, useRef, useEffect, lazy, Suspense, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProjectSelector from '../home/ProjectSelector';
import { Project, DeliverableItem } from '../../data';
import { useAuth } from '../../context/AuthContext';
import { Department, Role } from '../../types';
import type { CreatedProjectData } from '../projects/CreateProjectModal';

// Lazy load modals for code splitting (performance optimization)
const CreateProjectModal = lazy(() => import('../projects'));

interface SidebarProps {
  width: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeProject: Project;
  onProjectSelect: (p: Project) => void;
  deliverables: DeliverableItem[];
  activeDeliverableId: string;
  onDeliverableSelect: (id: string) => void;
  viewMode: 'project_chat' | 'global_chat';
  onViewModeSelect: (mode: 'project_chat' | 'global_chat') => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
  projects: Project[];
  isLoadingProjects: boolean;
  onProjectCreated?: (projectData: CreatedProjectData) => void; // Callback after project creation with project data
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Check if user can create projects (only Project Management department)
  const canCreateProject = user?.department === Department.PROJECT_MANAGEMENT;

  // Handle project creation success - close modal and notify parent with project data
  const handleProjectCreated = useCallback((projectData: CreatedProjectData) => {
    setShowCreateProjectModal(false);
    // Pass project data to parent to refresh and navigate to new project
    if (props.onProjectCreated) {
      props.onProjectCreated(projectData);
    }
  }, [props.onProjectCreated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{ width: props.width }} className="bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col relative shrink-0 transition-all duration-300">
      {!props.isCollapsed ? (
        <>
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)] shrink-0">
        <Link to="/home" className="w-8 h-8 bg-[var(--accent-blue)] rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all active:scale-90">
          <span className="text-white font-black text-sm">E</span>
        </Link>
        <span className="font-black text-lg tracking-tighter uppercase select-none">EPCM OS</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-6">
        <ProjectSelector 
          activeProject={props.activeProject} 
          projects={props.projects} 
          onSelect={props.onProjectSelect}
          onCreateProject={
            // Only show + button for Project Management department or HOD role
            canCreateProject
              ? () => setShowCreateProjectModal(true)
              : undefined
          }
          isLoading={props.isLoadingProjects}
        />

        <div className="px-6 mb-8">
          <h3 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Deliverables</h3>
          <div className="space-y-2">
            {props.deliverables.map(item => {
              const isActive = props.activeDeliverableId === item.id;
              return (
                    <button key={item.id} onClick={() => props.onDeliverableSelect(item.id)} className={`w-full text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden group ${isActive ? 'bg-[var(--bg-panel)] border-[var(--accent-blue)] shadow-lg scale-[1.02] z-10' : 'border-transparent hover:bg-[var(--bg-panel)]/50'}`}>
                  {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--accent-blue)] shadow-[0_0_12px_var(--accent-blue)]"></div>}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[8px] font-mono font-black tracking-widest ${isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'}`}>{item.code}</span>
                    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse' : 'bg-[var(--text-muted)] opacity-20'}`}></div>
                  </div>
                  <div className={`text-[10.5px] font-black truncate uppercase tracking-tight ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{item.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-[var(--border-color)] flex items-center justify-between relative">
        <div className="relative" ref={profileMenuRef}>
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center text-[9px] font-black text-white shadow-lg">
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <div className="text-[10px] font-black tracking-tight uppercase">{user?.name || 'User'}</div>
              <div className="text-[8px] text-[var(--accent-blue)] font-black tracking-widest uppercase">{user?.department} {user?.role}</div>
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute left-0 bottom-16 w-52 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100]">
              <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)]">
                <div className="text-[9px] font-black text-[var(--text-primary)] uppercase">{user?.name || 'User'}</div>
                <div className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{user?.department} • {user?.role}</div>
              </div>
              <div className="p-2">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-rose-500/10 transition-colors group"
                >
                  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 group-hover:text-rose-400">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
        <button onClick={props.onThemeToggle} className="p-2.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-panel)] transition-all text-[var(--text-muted)]">
          {props.theme === 'dark' ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
        </button>
      </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-4 gap-4">
          <Link to="/home" className="w-8 h-8 bg-[var(--accent-blue)] rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-90">
            <span className="text-white font-black text-sm">E</span>
          </Link>
        </div>
      )}

      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={props.onToggleCollapse}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-r-xl hover:bg-[var(--accent-blue)] hover:border-[var(--accent-blue)] transition-all duration-300 z-50 flex items-center justify-center group shadow-lg cursor-pointer"
      >
        <svg 
          className={`w-4 h-4 text-[var(--text-muted)] group-hover:text-white transition-all duration-300 ${props.isCollapsed ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {!props.isCollapsed && (
      <div onMouseDown={props.onResizeStart} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--accent-blue)] transition-colors group">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-color)] group-hover:bg-[var(--accent-blue)] rounded-full"></div>
      </div>
      )}

      {/* Create Project Modal - Lazy loaded for code splitting */}
      {showCreateProjectModal && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <CreateProjectModal 
            onClose={() => setShowCreateProjectModal(false)}
            onSuccess={handleProjectCreated}
          />
        </Suspense>
      )}
    </aside>
  );
};

export default Sidebar;