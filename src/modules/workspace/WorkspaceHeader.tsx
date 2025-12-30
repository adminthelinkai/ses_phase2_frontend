import React from 'react';
import { DeliverableItem } from '../../data';

interface WorkspaceHeaderProps {
  deliverable?: DeliverableItem;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ deliverable }) => {
  return (
    <header className="h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 relative z-40">
      <div className="flex items-center">
        <span className="font-black text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-80">Execution Context</span>
        <div className="mx-5 w-px h-4 bg-[var(--border-color)]"></div>
        <span className="text-[10px] font-bold tracking-tight uppercase">
          {deliverable?.code || 'SELECT DELIVERABLE'} — {deliverable?.name || ''}
        </span>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 text-[9px] font-black border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-panel)] transition-all uppercase tracking-widest">SAVE DRAFT</button>
        <button className="px-5 py-2 text-[9px] font-black bg-[var(--accent-blue)] text-white rounded-lg shadow-lg shadow-blue-900/40 transition-all uppercase tracking-widest">SUBMIT NODE</button>
      </div>
    </header>
  );
};

export default WorkspaceHeader;