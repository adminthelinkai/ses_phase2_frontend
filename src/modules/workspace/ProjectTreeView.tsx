import React, { useState, useEffect, memo } from 'react';
import { Project, deliverablesMap } from '../../data';
import { useAuth } from '../../context/AuthContext';
import { Department, Role } from '../../types';

interface ProjectTreeViewProps {
  projects: Project[];
  activeProject: Project;
  onProjectSelect: (project: Project) => void;
  onDeliverableSelect: (deliverableId: string) => void;
  onTeamNodeClick?: (projectId: string, projectName: string) => void;
  newProjectData?: { id: string; createdAt: number } | null;
}

// 2 minutes in milliseconds
const TWO_MINUTES_MS = 2 * 60 * 1000;

const ProjectTreeView: React.FC<ProjectTreeViewProps> = memo(({ 
  activeProject, 
  onDeliverableSelect,
  onTeamNodeClick,
  newProjectData,
}) => {
  const { user } = useAuth();
  const [showTeamNode, setShowTeamNode] = useState(false);
  
  // Check if user can manage team (PM department or HOD role)
  const canManageTeam = user?.department === Department.PROJECT_MANAGEMENT || user?.role === Role.HOD;
  
  // Handle 2-minute delay for newly created projects
  useEffect(() => {
    // For existing projects (not newly created), always show the team node
    if (!newProjectData || newProjectData.id !== activeProject.id) {
      setShowTeamNode(true);
      return;
    }
    
    // For newly created project, check if 2 minutes have passed
    const elapsed = Date.now() - newProjectData.createdAt;
    
    if (elapsed >= TWO_MINUTES_MS) {
      setShowTeamNode(true);
      return;
    }
    
    // Set timeout for remaining time
    const remaining = TWO_MINUTES_MS - elapsed;
    const timer = setTimeout(() => {
      setShowTeamNode(true);
    }, remaining);
    
    return () => clearTimeout(timer);
  }, [newProjectData, activeProject.id]);
  
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
  
  // Handle team node click
  const handleTeamNodeClick = () => {
    if (onTeamNodeClick) {
      onTeamNodeClick(activeProject.id, activeProject.name);
    }
  };

  return (
    <div className="px-6 py-10 relative min-h-full">
      <div className="flex flex-col items-center w-full max-w-sm mx-auto relative">
        
        {/* VERTICAL SPINE - Connecting all nodes */}
        <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[var(--accent-blue)] via-[var(--accent-blue)]/30 to-transparent z-0"></div>

        {/* PROJECT ROOT - Level 0 */}
        <div className="relative z-10 mb-16 group w-full max-w-[280px]">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] px-5 py-4 flex flex-col transition-all duration-300 hover:border-[var(--accent-blue)] hover:shadow-lg hover:-translate-y-0.5 relative border-l-[3px] border-l-[var(--accent-blue)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                Project_Root
              </span>
              <span className="text-[7px] font-mono font-bold text-[var(--accent-blue)] uppercase tracking-widest">
                Active
              </span>
            </div>
            {/* Project Name */}
            <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest group-hover:text-[var(--accent-blue)] transition-colors">
              {activeProject.name}
            </h3>
          </div>
        </div>

        {/* TEAM ASSIGNMENT NODE - Below PROJECT_ROOT, visible to PM/HOD only */}
        {canManageTeam && showTeamNode && (
          <div 
            className="relative z-10 mb-16 group w-full max-w-[280px] cursor-pointer"
            onClick={handleTeamNodeClick}
          >
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] px-5 py-4 flex flex-col transition-all duration-300 hover:border-amber-500 hover:shadow-lg hover:-translate-y-0.5 relative border-l-[3px] border-l-amber-500/50 hover:border-l-amber-500">
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                  Team_Assignment
                </span>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-[7px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                    Manage
                  </span>
                </div>
              </div>
              {/* Description */}
              <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                Assigned HODs
              </h3>
              <p className="text-[8px] font-medium text-[var(--text-muted)] mt-1">
                Click to view/edit team
              </p>
            </div>
          </div>
        )}

        {/* FLOW BODY */}
        <div className="w-full flex flex-col items-center gap-12 relative z-10">
          {departments.map((dept, dIdx) => (
            <React.Fragment key={dept}>
              {/* DEPARTMENT NODE - Level 1 */}
              <div className="flex flex-col items-center w-full group">
                <div className="w-full max-w-[280px] bg-[var(--bg-panel)] border border-[var(--border-color)] px-5 py-3 flex flex-col transition-all duration-300 hover:border-[var(--accent-blue)] hover:shadow-lg relative border-l-[3px] border-l-[var(--accent-blue)]/50 hover:border-l-[var(--accent-blue)]">
                  <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Department</span>
                  <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">{dept}</span>
                </div>

                {/* DELIVERABLES - Level 2 */}
                <div className="flex flex-col gap-4 mt-8 w-full items-center">
                  {deptMap[dept].map((deliv, idx) => (
                    <div 
                      key={deliv.id}
                      onClick={() => onDeliverableSelect(deliv.id)}
                      className="w-full max-w-[280px] group/deliv cursor-pointer"
                    >
                      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] px-5 py-4 flex flex-col transition-all duration-300 hover:border-[var(--accent-blue)] hover:shadow-lg hover:-translate-y-0.5 relative border-l-[3px] border-l-[var(--accent-blue)]/30 hover:border-l-[var(--accent-blue)]">
                        {/* Header with code and status */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                            S-{(idx + 1).toString().padStart(2, '0')}
                          </span>
                          {deliv.status === 'completed' && (
                            <span className="text-[7px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">
                              Verified
                            </span>
                          )}
                          {deliv.status === 'active' && (
                            <span className="text-[7px] font-mono font-bold text-[var(--accent-blue)] uppercase tracking-widest">
                              Active
                            </span>
                          )}
                          {deliv.status === 'pending' && (
                            <span className="text-[7px] font-mono font-bold text-[var(--text-muted)]/50 uppercase tracking-widest">
                              Pending
                            </span>
                          )}
                        </div>
                        {/* Deliverable Name */}
                        <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest group-hover/deliv:text-[var(--accent-blue)] transition-colors">
                          {deliv.name}
                        </h3>
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
});

ProjectTreeView.displayName = 'ProjectTreeView';

export default ProjectTreeView;
