import React, { Suspense, lazy } from 'react';
import { NodeItem } from '../../data';
import { Department } from '../../types';

// Lazy load the DepartmentBackgroundProvider
const DepartmentBackgroundProvider = lazy(() => import('../../components/backgrounds/DepartmentBackgroundProvider'));

interface NodeContextViewProps {
  activeNodeId: string;
  activeDeliverableCode: string;
  department?: Department;
  viewMode: 'project_chat' | 'global_chat';
  onViewModeSelect: (mode: 'project_chat' | 'global_chat') => void;
  nodes: NodeItem[];
}

// Loading fallback for background
const BackgroundFallback = () => (
  <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
);

const NodeContextView: React.FC<NodeContextViewProps> = ({ 
  activeNodeId, 
  activeDeliverableCode, 
  department,
  viewMode,
  onViewModeSelect,
  nodes
}) => {

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  // Handle case when no nodes are available
  if (!activeNode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-[var(--text-muted)] text-sm">No node selected</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto items-center py-10 relative transition-colors">
      {/* Department-specific Background - Absolutely Positioned */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Suspense fallback={<BackgroundFallback />}>
          <DepartmentBackgroundProvider department={department} />
        </Suspense>
      </div>

      {/* Main Content - Above Background */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* NODE EXECUTION CARD */}
        <div className="w-full max-w-5xl px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[var(--bg-panel)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden border-t-white/10">
            {/* Card Header */}
            <div className="px-10 py-6 bg-[var(--bg-sidebar)]/80 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  activeNode.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                  activeNode.status === 'blocked' ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                }`}></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
                  Context: {activeNode.name}
                </span>
              </div>
              <div className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold">
                PRT_CHN: {activeDeliverableCode} // {activeNode.id.toUpperCase()}
              </div>
            </div>
            
            {/* Card Body */}
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Departmental Reference</label>
                    <div className="bg-[var(--bg-input)] border border-[var(--border-color)] p-4 rounded-xl text-[12px] font-mono text-[var(--text-primary)] font-bold tracking-tight shadow-inner">
                      {activeDeliverableCode}-REF-99
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Disciplines Involved</label>
                    <div className="bg-[var(--bg-input)] border border-[var(--border-color)] p-4 rounded-xl text-[12px] font-mono text-[var(--text-primary)] font-bold tracking-tight shadow-inner text-blue-400">
                      {activeDeliverableCode.split('-')[0]} // COORDINATED
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Telemetry Logs</label>
                  <div className="bg-[var(--bg-input)]/80 backdrop-blur-sm border border-[var(--border-color)] rounded-xl p-6 h-48 overflow-y-auto custom-scrollbar font-mono text-[10.5px] space-y-2.5 shadow-inner">
                    <div className="flex items-start"><span className="text-emerald-500 font-bold mr-3 opacity-80">[14:02]</span><span className="text-[var(--text-secondary)]">Technical check complete. elements identified.</span></div>
                    <div className="flex items-start"><span className="text-blue-500 font-bold mr-3 opacity-80">[14:15]</span><span className="text-[var(--text-secondary)]">Discipline spec applied to active members.</span></div>
                    <div className="flex items-start"><span className="text-cyan-500 font-bold mr-3 opacity-80">[15:00]</span><span className="text-[var(--text-secondary)]">Initiating chain for active context: {activeNode.name}.</span></div>
                    <div className="flex items-start"><span className="text-[var(--text-muted)] font-bold mr-3 opacity-50">[16:22]</span><span className="text-[var(--text-muted)] italic">System awaiting operator action...</span></div>
                  </div>
                </div>
              </div>

              {/* Task Sidebar within Card */}
              <div className="bg-[var(--bg-sidebar)]/90 rounded-2xl border border-[var(--border-color)] p-7 flex flex-col shadow-lg border-t-white/10 relative">
                <div className="absolute top-0 right-0 w-6 h-6 opacity-10 border-t border-r border-white pointer-events-none"></div>
                <h3 className="text-[11px] font-black tracking-[0.1em] mb-4 uppercase text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-3">Operator Task</h3>
                <p className="text-[11.5px] text-[var(--text-secondary)] font-medium leading-relaxed mb-8">
                  Verify technical alignment for {activeDeliverableCode.split('-')[0]}. Ensure all discipline-specific parameters meet the project coordination requirements.
                </p>
                <div className="mt-auto space-y-2.5">
                  <button className="w-full py-3.5 bg-[var(--bg-panel)]/50 border border-[var(--border-color)] rounded-lg text-[9px] font-black tracking-[0.2em] uppercase hover:text-[var(--accent-blue)] transition-all active:scale-95 shadow-sm">
                    ATTACH DATA
                  </button>
                  <button className="w-full py-3.5 bg-[var(--accent-blue)] text-white rounded-lg font-black text-[9px] tracking-[0.2em] uppercase shadow-lg shadow-blue-900/50 hover:bg-blue-600 transition-all active:scale-95">
                    APPROVE NODE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE TOGGLE - Shared position with ChatView */}
      <div className="mt-auto pb-10 pt-4 px-10 z-20 w-full">
        <div className="max-w-4xl mx-auto flex justify-end">
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
      </div>
    </div>
  );
};

export default NodeContextView;
