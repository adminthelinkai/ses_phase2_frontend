import React, { useState, useRef, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import WorkspaceHeader from './WorkspaceHeader';
import { projects as staticProjects, deliverablesMap, deliverableWorkflows, Project } from '../../data';
import { useAuth } from '../../context/AuthContext';
import { getAssignedProjects, BackendProject } from '../../lib/supabase';
import type { CreatedProjectData } from '../projects/CreateProjectModal';

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
  const { user } = useAuth();
  
  // State for assigned projects
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  // State for newly created project (for 2-min delay on team assignment node)
  const [newProjectData, setNewProjectData] = useState<{ id: string; createdAt: number } | null>(null);
  
  // Fetch assigned projects - extracted as callback for reuse after project creation
  const fetchProjects = useCallback(async () => {
    if (!user?.participantId) {
      setAssignedProjects([]);
      setIsLoadingProjects(false);
      return;
    }

    setIsLoadingProjects(true);
    try {
      const backendProjects = await getAssignedProjects(user.participantId);
      const projects: Project[] = backendProjects.map((p: BackendProject) => ({
        id: p.project_id,
        name: p.name,
        status: (p.status?.toLowerCase() as 'active' | 'on-hold' | 'completed') || 'active',
      }));
      setAssignedProjects(projects);
    } catch (error) {
      console.error('Error fetching assigned projects:', error);
      setAssignedProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [user?.participantId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle new project creation - refresh projects and navigate to it
  const handleProjectCreated = useCallback(async (projectData: CreatedProjectData) => {
    // Store new project data with timestamp for 2-min delay logic
    setNewProjectData({
      id: projectData.id,
      createdAt: Date.now(),
    });
    
    // Refresh projects list
    await fetchProjects();
    
    // Navigate to the new project
    const newProject: Project = {
      id: projectData.id,
      name: projectData.name,
      status: 'active',
    };
    
    // Add to assigned projects immediately and select it
    setAssignedProjects(prev => {
      // Check if already exists
      if (prev.find(p => p.id === projectData.id)) {
        return prev;
      }
      return [newProject, ...prev];
    });
    
    // Select the new project
    handleProjectSelect(newProject);
  }, [fetchProjects]);
  
  const [viewMode, setViewMode] = useState<'project_chat' | 'global_chat'>(() => {
    const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        return state.viewMode || 'project_chat';
      } catch {
        return 'project_chat';
      }
    }
    return 'project_chat';
  });
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('epcm-theme') as 'dark' | 'light';
    return savedTheme || 'dark';
  });
  
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(350); 
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  // Use assigned projects if available, otherwise fall back to static projects
  const availableProjects = useMemo(() => {
    return assignedProjects.length > 0 ? assignedProjects : staticProjects;
  }, [assignedProjects]);

  // Initialize state from URL params or localStorage
  const initializeState = (): { project: Project; deliverableId: string; nodeId: string | null } => {
    // Try URL params first
    const projectId = searchParams.get('project') || location.state?.projectId;
    const urlDeliverableId = searchParams.get('deliverable');
    const urlNodeId = searchParams.get('node');

    if (projectId) {
      const project = availableProjects.find(p => p.id === projectId) || availableProjects[0];
      if (!project) {
        return { project: { id: '', name: 'No Project', status: 'active' }, deliverableId: '', nodeId: null };
      }
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
        const project = availableProjects.find(p => p.id === state.projectId) || availableProjects[0];
        if (!project) {
          return { project: { id: '', name: 'No Project', status: 'active' }, deliverableId: '', nodeId: null };
        }
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
    const project = availableProjects[0];
    if (!project) {
      return { project: { id: '', name: 'No Project', status: 'active' }, deliverableId: '', nodeId: null };
    }
    const deliverables = deliverablesMap[project.id] || [];
    const defaultDeliverableId = deliverables[0]?.id || '';
    const nodes = deliverableWorkflows[defaultDeliverableId] || [];
    const defaultNodeId = nodes[0]?.id || null;
    return { project, deliverableId: defaultDeliverableId, nodeId: defaultNodeId };
  };

  const initialState = useMemo(() => initializeState(), [searchParams, location.state, availableProjects]);
  
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
      const project = availableProjects.find(p => p.id === urlProjectId);
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
  }, [searchParams, location.state, availableProjects]); // Only depend on URL, not state

  // Update active project when assigned projects load
  useEffect(() => {
    if (!isLoadingProjects && availableProjects.length > 0 && !availableProjects.find(p => p.id === activeProject.id)) {
      const firstProject = availableProjects[0];
      setActiveProject(firstProject);
      const deliverables = deliverablesMap[firstProject.id] || [];
      if (deliverables.length > 0) {
        setActiveDeliverableId(deliverables[0].id);
        setActiveNodeId(deliverableWorkflows[deliverables[0].id]?.[0]?.id || null);
      }
    }
  }, [isLoadingProjects, availableProjects]);

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
      if (isResizingRight.current) setRightWidth(Math.max(300, Math.min(700, window.innerWidth - e.clientX)));
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

  const handleViewModeChange = (mode: 'project_chat' | 'global_chat') => {
    setViewMode(mode);
  };

  // Get user's department for background theming
  const userDepartment = user?.department;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 font-inter">
      <Sidebar 
        width={isLeftCollapsed ? 50 : leftWidth}
        isCollapsed={isLeftCollapsed}
        onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
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
        projects={availableProjects}
        isLoadingProjects={isLoadingProjects}
        onProjectCreated={handleProjectCreated}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-[var(--bg-base)]">
        {/* We keep WorkspaceHeader only for context, but it might be hidden if not in a "node" like mode */}
        {/* For now, let's show it if we have an active deliverable */}
        {activeDeliverable && <WorkspaceHeader deliverable={activeDeliverable} />}
        
        <Suspense fallback={<LoadingView />}>
          <ChatView 
            department={userDepartment}
            viewMode={viewMode}
            onViewModeSelect={handleViewModeChange}
            projectId={activeProject.id}
            userId={user?.id || ''}
          />
        </Suspense>
      </main>

      <RightSidebar 
        width={isRightCollapsed ? 50 : rightWidth}
        isCollapsed={isRightCollapsed}
        onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
        activeDeliverable={activeDeliverable}
        nodes={currentNodes}
        activeNodeId={activeNodeId}
        onNodeSelect={setActiveNodeId}
        onResizeStart={() => isResizingRight.current = true}
        // Project Tree Props
        projects={availableProjects}
        activeProject={activeProject}
        onProjectSelect={handleProjectSelect}
        onDeliverableSelect={handleDeliverableSelect}
        // New project data for team assignment node visibility
        newProjectData={newProjectData}
      />
    </div>
  );
};

export default Workspace;