import React, { useState, useEffect, memo, useCallback } from 'react';
import { Project, deliverablesMap } from '../../data';
import { useAuth } from '../../context/AuthContext';
import { Department, Role } from '../../types';
import { getProjectTeamByDepartment, DepartmentTeam } from '../../lib/supabase';

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
  const [departmentTeams, setDepartmentTeams] = useState<DepartmentTeam[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  
  // Check if user can manage team (PM department, HOD role, ADMIN, or HEAD_SES)
  const canManageTeam = user?.department === Department.PROJECT_MANAGEMENT || 
    user?.role === Role.HOD || 
    user?.role === Role.ADMIN || 
    user?.role === Role.HEAD_SES;
  
  // PM, ADMIN, or HEAD_SES can edit team assignments
  const canEditTeam = user?.department === Department.PROJECT_MANAGEMENT || 
    user?.role === Role.ADMIN || 
    user?.role === Role.HEAD_SES;
  
  // Fetch department teams when project changes
  const fetchTeams = useCallback(async () => {
    if (!activeProject.id) return;
    
    setIsLoadingTeam(true);
    try {
      const teams = await getProjectTeamByDepartment(activeProject.id);
      setDepartmentTeams(teams);
      // Auto-expand all departments initially
      setExpandedDepts(new Set(teams.map(t => t.discipline)));
    } catch (error) {
      console.error('Error fetching department teams:', error);
    } finally {
      setIsLoadingTeam(false);
    }
  }, [activeProject.id]);

  // Handle 2-minute delay for newly created projects
  useEffect(() => {
    // For existing projects (not newly created), always show the team node
    if (!newProjectData || newProjectData.id !== activeProject.id) {
      setShowTeamNode(true);
      fetchTeams();
      return;
    }
    
    // For newly created project, check if 2 minutes have passed
    const elapsed = Date.now() - newProjectData.createdAt;
    
    if (elapsed >= TWO_MINUTES_MS) {
      setShowTeamNode(true);
      fetchTeams();
      return;
    }
    
    // Set timeout for remaining time
    const remaining = TWO_MINUTES_MS - elapsed;
    const timer = setTimeout(() => {
      setShowTeamNode(true);
      fetchTeams();
    }, remaining);
    
    return () => clearTimeout(timer);
  }, [newProjectData, activeProject.id, fetchTeams]);

  // Toggle department expansion
  const toggleDept = useCallback((discipline: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(discipline)) {
        next.delete(discipline);
      } else {
        next.add(discipline);
      }
      return next;
    });
  }, []);
  
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
          <div className="relative z-10 mb-8 w-full max-w-[280px]">
            {/* Team Assignment Header with Manage Button */}
            <div 
              className={`bg-[var(--bg-panel)] border border-[var(--border-color)] px-5 py-4 flex flex-col transition-all duration-300 relative border-l-[3px] border-l-amber-500/50 ${canEditTeam ? 'cursor-pointer hover:border-amber-500 hover:shadow-lg hover:-translate-y-0.5 hover:border-l-amber-500' : ''}`}
              onClick={canEditTeam ? handleTeamNodeClick : undefined}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                  Team_Assignment
                </span>
                {canEditTeam && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-[7px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                      Manage
                    </span>
                  </div>
                )}
              </div>
              {/* Description */}
              <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                Project Team
              </h3>
              <p className="text-[8px] font-medium text-[var(--text-muted)] mt-1">
                {departmentTeams.length} departments assigned
              </p>
            </div>

            {/* Department Branches */}
            {isLoadingTeam ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : departmentTeams.length > 0 ? (
              <div className="mt-4 ml-4 border-l-2 border-[var(--border-color)] pl-4 space-y-3">
                {departmentTeams.map((dept) => (
                  <div key={dept.discipline} className="relative">
                    {/* Connection Line */}
                    <div className="absolute -left-[18px] top-3 w-4 h-[2px] bg-[var(--border-color)]"></div>
                    
                    {/* Department Header */}
                    <div 
                      className="bg-[var(--bg-panel)] border border-[var(--border-color)] px-4 py-2.5 cursor-pointer transition-all hover:border-[var(--accent-blue)]/50"
                      onClick={() => toggleDept(dept.discipline)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg 
                            className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${expandedDepts.has(dept.discipline) ? 'rotate-90' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-wider">
                            {dept.displayName}
                          </span>
                        </div>
                        <span className="text-[7px] font-bold text-[var(--text-muted)] bg-[var(--bg-sidebar)] px-1.5 py-0.5 rounded">
                          {(dept.hod ? 1 : 0) + dept.members.length}
                        </span>
                      </div>
                    </div>

                    {/* Team Members (HOD + Members) */}
                    {expandedDepts.has(dept.discipline) && (
                      <div className="ml-4 mt-2 border-l border-[var(--border-color)]/50 pl-3 space-y-1.5">
                        {/* HOD */}
                        {dept.hod && (
                          <div className="relative flex items-center gap-2 py-1.5 px-2 bg-amber-500/5 rounded">
                            <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-3 h-[1px] bg-[var(--border-color)]/50"></div>
                            <span className="text-[6px] font-black text-amber-600 bg-amber-500/20 px-1.5 py-0.5 rounded uppercase">
                              {dept.hod.designation_code === 'PM' ? 'PM' : 'HOD'}
                            </span>
                            <span className="text-[9px] font-bold text-[var(--text-primary)]">
                              {dept.hod.name}
                            </span>
                          </div>
                        )}
                        {/* Team Members */}
                        {dept.members.map((member) => (
                          <div key={member.participant_id} className="relative flex items-center gap-2 py-1.5 px-2 hover:bg-[var(--bg-panel)] rounded">
                            <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-3 h-[1px] bg-[var(--border-color)]/50"></div>
                            <span className="text-[6px] font-black text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">
                              Team
                            </span>
                            <span className="text-[9px] font-medium text-[var(--text-secondary)]">
                              {member.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 ml-4 text-[8px] text-[var(--text-muted)] italic">
                No team assigned yet
              </div>
            )}
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
