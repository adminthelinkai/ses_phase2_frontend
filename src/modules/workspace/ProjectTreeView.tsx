import React from 'react';
import { Project, deliverablesMap } from '../../data';

interface ProjectTreeViewProps {
  projects: Project[];
  activeProject: Project;
  onProjectSelect: (project: Project) => void;
  onDeliverableSelect: (deliverableId: string) => void;
}

const ProjectTreeView: React.FC<ProjectTreeViewProps> = ({ 
  activeProject, 
  onDeliverableSelect 
}) => {
  // Only show the active project's structure
  const deliverables = deliverablesMap[activeProject.id] || [];
  
  // Group deliverables by department
  const deptMap: Record<string, typeof deliverables> = {};
  deliverables.forEach(d => {
    const dept = d.code.split('-')[0];
    if (!deptMap[dept]) deptMap[dept] = [];
    deptMap[dept].push(d);
  });
  
  const departments = Object.keys(deptMap);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar px-6 py-10 relative">
      <div className="flex flex-col items-center w-full max-w-sm mx-auto relative">
        
        {/* VERTICAL SPINE - Connecting all nodes */}
        <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[var(--accent-blue)] via-[var(--accent-blue)]/30 to-transparent z-0"></div>

        {/* PROJECT ROOT - Level 0 */}
        <div className="relative z-10 mb-16 group">
          <div className="w-56 h-24 bg-[var(--accent-blue)] border-2 border-[var(--accent-blue)] rounded-3xl shadow-[0_0_30px_rgba(31,93,142,0.3)] flex flex-col items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(31,93,142,0.5)] group-hover:-translate-y-1">
            <span className="text-[9px] font-black tracking-[0.4em] text-blue-100/60 mb-1 uppercase">Project_Root</span>
            <span className="text-[15px] font-black text-white uppercase tracking-tight">{activeProject.id}</span>
            <div className="text-[10px] text-blue-100/40 font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Active Context</div>
          </div>
        </div>

        {/* FLOW BODY */}
        <div className="w-full flex flex-col items-center gap-12 relative z-10">
          {departments.map((dept, dIdx) => (
            <React.Fragment key={dept}>
              {/* DEPARTMENT NODE - Level 1 */}
              <div className="flex flex-col items-center w-full group">
                <div className="w-40 h-12 bg-[var(--bg-panel)] border-2 border-[var(--accent-blue)]/50 rounded-2xl shadow-xl flex items-center justify-center relative z-20 transition-all duration-300 group-hover:border-[var(--accent-blue)] group-hover:shadow-blue-900/20 group-hover:-translate-y-0.5">
                  <span className="text-[11px] font-black text-[var(--text-primary)] tracking-[0.3em] uppercase">{dept}</span>
                </div>

                {/* DELIVERABLES - Level 2 */}
                <div className="flex flex-col gap-4 mt-8 w-full items-center">
                  {deptMap[dept].map((deliv) => (
                    <div 
                      key={deliv.id}
                      onClick={() => onDeliverableSelect(deliv.id)}
                      className="w-full max-w-[280px] group/deliv cursor-pointer"
                    >
                      <div className="bg-[var(--bg-panel)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-2xl p-4 flex flex-col transition-all duration-300 hover:border-[var(--accent-blue)] hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
                        {/* Status Indicator Bar */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 transition-all ${
                          deliv.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                          deliv.status === 'active' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse' : 'bg-slate-500'
                        }`}></div>

                        <div className="flex items-center justify-between mb-2 pl-2">
                          <span className="text-[8px] font-mono font-black text-[var(--accent-blue)] uppercase tracking-widest">{deliv.code}</span>
                          <div className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            deliv.status === 'completed' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' :
                            deliv.status === 'active' ? 'text-blue-500 border-blue-500/30 bg-blue-500/5' : 'text-slate-500 border-slate-500/30'
                          }`}>
                            {deliv.status}
                          </div>
                        </div>
                        <div className="text-[11px] font-black text-[var(--text-primary)] uppercase leading-tight pl-2 group-hover/deliv:text-[var(--accent-blue)] transition-colors">
                          {deliv.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* FLOW END MARKER */}
        <div className="mt-16 mb-10 w-3 h-3 rounded-full border-2 border-[var(--accent-blue)]/30 relative">
          <div className="absolute inset-0 bg-[var(--accent-blue)]/10 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTreeView;
