import React, { useState, useCallback, lazy, Suspense } from 'react';
import { NodeItem, DeliverableItem, Project } from '../../data';
import { useAuth } from '../../context/AuthContext';
import { Department, Role } from '../../types';

// Lazy load components for code splitting
const ProjectTreeView = lazy(() => import('./ProjectTreeView'));
const PanZoomCanvas = lazy(() => import('../../components/canvas'));
const HODAssignmentModal = lazy(() => import('../projects/HODAssignmentModal'));

interface RightSidebarProps {
  width: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeDeliverable?: DeliverableItem;
  nodes: NodeItem[];
  activeNodeId: string | null;
  onNodeSelect: (id: string) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  // New props for project tree
  projects: Project[];
  activeProject: Project;
  onProjectSelect: (project: Project) => void;
  onDeliverableSelect: (deliverableId: string) => void;
  // New project data for 2-min delay on team assignment node
  newProjectData?: { id: string; createdAt: number } | null;
}

const RightSidebar: React.FC<RightSidebarProps> = (props) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'project' | 'deliverable'>('deliverable');
  const [hodModalProject, setHodModalProject] = useState<{ id: string; name: string } | null>(null);
  
  const completedCount = props.nodes.filter(n => n.status === 'completed').length;
  const progressPercent = props.nodes.length > 0 ? (completedCount / props.nodes.length) * 100 : 0;

  // Only show toggle for Project Management department or HOD role
  const canToggleViews = user?.department === Department.PROJECT_MANAGEMENT || user?.role === Role.HOD;

  // Only PM (Project Management department) can edit HOD assignments
  const canEditHODs = user?.department === Department.PROJECT_MANAGEMENT;

  // Handle team node click - open HOD assignment modal
  const handleTeamNodeClick = useCallback((projectId: string, projectName: string) => {
    setHodModalProject({ id: projectId, name: projectName });
  }, []);

  // Close HOD modal
  const handleCloseHodModal = useCallback(() => {
    setHodModalProject(null);
  }, []);

  const commands = [
    { id: 'add', icon: <path d="M12 4v16m8-8H4" />, color: '#3b82f6', label: 'ADD SUBSTEP' },
    { id: 'team', icon: <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />, color: '#a855f7', label: 'ASSIGN' },
    { id: 'doc', icon: <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />, color: '#10b981', label: 'ATTACH' },
    { id: 'intel', icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" />, color: '#f59e0b', label: 'ANALYZE' }
  ];

  return (
    <aside style={{ width: props.width }} className="bg-[var(--bg-sidebar)] border-l border-[var(--border-color)] flex flex-col relative shrink-0 transition-all duration-300">
      {!props.isCollapsed && (
      <div onMouseDown={props.onResizeStart} className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize hover:bg-[var(--accent-blue)]/10 transition-colors group z-50 flex justify-center">
        <div className="w-0.5 h-full bg-transparent group-hover:bg-[var(--accent-blue)] transition-colors relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-10 bg-[var(--border-color)] group-hover:bg-[var(--accent-blue)] rounded-full shadow-sm"></div>
        </div>
      </div>
      )}
      
      {!props.isCollapsed ? (
        <>
      <div className="h-20 border-b border-[var(--border-color)] flex items-center px-8 shrink-0 relative bg-[var(--bg-panel)]/40 backdrop-blur-sm overflow-hidden">
        {/* Technical Header Decoration */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-5 border-t-2 border-r-2 border-[var(--accent-blue)] pointer-events-none"></div>
        <div className="absolute top-4 left-0 w-1 h-8 bg-[var(--accent-blue)] opacity-40"></div>
        
        <div className="flex flex-col relative z-10 w-full">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] animate-pulse"></div>
              <span className="text-[8px] font-black text-[var(--text-muted)] tracking-[0.4em] uppercase">
                {viewMode === 'deliverable' ? 'Operational Context' : 'Structural Hierarchy'}
              </span>
            </div>
            
            {/* View Toggle Buttons - Only for PM department or HOD role */}
            {canToggleViews && (
              <div className="flex bg-[var(--bg-sidebar)]/60 p-0.5 rounded-md border border-[var(--border-color)]">
                <button 
                  onClick={() => setViewMode('project')}
                  className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest transition-all ${
                    viewMode === 'project' 
                      ? 'bg-[var(--accent-blue)] text-white shadow-sm' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Project
                </button>
                <button 
                  onClick={() => setViewMode('deliverable')}
                  className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest transition-all ${
                    viewMode === 'deliverable' 
                      ? 'bg-[var(--accent-blue)] text-white shadow-sm' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Deliv
                </button>
              </div>
            )}
          </div>
          <h2 className="text-[15px] font-black uppercase tracking-tight text-[var(--text-primary)] leading-tight truncate">
            {viewMode === 'deliverable' 
              ? (props.activeDeliverable?.name || 'SELECT DELIVERABLE')
              : props.activeProject.name}
          </h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          {viewMode === 'project' ? (
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <PanZoomCanvas className="h-full w-full" minScale={0.5} maxScale={2.0} initialScale={1}>
                <ProjectTreeView 
                  projects={props.projects}
                  activeProject={props.activeProject}
                  onProjectSelect={props.onProjectSelect}
                  onDeliverableSelect={(id) => {
                    props.onDeliverableSelect(id);
                    setViewMode('deliverable');
                  }}
                  onTeamNodeClick={handleTeamNodeClick}
                  newProjectData={props.newProjectData}
                />
              </PanZoomCanvas>
            </Suspense>
          ) : (
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <PanZoomCanvas className="h-full w-full" minScale={0.5} maxScale={2.0} initialScale={1}>
                <div className="px-10 pb-12 pt-8 relative">
                  <div className="relative">
                    {/* Technical Vertical Axis */}
                    <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[var(--text-muted)] opacity-40 z-0"></div>
                    
                    <div className="space-y-12">
                      {props.nodes.map((node, i) => {
                        const isActive = props.activeNodeId === node.id;
                        const isCompleted = node.status === 'completed';
                        
                        return (
                          <div key={node.id} className="relative pl-12 group">
                            {/* Technical Node Marker */}
                            <div className={`absolute left-[0px] top-[14px] w-[15px] h-[15px] z-20 transition-all duration-500 flex items-center justify-center bg-[var(--bg-sidebar)]`}>
                              <div className={`w-full h-full border-2 transition-all duration-500 ${
                                isActive 
                                  ? 'border-[var(--accent-blue)] rotate-45 scale-110 shadow-[0_0_10px_var(--accent-blue)]' 
                                  : isCompleted
                                  ? 'border-[var(--text-muted)] scale-90 opacity-100'
                                  : 'border-[var(--text-muted)] scale-75 opacity-60'
                              }`}></div>
                              {isActive && <div className="absolute w-1 h-1 bg-[var(--accent-blue)] animate-pulse"></div>}
                            </div>
                    
                            <div className="flex flex-col items-start gap-3">
                              {/* Redesigned Engineering Node Card */}
                              <div 
                                onClick={() => props.onNodeSelect(node.id)} 
                                className={`w-[220px] h-[64px] transition-all cursor-pointer relative z-30 flex-shrink-0 flex flex-col justify-center px-5 border-l-[3px] backdrop-blur-md shadow-sm ${
                                  isActive 
                                    ? 'bg-[var(--accent-blue)]/5 border-[var(--accent-blue)] shadow-[20px_0_40px_-15px_rgba(31,93,142,0.15)] translate-x-1' 
                                    : isCompleted
                                    ? 'bg-[var(--text-muted)]/10 border-[var(--text-muted)]/30 hover:border-[var(--text-muted)]/50'
                                    : 'bg-white/5 border-[var(--text-muted)]/20 opacity-100 hover:border-[var(--text-muted)]/40'
                                }`}
                              >
                                {/* Technical Corners */}
                                {isActive && (
                                  <>
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--accent-blue)]/40"></div>
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--accent-blue)]/40"></div>
                                  </>
                                )}

                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[7px] font-mono font-bold tracking-[0.3em] uppercase ${
                                    isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-primary)] opacity-60'
                                  }`}>
                                    S-{i+1 < 10 ? `0${i+1}` : i+1}
                                  </span>
                                  {isCompleted && (
                                    <div className="text-[6px] font-mono text-[var(--accent-blue)]/60 tracking-widest uppercase italic font-black">Verified</div>
                                  )}
                                </div>
                          
                                <h3 className={`text-[10px] font-black uppercase tracking-widest transition-all ${
                                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                                }`}>
                                  {node.name}
                                </h3>
                                
                                {/* Subtle status line for inactive nodes */}
                                {!isActive && (
                                  <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[var(--text-muted)]/20 via-transparent to-transparent"></div>
                                )}
                              </div>
                            
                              {/* Compact Command Actions - Positioned BELOW */}
                              {isActive && (
                                <div className="flex gap-2 pl-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                  {commands.map(cmd => (
                                    <button 
                                      key={cmd.id}
                                      className="w-8 h-8 rounded-none border border-[var(--text-muted)]/30 flex items-center justify-center transition-all hover:bg-[var(--accent-blue)] hover:border-[var(--accent-blue)] hover:text-white text-[var(--text-secondary)] group/btn relative"
                                      title={cmd.label}
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{cmd.icon}</svg>
                                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[6px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                        {cmd.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </PanZoomCanvas>
            </Suspense>
          )}
        </Suspense>
      </div>

      <div className="mt-auto border-t border-[var(--border-color)] p-6 flex flex-col gap-4 bg-[var(--bg-panel)]/30 backdrop-blur-md">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[7px] font-mono text-[var(--accent-blue)] tracking-[0.3em] uppercase mb-1">System Sync</span>
          <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">{Math.round(progressPercent)}.0%</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[7px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-1">Nodes</div>
            <span className="text-[10px] font-bold text-[var(--text-primary)]">{completedCount} <span className="opacity-30">/</span> {props.nodes.length}</span>
          </div>
        </div>
        <div className="h-[2px] w-full bg-[var(--border-color)] relative overflow-hidden">
          <div 
            className="h-full bg-[var(--accent-blue)] transition-all duration-1000 shadow-[0_0_8px_rgba(31,93,142,0.4)]" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      </>
      ) : (
        <div className="flex flex-col items-center py-4">
          <div className="text-[8px] font-mono text-[var(--text-muted)] tracking-widest writing-mode-vertical transform rotate-180">STAGES</div>
        </div>
      )}

      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={props.onToggleCollapse}
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-l-xl hover:bg-[var(--accent-blue)] hover:border-[var(--accent-blue)] transition-all duration-300 z-50 flex items-center justify-center group shadow-lg cursor-pointer"
      >
        <svg 
          className={`w-4 h-4 text-[var(--text-muted)] group-hover:text-white transition-all duration-300 ${props.isCollapsed ? '' : 'rotate-180'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* HOD Assignment Modal - Lazy loaded for code splitting */}
      {hodModalProject && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <HODAssignmentModal 
            projectId={hodModalProject.id}
            projectName={hodModalProject.name}
            isReadOnly={!canEditHODs}
            onClose={handleCloseHodModal}
          />
        </Suspense>
      )}
    </aside>
  );
};

export default RightSidebar;