
import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../../data';

interface ProjectSelectorProps {
  activeProject: Project;
  projects: Project[];
  onSelect: (proj: Project) => void;
  onCreateProject?: () => void;
  isLoading?: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ activeProject, projects, onSelect, onCreateProject, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Header component with + button
  const HeaderWithAddButton = () => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Active Project</h3>
      {onCreateProject && (
        <button
          onClick={onCreateProject}
          className="w-6 h-6 flex items-center justify-center rounded-md border border-[var(--border-color)] hover:border-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/10 transition-all group"
          title="Create New Project"
          aria-label="Create new project"
        >
          <svg 
            className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent-blue)] transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="px-6 mb-8 relative" ref={containerRef}>
        <HeaderWithAddButton />
        <div className="w-full p-3.5 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl flex items-center shadow-sm">
          <div className="w-8 h-8 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg flex items-center justify-center mr-3">
            <div className="w-4 h-4 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-[10px] font-black uppercase tracking-tight text-[var(--text-muted)]">Loading Projects...</div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="px-6 mb-8 relative" ref={containerRef}>
        <HeaderWithAddButton />
        <div className="w-full p-3.5 bg-[var(--bg-panel)] border border-amber-500/30 rounded-xl flex items-center shadow-sm">
          <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-[10px] font-black uppercase tracking-tight text-amber-500">No Projects Assigned</div>
            <div className="text-[8px] text-[var(--text-muted)] font-bold">Contact admin for access</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 mb-8 relative" ref={containerRef}>
      <HeaderWithAddButton />
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 bg-[var(--bg-panel)] border rounded-xl flex items-center shadow-sm transition-all hover:border-[var(--accent-blue)] group relative ${isOpen ? 'border-[var(--accent-blue)]' : 'border-[var(--border-color)]'}`}
      >
        <div className="w-8 h-8 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg flex items-center justify-center mr-3 group-hover:bg-[var(--accent-blue)]/10 transition-colors">
          <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2" />
          </svg>
        </div>
        <div className="overflow-hidden flex-1 text-left">
          <div className="text-[10px] font-black truncate uppercase tracking-tight leading-tight">{activeProject.name}</div>
          <div className="text-[8px] text-[var(--text-muted)] font-mono font-bold tracking-wider uppercase">ID: {activeProject.id?.slice(0, 8) || 'N/A'}</div>
        </div>
        <svg className={`w-3 h-3 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-6 right-6 top-[calc(100%-8px)] z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[var(--bg-sidebar)]/95 backdrop-blur-xl border border-[var(--accent-blue)] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden mt-3">
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {projects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => { onSelect(proj); setIsOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group/item ${activeProject.id === proj.id ? 'bg-[var(--accent-blue)] text-white' : 'hover:bg-[var(--bg-panel)]'}`}
                >
                  <div className="overflow-hidden">
                    <div className={`text-[10px] font-black uppercase tracking-tight ${activeProject.id === proj.id ? 'text-white' : 'text-[var(--text-primary)]'}`}>{proj.name}</div>
                    <div className={`text-[8px] font-mono tracking-wider uppercase ${activeProject.id === proj.id ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>{proj.id?.slice(0, 8) || 'N/A'}</div>
                  </div>
                  <div className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${proj.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : proj.status === 'on-hold' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                    {proj.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
