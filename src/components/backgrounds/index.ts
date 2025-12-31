import { lazy } from 'react';

// Lazy load all department background components
export const PMBackground = lazy(() => import('./PMBackground'));
export const CSABackground = lazy(() => import('./CSABackground'));
export const ElectricalBackground = lazy(() => import('./ElectricalBackground'));
export const MechanicalBackground = lazy(() => import('./MechanicalBackground'));
export const ProcessBackground = lazy(() => import('./ProcessBackground'));
export const InstrumentBackground = lazy(() => import('./InstrumentBackground'));
export const AdminBackground = lazy(() => import('./AdminBackground'));
export const ManagementBackground = lazy(() => import('./ManagementBackground'));

// Re-export the provider
export { default as DepartmentBackgroundProvider } from './DepartmentBackgroundProvider';

