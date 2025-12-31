import React, { Suspense, lazy } from 'react';
import { Department } from '../../types';

// Lazy load all department background components
const PMBackground = lazy(() => import('./PMBackground'));
const CSABackground = lazy(() => import('./CSABackground'));
const ElectricalBackground = lazy(() => import('./ElectricalBackground'));
const MechanicalBackground = lazy(() => import('./MechanicalBackground'));
const ProcessBackground = lazy(() => import('./ProcessBackground'));
const InstrumentBackground = lazy(() => import('./InstrumentBackground'));
const AdminBackground = lazy(() => import('./AdminBackground'));
const ManagementBackground = lazy(() => import('./ManagementBackground'));

interface DepartmentBackgroundProviderProps {
  department: Department | undefined;
  children?: React.ReactNode;
}

/**
 * Loading fallback for background components
 */
const BackgroundLoadingFallback: React.FC = () => (
  <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none transition-opacity duration-500" />
);

/**
 * Maps department to its corresponding background component
 */
const getDepartmentBackground = (department: Department | undefined): React.LazyExoticComponent<React.FC> => {
  switch (department) {
    case Department.PROJECT_MANAGEMENT:
      return PMBackground;
    case Department.CSA:
      return CSABackground;
    case Department.ELECTRICAL:
      return ElectricalBackground;
    case Department.MECHANICAL:
      return MechanicalBackground;
    case Department.PROCESS:
      return ProcessBackground;
    case Department.INSTRUMENT:
      return InstrumentBackground;
    case Department.ADMIN:
      return AdminBackground;
    case Department.MANAGEMENT:
      return ManagementBackground;
    default:
      // Default to CSA background if department is unknown
      return CSABackground;
  }
};

/**
 * DepartmentBackgroundProvider
 * 
 * Provides department-specific background patterns with lazy loading.
 * Each department has its own unique visual style that loads only when needed.
 * 
 * This component renders as an absolutely positioned overlay that doesn't
 * affect the layout flow of sibling elements.
 */
const DepartmentBackgroundProvider: React.FC<DepartmentBackgroundProviderProps> = ({ 
  department,
  children 
}) => {
  const BackgroundComponent = getDepartmentBackground(department);

  // If no children, render just the background as an absolute overlay
  if (!children) {
    return (
      <Suspense fallback={<BackgroundLoadingFallback />}>
        <BackgroundComponent />
      </Suspense>
    );
  }

  // If children are provided, wrap them with the background
  return (
    <div className="relative w-full h-full">
      {/* Lazy-loaded department-specific background */}
      <Suspense fallback={<BackgroundLoadingFallback />}>
        <BackgroundComponent />
      </Suspense>
      
      {/* Content overlay */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default DepartmentBackgroundProvider;

