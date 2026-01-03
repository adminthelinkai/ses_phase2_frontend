import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { Project, deliverablesMap } from '../../data';
import { useAuth } from '../../context/AuthContext';
import { Department, Role } from '../../types';
import { getProjectTeamByDepartment, DepartmentTeam, supabase } from '../../lib/supabase';

interface ProjectTreeViewProps {
  projects: Project[];
  activeProject: Project;
  onProjectSelect: (project: Project) => void;
  onDeliverableSelect: (deliverableId: string) => void;
  onTeamNodeClick?: (projectId: string, projectName: string) => void;
  onTeamMemberClick?: (projectId: string, projectName: string, discipline: string) => void;
  onProjectEditClick?: (projectId: string) => void;
  newProjectData?: { id: string; createdAt: number } | null;
  teamRefreshTrigger?: number;
  hodRefreshTrigger?: number;
}

// 40 seconds in milliseconds (wait time for backend team assignment)
const FORTY_SECONDS_MS = 40 * 1000;

// Department color mapping for visual distinction
const DEPT_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  'PROJECT': { border: 'border-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  'PROCESS': { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  'MECHANICAL': { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  'CIVIL': { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  'ELECTRICAL': { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  'INSTRUMENT': { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  'HSE': { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
};

const DEFAULT_DEPT_COLOR = { border: 'border-gray-500', bg: 'bg-gray-500/10', text: 'text-gray-400' };

const ProjectTreeView: React.FC<ProjectTreeViewProps> = memo(({ 
  activeProject, 
  onDeliverableSelect,
  onTeamNodeClick,
  onTeamMemberClick,
  onProjectEditClick,
  newProjectData,
  teamRefreshTrigger,
  hodRefreshTrigger,
}) => {
  const { user } = useAuth();
  const [showTeamNode, setShowTeamNode] = useState(false);
  const [departmentTeams, setDepartmentTeams] = useState<DepartmentTeam[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isWaitingForTeamAssignment, setIsWaitingForTeamAssignment] = useState(false);
  const channelRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
    } catch (error) {
      console.error('Error fetching department teams:', error);
    } finally {
      setIsLoadingTeam(false);
    }
  }, [activeProject.id]);

  // Handle 40-second delay for newly created projects (backend team assignment)
  useEffect(() => {
    // For existing projects (not newly created), always show the team node
    if (!newProjectData || newProjectData.id !== activeProject.id) {
      setShowTeamNode(true);
      setIsWaitingForTeamAssignment(false);
      fetchTeams();
      return;
    }
    
    // For newly created project, check if 40 seconds have passed
    const elapsed = Date.now() - newProjectData.createdAt;
    
    if (elapsed >= FORTY_SECONDS_MS) {
      setShowTeamNode(true);
      setIsWaitingForTeamAssignment(false);
      fetchTeams();
      return;
    }
    
    // Still waiting - show loading state
    setIsWaitingForTeamAssignment(true);
    setShowTeamNode(false);
    
    // Set timeout for remaining time
    const remaining = FORTY_SECONDS_MS - elapsed;
    const timer = setTimeout(() => {
      setShowTeamNode(true);
      setIsWaitingForTeamAssignment(false);
      fetchTeams();
    }, remaining);
    
    return () => clearTimeout(timer);
  }, [newProjectData, activeProject.id, fetchTeams]);
  
  // Refetch team data when refresh trigger changes (after team member assignments are saved)
  useEffect(() => {
    if (teamRefreshTrigger !== undefined && teamRefreshTrigger > 0 && showTeamNode) {
      fetchTeams();
    }
  }, [teamRefreshTrigger, fetchTeams, showTeamNode]);

  // Refetch team data when HOD refresh trigger changes (after HOD assignments are saved)
  useEffect(() => {
    if (hodRefreshTrigger !== undefined && hodRefreshTrigger > 0 && showTeamNode) {
      fetchTeams();
    }
  }, [hodRefreshTrigger, fetchTeams, showTeamNode]);

  // Debounced handler for realtime updates
  const handleRealtimeUpdate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (showTeamNode && activeProject.id) {
        console.log('[ProjectTreeView] Real-time update detected, refreshing team data');
        fetchTeams();
      }
    }, 1000); // 1 second debounce to avoid excessive updates
  }, [fetchTeams, showTeamNode, activeProject.id]);

  // Set up real-time subscription for participant_project_assignments
  useEffect(() => {
    if (!activeProject.id) {
      return;
    }

    // Clean up existing subscription if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new subscription channel for this project
    const channel = supabase
      .channel(`project_assignments:${activeProject.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'participant_project_assignments',
          filter: `project_id=eq.${activeProject.id}`,
        },
        (payload) => {
          console.log('[ProjectTreeView] Real-time database change:', payload);
          handleRealtimeUpdate();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[ProjectTreeView] Successfully subscribed to real-time updates for project:', activeProject.id);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[ProjectTreeView] Error subscribing to real-time updates');
        }
      });

    channelRef.current = channel;

    // Cleanup subscription on unmount or project change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [activeProject.id, handleRealtimeUpdate]);
  
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

  // Check if current user is HOD of a specific department
  const isCurrentUserHODOfDepartment = useCallback((hodParticipantId: string | null | undefined): boolean => {
    if (!user?.participantId || !hodParticipantId) return false;
    return user.participantId === hodParticipantId;
  }, [user?.participantId]);

  return (
    <div className="px-4 py-10 relative min-h-full overflow-x-auto">
      <div className="flex flex-col items-center w-full relative">

        {/* PROJECT ROOT - Level 0 */}
        <div className="relative z-10 group w-full max-w-[280px]">
          <div 
            onClick={() => onProjectEditClick?.(activeProject.id)}
            className={`bg-[var(--bg-panel)] border-2 border-amber-500/60 rounded-lg px-5 py-4 flex flex-col transition-all duration-300 hover:border-amber-500 hover:shadow-lg hover:-translate-y-0.5 relative ${
              onProjectEditClick ? 'cursor-pointer' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-mono font-bold text-amber-500/70 uppercase tracking-[0.2em]">
                Project_Root
              </span>
              <span className="text-[7px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                Active
              </span>
            </div>
            {/* Project Name */}
            <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest group-hover:text-amber-500 transition-colors">
              {activeProject.name}
            </h3>
          </div>
        </div>

        {/* Connecting line from PROJECT ROOT to TEAM/LOADING */}
        {canManageTeam && (showTeamNode || isWaitingForTeamAssignment) && (
          <div className="w-[2px] h-8 bg-amber-500/50 z-10"></div>
        )}

        {/* Loading State - Show during 40-second wait for newly created projects */}
        {canManageTeam && isWaitingForTeamAssignment && (
          <div className="relative z-10 mb-8 w-full">
            {/* Loading Box - matches PROJECT TEAM styling */}
            <div className="mx-auto w-fit bg-[var(--bg-panel)] border-2 border-amber-500 rounded-lg px-6 py-4 flex flex-col items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">
                  Assigning Team...
                </span>
              </div>
              <span className="text-[8px] text-[var(--text-muted)] mt-2 text-center max-w-[200px]">
                Please wait while teams are being assigned (40 seconds)
              </span>
            </div>
          </div>
        )}

        {/* TEAM FLOW DIAGRAM - Below PROJECT_ROOT, visible to PM/HOD only */}
        {canManageTeam && showTeamNode && (
          <div className="relative z-10 mb-8 w-full">
            {/* PROJECT TEAM Header Box */}
            <div 
              className={`mx-auto w-fit bg-[var(--bg-panel)] border-2 border-amber-500 rounded-lg px-6 py-3 flex flex-col items-center transition-all duration-300 ${canEditTeam ? 'cursor-pointer hover:bg-amber-500/10 hover:shadow-lg' : ''}`}
              onClick={canEditTeam ? handleTeamNodeClick : undefined}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">
                  Project Team
                </span>
                {canEditTeam && (
                  <svg className="w-3 h-3 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </div>
              <span className="text-[8px] text-[var(--text-muted)] mt-1">
                {departmentTeams.length} departments
              </span>
            </div>

            {/* Connecting Line from Header */}
            <div className="flex justify-center">
              <div className="w-[2px] h-6 bg-amber-500/50"></div>
            </div>

            {/* Flow Diagram Content */}
            {isLoadingTeam ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : departmentTeams.length > 0 ? (
              <div className="relative w-full">
                {/* Scrollable container for departments */}
                <div className="overflow-x-auto pb-2">
                  <div className={`flex flex-row gap-3 ${departmentTeams.length === 1 ? 'justify-center' : 'justify-center'}`}>
                    {departmentTeams.map((dept, index) => {
                      const colors = DEPT_COLORS[dept.discipline] || DEFAULT_DEPT_COLOR;
                      const isOnlyOne = departmentTeams.length === 1;
                      const isFirst = index === 0;
                      const isLast = index === departmentTeams.length - 1;
                      
                      return (
                        <div key={dept.discipline} className="flex flex-col items-center flex-shrink-0" style={{ width: '110px' }}>
                          {/* Connecting lines - only show horizontal when multiple departments */}
                          <div className="relative w-full h-4">
                            {/* Horizontal line - only for multiple departments */}
                            {!isOnlyOne && (
                              <div className={`absolute top-0 h-[2px] bg-amber-500/40 ${isFirst ? 'left-1/2 right-0' : isLast ? 'left-0 right-1/2' : 'left-0 right-0'}`}></div>
                            )}
                            {/* Vertical connector from horizontal bar to department */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-amber-500/40"></div>
                          </div>
                          
                          {/* Department Box */}
                          <div className={`${colors.bg} border-2 ${colors.border} rounded-lg px-3 py-2 text-center w-full`}>
                            <span className={`text-[8px] font-black uppercase tracking-wider ${colors.text} leading-tight block`}>
                              {dept.displayName}
                            </span>
                          </div>
                          
                          {/* Vertical line from department to HOD */}
                          <div className={`w-[2px] h-3 ${colors.border.replace('border-', 'bg-')}/40`}></div>
                          
                          {/* HOD Box */}
                          {dept.hod ? (
                            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg px-2 py-2 text-center w-full mb-1">
                              <span className="block text-[6px] font-black text-amber-600 bg-amber-500/20 px-1.5 py-0.5 rounded uppercase mx-auto w-fit mb-1">
                                {dept.hod.designation_code === 'PM' ? 'PM' : 'HOD'}
                              </span>
                              <span className="block text-[8px] font-bold text-[var(--text-primary)] truncate" title={dept.hod.name}>
                                {dept.hod.name}
                              </span>
                            </div>
                          ) : (
                            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg px-2 py-2 text-center w-full mb-1">
                              <span className="text-[7px] text-[var(--text-muted)] italic">
                                Not Assigned
                              </span>
                            </div>
                          )}
                          
                          {/* Team Members - Show if HOD exists and has team members */}
                          {dept.hod && dept.members.length > 0 && (
                            <>
                              {/* Vertical line from HOD to team members */}
                              <div className={`w-[2px] h-2 ${colors.border.replace('border-', 'bg-')}/30`}></div>
                              
                              {/* Team Members Container */}
                              <div className="w-full flex flex-col gap-1">
                                {dept.members.slice(0, 3).map((member) => (
                                  <div 
                                    key={member.participant_id} 
                                    className={`bg-[var(--bg-panel)] border border-[var(--border-color)]/50 rounded px-1.5 py-1 text-center w-full ${
                                      isCurrentUserHODOfDepartment(dept.hod?.participant_id)
                                        ? 'cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all'
                                        : ''
                                    }`}
                                    onClick={() => {
                                      if (isCurrentUserHODOfDepartment(dept.hod?.participant_id) && onTeamMemberClick) {
                                        onTeamMemberClick(activeProject.id, activeProject.name, dept.discipline);
                                      }
                                    }}
                                    title={isCurrentUserHODOfDepartment(dept.hod?.participant_id) ? 'Click to manage team members' : undefined}
                                  >
                                    <span className="block text-[7px] font-medium text-[var(--text-secondary)] truncate" title={member.name}>
                                      {member.name}
                                    </span>
                                  </div>
                                ))}
                                {/* Show count if more than 3 members - also clickable if user is HOD */}
                                {dept.members.length > 3 && (
                                  <div 
                                    className={`text-[6px] text-[var(--text-muted)] text-center ${
                                      isCurrentUserHODOfDepartment(dept.hod?.participant_id)
                                        ? 'cursor-pointer hover:text-blue-500 transition-colors'
                                        : ''
                                    }`}
                                    onClick={() => {
                                      if (isCurrentUserHODOfDepartment(dept.hod?.participant_id) && onTeamMemberClick) {
                                        onTeamMemberClick(activeProject.id, activeProject.name, dept.discipline);
                                      }
                                    }}
                                  >
                                    +{dept.members.length - 3} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Scroll indicator if many departments */}
                {departmentTeams.length > 4 && (
                  <div className="text-center mt-1">
                    <span className="text-[7px] text-[var(--text-muted)]">← scroll →</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-[9px] text-[var(--text-muted)] italic">
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
