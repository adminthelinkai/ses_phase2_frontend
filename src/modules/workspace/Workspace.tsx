import React, { useState, useRef, useEffect, lazy, Suspense, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import WorkspaceHeader from './WorkspaceHeader';
import { projects, deliverablesMap, deliverableWorkflows, Project } from '../../data';

const ChatView = lazy(() => import('./ChatView'));
const NodeContextView = lazy(() => import('./NodeContextView'));

const LoadingView = () => (
  <div className="flex-1 flex items-center justify-center bg-[var(--bg-base)]">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin"></div>
      <div className="mt-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Synchronising OS Core...</div>
    </div>
  </div>
);

const WORKSPACE_STORAGE_KEY = 'epcm-workspace-state';

const Workspace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'chat' | 'node'>(() => {
    const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        return state.viewMode || 'node';
      } catch {
        return 'node';
      }
    }
    return 'node';
  });
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('epcm-theme') as 'dark' | 'light';
    return savedTheme || 'dark';
  });
  
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(460); 
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  // Initialize state from URL params or localStorage
  const initializeState = (): { project: Project; deliverableId: string; nodeId: string | null } => {
    // Try URL params first
    const projectId = searchParams.get('project') || location.state?.projectId;
    const urlDeliverableId = searchParams.get('deliverable');
    const urlNodeId = searchParams.get('node');

    if (projectId) {
      const project = projects.find(p => p.id === projectId) || projects[0];
      const deliverables = deliverablesMap[project.id] || [];
      const defaultDeliverableId = urlDeliverableId && deliverables.find(d => d.id === urlDeliverableId) 
        ? urlDeliverableId 
        : deliverables[0]?.id || '';
      
      const nodes = deliverableWorkflows[defaultDeliverableId] || [];
      const defaultNodeId = urlNodeId && nodes.find(n => n.id === urlNodeId) 
        ? urlNodeId 
        : nodes[0]?.id || null;

      return { project, deliverableId: defaultDeliverableId, nodeId: defaultNodeId };
    }

    // Fallback to localStorage
    const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        const project = projects.find(p => p.id === state.projectId) || projects[0];
        const deliverables = deliverablesMap[project.id] || [];
        const savedDeliverableId = state.deliverableId && deliverables.find(d => d.id === state.deliverableId)
          ? state.deliverableId
          : deliverables[0]?.id || '';
        const nodes = deliverableWorkflows[savedDeliverableId] || [];
        const savedNodeId = state.nodeId && nodes.find(n => n.id === state.nodeId)
          ? state.nodeId
          : nodes[0]?.id || null;
        return { project, deliverableId: savedDeliverableId, nodeId: savedNodeId };
      } catch {
        // Fall through to default
      }
    }

    // Default state
    const project = projects[0];
    const deliverables = deliverablesMap[project.id] || [];
    const defaultDeliverableId = deliverables[0]?.id || '';
    const nodes = deliverableWorkflows[defaultDeliverableId] || [];
    const defaultNodeId = nodes[0]?.id || null;
    return { project, deliverableId: defaultDeliverableId, nodeId: defaultNodeId };
  };

  const initialState = useMemo(() => initializeState(), [searchParams, location.state]);
  
  // Core State - initialize from URL/localStorage
  const [activeProject, setActiveProject] = useState<Project>(initialState.project);
  const [activeDeliverableId, setActiveDeliverableId] = useState<string>(initialState.deliverableId);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(initialState.nodeId);

  // Update state when URL params change (e.g., on refresh or direct navigation)
  // Only update if URL params differ from current state to avoid loops
  useEffect(() => {
    const urlProjectId = searchParams.get('project') || location.state?.projectId;
    const urlDeliverableId = searchParams.get('deliverable');
    const urlNodeId = searchParams.get('node');
    
    // Only update if URL params are different from current state
    if (urlProjectId && urlProjectId !== activeProject.id) {
      const project = projects.find(p => p.id === urlProjectId);
      if (project) {
        setActiveProject(project);
      }
    }
    
    if (urlDeliverableId && urlDeliverableId !== activeDeliverableId) {
      const deliverables = deliverablesMap[activeProject.id] || [];
      if (deliverables.find(d => d.id === urlDeliverableId)) {
        setActiveDeliverableId(urlDeliverableId);
      }
    }
    
    if (urlNodeId && urlNodeId !== activeNodeId) {
      const nodes = deliverableWorkflows[activeDeliverableId] || [];
      if (nodes.find(n => n.id === urlNodeId)) {
        setActiveNodeId(urlNodeId);
      }
    }
  }, [searchParams, location.state]); // Only depend on URL, not state

  // Derived Data
  const currentDeliverables = useMemo(() => deliverablesMap[activeProject.id] || [], [activeProject.id]);
  const currentNodes = useMemo(() => deliverableWorkflows[activeDeliverableId] || [], [activeDeliverableId]);
  const activeDeliverable = useMemo(() => currentDeliverables.find(d => d.id === activeDeliverableId), [currentDeliverables, activeDeliverableId]);

  useEffect(() => { 
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('epcm-theme', theme);
  }, [theme]);

  // Persist workspace state to localStorage and URL
  useEffect(() => {
    const state = {
      projectId: activeProject.id,
      deliverableId: activeDeliverableId,
      nodeId: activeNodeId,
      viewMode,
    };
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
    
    // Update URL params
    const params = new URLSearchParams();
    params.set('project', activeProject.id);
    params.set('deliverable', activeDeliverableId);
    if (activeNodeId) {
      params.set('node', activeNodeId);
    }
    setSearchParams(params, { replace: true });
  }, [activeProject.id, activeDeliverableId, activeNodeId, viewMode, setSearchParams]);

  // Resizing Handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isResizingLeft.current) setLeftWidth(Math.max(220, Math.min(400, e.clientX)));
      if (isResizingRight.current) setRightWidth(Math.max(380, Math.min(700, window.innerWidth - e.clientX)));
    };
    const onUp = () => { isResizingLeft.current = false; isResizingRight.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // Action Callbacks
  const handleProjectSelect = (proj: Project) => {
    setActiveProject(proj);
    const firstDeliv = deliverablesMap[proj.id]?.[0];
    if (firstDeliv) {
      setActiveDeliverableId(firstDeliv.id);
      setActiveNodeId(deliverableWorkflows[firstDeliv.id]?.[0]?.id || null);
    }
    // Update URL immediately
    navigate(`/workspace?project=${proj.id}`, { replace: true });
  };

  const handleDeliverableSelect = (id: string) => {
    setActiveDeliverableId(id);
    setActiveNodeId(deliverableWorkflows[id]?.[0]?.id || null);
    // Update URL immediately
    navigate(`/workspace?project=${activeProject.id}&deliverable=${id}`, { replace: true });
  };

  const handleViewModeChange = (mode: 'chat' | 'node') => {
    setViewMode(mode);
  };

  const deptBgClass = useMemo(() => {
    const code = activeDeliverable?.code || '';
    if (code.startsWith('CSA')) return 'bg-dept-csa';
    if (code.startsWith('ELEC')) return 'bg-dept-elec';
    if (code.startsWith('MECH')) return 'bg-dept-mech';
    if (code.startsWith('INST')) return 'bg-dept-inst';
    return 'bg-dot-grid';
  }, [activeDeliverable]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 font-inter">
      <Sidebar 
        width={leftWidth}
        activeProject={activeProject}
        onProjectSelect={handleProjectSelect}
        deliverables={currentDeliverables}
        activeDeliverableId={activeDeliverableId}
        onDeliverableSelect={handleDeliverableSelect}
        viewMode={viewMode}
        onViewModeSelect={handleViewModeChange}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onResizeStart={() => isResizingLeft.current = true}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-[var(--bg-base)]">
        {viewMode !== 'chat' && <WorkspaceHeader deliverable={activeDeliverable} />}
        <Suspense fallback={<LoadingView />}>
          {viewMode === 'chat' ? (
            <ChatView backgroundClass={deptBgClass} />
          ) : (
            <NodeContextView 
              activeNodeId={activeNodeId || ''} 
              activeDeliverableCode={activeDeliverable?.code || 'N/A'} 
              backgroundClass={deptBgClass}
            />
          )}
        </Suspense>
      </main>

      <RightSidebar 
        width={rightWidth}
        activeDeliverable={activeDeliverable}
        nodes={currentNodes}
        activeNodeId={activeNodeId}
        onNodeSelect={setActiveNodeId}
        onResizeStart={() => isResizingRight.current = true}
      />
    </div>
  );
};

export default Workspace;