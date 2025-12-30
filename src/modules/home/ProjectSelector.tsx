
import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../../data';

interface ProjectSelectorProps {
  activeProject: Project;
  projects: Project[];
  onSelect: (proj: Project) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ activeProject, projects, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="px-6 mb-8 relative" ref={containerRef}>
      <h3 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Active Project</h3>
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
          <div className="text-[8px] text-[var(--text-muted)] font-mono font-bold tracking-wider uppercase">ID: {activeProject.id}</div>
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
                    <div className={`text-[8px] font-mono tracking-wider uppercase ${activeProject.id === proj.id ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>{proj.id}</div>
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
