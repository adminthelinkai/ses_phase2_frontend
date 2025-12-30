import React from 'react';

interface NodeContextViewProps {
  activeNodeId: string;
  activeDeliverableCode: string;
  backgroundClass?: string;
}

const NodeContextView: React.FC<NodeContextViewProps> = ({ activeNodeId, activeDeliverableCode, backgroundClass = 'bg-dot-grid' }) => {
  const nodes = [
    { id: 'geometrysplit', name: 'GEOMETRY SPLIT', status: 'completed', type: 'split' },
    { id: 'materialspec', name: 'MATERIAL SPEC', status: 'completed', type: 'doc' },
    { id: 'interimreview', name: 'INTERIM REVIEW', status: 'in_progress', type: 'form' },
    { id: 'electricalreview', name: 'ELECTRICAL REVIEW', status: 'blocked', type: 'approval' },
    { id: 'finalapproval', name: 'FINAL APPROVAL', status: 'pending', type: 'approval' },
    { id: 'diagram', name: 'SLD FINALISATION', status: 'completed', type: 'doc' },
    { id: 'loadcalc', name: 'LOAD SCHEDULE', status: 'in_progress', type: 'calc' },
    { id: 'datasheet', name: 'PROCESS DATASHEET', status: 'completed', type: 'doc' },
    { id: 'loopdiag', name: 'LOOP DIAGRAM', status: 'completed', type: 'doc' }
  ];

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto items-center py-10 relative transition-colors">
      {/* Dynamic Technical Pattern Foundation */}
      <div className={`absolute inset-0 ${backgroundClass} ${(backgroundClass === 'bg-bricks' || backgroundClass === 'bg-dept-csa') ? 'opacity-70' : 'opacity-40'} pointer-events-none transition-all duration-700`}></div>
      
      {/* Supplemental Subtle Overlay for CSA/Brick Pattern */}
      {(backgroundClass === 'bg-bricks' || backgroundClass === 'bg-dept-csa') && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_90%)] opacity-50 pointer-events-none"></div>
      )}
      
      {/* Scattered Detailed Blueprint Accents */}
      <div className="crosshair top-16 right-[22%]"></div>
      <div className="crosshair bottom-36 left-[18%]"></div>
      <div className="crosshair top-[55%] left-[6%]"></div>
      
      <div className="dimension-tick top-[180px] left-[80px] opacity-40"></div>
      <div className="dimension-tick bottom-[220px] right-[120px] opacity-40 rotate-180"></div>
      
      <div className="blueprint-mark w-10 h-10 top-12 left-[42%] opacity-30 border-t-2 border-l-2 border-[var(--accent-blue)]"></div>
      
      <div className="rebar-mark top-[12%] right-[8%]"></div>
      <div className="rebar-mark bottom-[15%] left-[5%]"></div>

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
    </div>
  );
};

export default NodeContextView;