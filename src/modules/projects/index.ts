// Projects module - lazy-loaded for code splitting
// Usage: const CreateProjectModal = lazy(() => import('../projects'));
// Usage: const TeamAssignmentModal = lazy(() => import('../projects/TeamAssignmentModal'));
// Usage: const HODAssignmentModal = lazy(() => import('../projects/HODAssignmentModal'));

export { default } from './CreateProjectModal';
export { default as CreateProjectModal } from './CreateProjectModal';
export { default as TeamAssignmentModal } from './TeamAssignmentModal';
export { default as HODAssignmentModal } from './HODAssignmentModal';
export type { CreatedProjectData } from './CreateProjectModal';

