import React from 'react';
import { Link } from 'react-router-dom';
import ProjectSelector from '../home/ProjectSelector';
import { Project, DeliverableItem, projects } from '../../data';

interface SidebarProps {
  width: number;
  activeProject: Project;
  onProjectSelect: (p: Project) => void;
  deliverables: DeliverableItem[];
  activeDeliverableId: string;
  onDeliverableSelect: (id: string) => void;
  viewMode: string;
  onViewModeSelect: (mode: 'chat' | 'node') => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <aside style={{ width: props.width }} className="bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col relative shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)] shrink-0">
        <Link to="/home" className="w-8 h-8 bg-[var(--accent-blue)] rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all active:scale-90">
          <span className="text-white font-black text-sm">E</span>
        </Link>
        <span className="font-black text-lg tracking-tighter uppercase select-none">EPCM OS</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-6">
        <ProjectSelector activeProject={props.activeProject} projects={projects} onSelect={props.onProjectSelect} />

        <div className="px-6 mb-8">
          <h3 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Deliverables</h3>
          <div className="space-y-2">
            {props.deliverables.map(item => {
              const isActive = props.activeDeliverableId === item.id;
              return (
                <button key={item.id} onClick={() => props.onDeliverableSelect(item.id)} className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${isActive ? 'bg-[var(--bg-panel)] border-[var(--accent-blue)] shadow-lg scale-[1.02] z-10' : 'border-transparent hover:bg-[var(--bg-panel)]/50'}`}>
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

        <div className="px-3 mb-8 space-y-0.5">
          <h3 className="px-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">Modes</h3>
          {['chat', 'node'].map(mode => (
            <button key={mode} onClick={() => props.onViewModeSelect(mode as any)} className={`w-full flex items-center px-4 py-3 text-[10px] font-black rounded-lg transition-all uppercase tracking-[0.2em] ${props.viewMode === mode ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-l-4 border-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-panel)]/30'}`}>
              <svg className="w-4 h-4 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mode === 'chat' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
              </svg>
              {mode === 'chat' ? 'Intelligence' : 'Workflows'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 border-t border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center text-[9px] font-black text-white shadow-lg">JD</div>
          <div className="ml-3">
            <div className="text-[10px] font-black tracking-tight uppercase">John Doe</div>
            <div className="text-[8px] text-[var(--accent-blue)] font-black tracking-widest uppercase">CSA HOD</div>
          </div>
        </div>
        <button onClick={props.onThemeToggle} className="p-2.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-panel)] transition-all text-[var(--text-muted)]">
          {props.theme === 'dark' ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
        </button>
      </div>

      <div onMouseDown={props.onResizeStart} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--accent-blue)] transition-colors group">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-color)] group-hover:bg-[var(--accent-blue)] rounded-full"></div>
      </div>
    </aside>
  );
};

export default Sidebar;