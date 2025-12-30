import React from 'react';
import { NodeItem, DeliverableItem } from '../../data';

interface RightSidebarProps {
  width: number;
  activeDeliverable?: DeliverableItem;
  nodes: NodeItem[];
  activeNodeId: string | null;
  onNodeSelect: (id: string) => void;
  onResizeStart: (e: React.MouseEvent) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = (props) => {
  const completedCount = props.nodes.filter(n => n.status === 'completed').length;
  const progressPercent = props.nodes.length > 0 ? (completedCount / props.nodes.length) * 100 : 0;

  const commands = [
    { id: 'add', icon: <path d="M12 4v16m8-8H4" />, color: '#3b82f6', label: 'ADD SUBSTEP' },
    { id: 'team', icon: <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />, color: '#a855f7', label: 'ASSIGN' },
    { id: 'doc', icon: <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />, color: '#10b981', label: 'ATTACH' },
    { id: 'intel', icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" />, color: '#f59e0b', label: 'ANALYZE' }
  ];

  return (
    <aside style={{ width: props.width }} className="bg-[var(--bg-sidebar)] border-l border-[var(--border-color)] flex flex-col relative shrink-0">
      <div onMouseDown={props.onResizeStart} className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--accent-blue)] transition-colors group z-50">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-[var(--border-color)] group-hover:bg-[var(--accent-blue)] rounded-full"></div>
      </div>
      
      <div className="h-20 border-b border-[var(--border-color)] flex items-center px-11 shrink-0 relative">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[var(--accent-blue)] tracking-[0.3em] uppercase mb-1">STAGE: {props.activeDeliverable?.code || '---'}</span>
          <h2 className="text-[17px] font-black uppercase tracking-tight text-[var(--text-primary)]">{props.activeDeliverable?.name || 'Deliverable'}</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-11 pb-12 pt-8 relative scrollbar-hide">
        <div className="relative space-y-7">
          <div className="absolute left-[4.5px] top-[-40px] bottom-0 w-[1px] bg-[var(--border-color)] opacity-60"></div>
          {props.nodes.map((node, i) => {
            const isActive = props.activeNodeId === node.id;
            return (
              <div key={node.id} className="relative pl-12">
                <div className={`absolute left-[-0.5px] top-[24px] w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-sidebar)] z-20 transition-all translate-x-[-50%] ${isActive ? 'bg-[var(--accent-blue)] scale-125 shadow-[0_0_12px_var(--accent-blue)]' : node.status === 'completed' ? 'bg-emerald-500 opacity-60' : node.status === 'blocked' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-[var(--border-color)]'}`}></div>
                <div className="flex items-start">
                  <div onClick={() => props.onNodeSelect(node.id)} className={`w-64 rounded-xl border p-4 transition-all cursor-pointer relative z-30 ${isActive ? 'bg-[var(--bg-panel)] border-[var(--accent-blue)] shadow-lg scale-[1.02]' : 'bg-[var(--bg-panel)] border-[var(--border-color)] opacity-80 hover:opacity-100 hover:-translate-y-0.5'}`}>
                    <div className="text-[7px] font-mono font-black uppercase tracking-[0.25em] mb-2 text-[var(--text-muted)]">Node_0{i+1}</div>
                    <div className={`text-[11.5px] font-black uppercase tracking-tight ${isActive ? 'text-[var(--text-primary)] translate-x-1.5' : 'text-[var(--text-secondary)]'} transition-all`}>{node.name}</div>
                  </div>
                  {isActive && (
                    <div className="flex items-center ml-4 animate-in fade-in slide-in-from-left-4">
                      <div className="w-8 h-px bg-[var(--accent-blue)]/40"></div>
                      <div className="flex flex-col gap-2.5 pl-5 border-l border-[var(--accent-blue)]/20">
                        {commands.map(cmd => (
                          <div key={cmd.id} className="group/sat flex items-center">
                            <button className="w-8 h-8 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] flex items-center justify-center transition-all hover:scale-110" style={{ color: cmd.color } as any}>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">{cmd.icon}</svg>
                            </button>
                            <span className="ml-3 text-[8px] font-black uppercase tracking-widest opacity-0 group-hover/sat:opacity-100 transition-opacity text-[var(--text-primary)] whitespace-nowrap">{cmd.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-auto border-t border-[var(--border-color)] p-6 flex flex-col gap-3.5">
        <div className="flex justify-between items-end px-1">
          <div className="flex items-baseline gap-2">
            <span className="text-16px font-black text-[var(--text-primary)]">{Math.round(progressPercent)}.0%</span>
            <span className="text-[7px] font-black uppercase tracking-widest text-[var(--accent-blue)]">Sync</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{completedCount}/{props.nodes.length} Stages</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--bg-panel)] rounded-full overflow-hidden border border-[var(--border-color)]/30">
          <div className="h-full bg-[var(--accent-blue)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;