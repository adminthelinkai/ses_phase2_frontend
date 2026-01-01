import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useToast } from '../../components/Toast';
import {
  getAllHODs,
  getProjectAssignedHODs,
  updateProjectHODs,
  ParticipantFull,
  DISCIPLINE_DISPLAY_NAMES,
  DISCIPLINE_ORDER,
  groupParticipantsByDiscipline,
} from '../../lib/supabase';

interface HODAssignmentModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onComplete?: () => void;
}

// HOD row component - memoized
const HODRow = memo(({
  hod,
  isSelected,
  isOriginallyAssigned,
  onToggle,
}: {
  hod: ParticipantFull;
  isSelected: boolean;
  isOriginallyAssigned: boolean;
  onToggle: () => void;
}) => {
  const displayName = DISCIPLINE_DISPLAY_NAMES[hod.discipline] || hod.discipline;
  
  // Determine status for visual indicator
  const getStatusInfo = () => {
    if (isOriginallyAssigned && isSelected) {
      return { label: 'ASSIGNED', color: 'emerald', icon: '✓' };
    } else if (isOriginallyAssigned && !isSelected) {
      return { label: 'REMOVING', color: 'rose', icon: '−' };
    } else if (!isOriginallyAssigned && isSelected) {
      return { label: 'ADDING', color: 'blue', icon: '+' };
    }
    return { label: 'AVAILABLE', color: 'gray', icon: '' };
  };
  
  const status = getStatusInfo();
  
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-all border-b border-[var(--border-color)]/50 last:border-b-0 ${
        isSelected 
          ? isOriginallyAssigned 
            ? 'bg-emerald-500/10' 
            : 'bg-blue-500/10'
          : isOriginallyAssigned 
            ? 'bg-rose-500/5' 
            : 'hover:bg-[var(--bg-panel)]'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected
            ? isOriginallyAssigned
              ? 'bg-emerald-500 border-emerald-500'
              : 'bg-blue-500 border-blue-500'
            : 'border-[var(--border-color)] bg-transparent'
        }`}
      >
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* HOD Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-bold text-[var(--text-primary)]">
            {hod.name}
          </span>
          <span className="text-[7px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0">
            HOD
          </span>
          {/* Status Badge */}
          <span className={`text-[6px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex-shrink-0 ${
            status.color === 'emerald' 
              ? 'text-emerald-600 bg-emerald-500/20' 
              : status.color === 'rose'
              ? 'text-rose-500 bg-rose-500/20'
              : status.color === 'blue'
              ? 'text-blue-500 bg-blue-500/20'
              : 'text-[var(--text-muted)] bg-[var(--bg-panel)]'
          }`}>
            {status.icon && <span className="mr-0.5">{status.icon}</span>}
            {status.label}
          </span>
        </div>
        <p className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">
          {hod.designation}
        </p>
      </div>

      {/* Department Badge */}
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] bg-[var(--bg-sidebar)] px-2 py-1 rounded">
          {hod.participant_key}
        </span>
        <span className="text-[7px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-wide">
          {displayName}
        </span>
      </div>
    </button>
  );
});

HODRow.displayName = 'HODRow';

// Loading skeleton
const LoadingSkeleton = memo(() => (
  <div className="space-y-2 p-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
        <div className="w-5 h-5 bg-[var(--bg-panel)] rounded" />
        <div className="flex-1">
          <div className="h-3 w-32 bg-[var(--bg-panel)] rounded mb-2" />
          <div className="h-2 w-24 bg-[var(--bg-panel)] rounded" />
        </div>
        <div className="h-4 w-16 bg-[var(--bg-panel)] rounded" />
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Main component
const HODAssignmentModal: React.FC<HODAssignmentModalProps> = memo(({
  projectId,
  projectName,
  onClose,
  onComplete,
}) => {
  const { showToast } = useToast();

  // State
  const [allHODs, setAllHODs] = useState<ParticipantFull[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [originallyAssignedIds, setOriginallyAssignedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all HODs and currently assigned HODs on mount
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all HODs and currently assigned HODs in parallel
        const [hods, assignedHODs] = await Promise.all([
          getAllHODs(),
          getProjectAssignedHODs(projectId),
        ]);

        if (mounted) {
          setAllHODs(hods);
          // Pre-select currently assigned HODs and track original assignments
          const assignedIds = new Set(assignedHODs.map(h => h.participant_id));
          setSelectedIds(assignedIds);
          setOriginallyAssignedIds(assignedIds);
        }
      } catch (error) {
        console.error('Error fetching HODs:', error);
        if (mounted) {
          showToast('Failed to load HODs', 'error');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [projectId, showToast]);

  // Group HODs by discipline for display
  const groupedHODs = useMemo(() => {
    return groupParticipantsByDiscipline(allHODs);
  }, [allHODs]);

  // Sorted disciplines
  const sortedDisciplines = useMemo(() => {
    return DISCIPLINE_ORDER.filter(d => groupedHODs[d]?.length > 0);
  }, [groupedHODs]);

  // Toggle individual HOD selection
  const handleToggleHOD = useCallback((hodId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(hodId)) {
        next.delete(hodId);
      } else {
        next.add(hodId);
      }
      return next;
    });
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const result = await updateProjectHODs(
        projectId,
        Array.from(selectedIds)
      );

      if (result.success) {
        showToast(`Successfully updated ${result.count} HOD assignments`, 'success');
        if (onComplete) {
          onComplete();
        }
        onClose();
      } else {
        showToast(result.error || 'Failed to update HOD assignments', 'error');
      }
    } catch (error) {
      console.error('Error updating HOD assignments:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [projectId, selectedIds, showToast, onComplete, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal - Wider for split view */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h2 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight">
                Manage HODs
              </h2>
            </div>
            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 truncate pl-7">
              {projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-panel)] transition-colors disabled:opacity-50 flex-shrink-0 ml-4"
          >
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Split View */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <LoadingSkeleton />
          ) : allHODs.length === 0 ? (
            <div className="text-center py-12 px-6">
              <svg
                className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                No HODs available
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 h-full divide-x divide-[var(--border-color)]">
              {/* LEFT PANEL - Currently Assigned HODs */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-4 py-3 bg-emerald-500/10 border-b border-[var(--border-color)] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      Assigned to Project
                    </span>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-full ml-auto">
                      {selectedIds.size}
                    </span>
                  </div>
                  <p className="text-[8px] font-medium text-[var(--text-muted)] mt-1">
                    Uncheck to remove from project
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {Array.from(selectedIds).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 px-6">
                      <svg className="w-10 h-10 text-[var(--text-muted)]/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center">
                        No HODs assigned
                      </p>
                      <p className="text-[8px] font-medium text-[var(--text-muted)] mt-1 text-center">
                        Select HODs from the right panel
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border-color)]/50">
                      {allHODs.filter(hod => selectedIds.has(hod.participant_id)).map((hod) => (
                        <HODRow
                          key={hod.participant_id}
                          hod={hod}
                          isSelected={true}
                          isOriginallyAssigned={originallyAssignedIds.has(hod.participant_id)}
                          onToggle={() => handleToggleHOD(hod.participant_id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL - Available HODs */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-4 py-3 bg-blue-500/10 border-b border-[var(--border-color)] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                      Available HODs
                    </span>
                    <span className="text-[9px] font-bold text-blue-500 bg-blue-500/20 px-2 py-0.5 rounded-full ml-auto">
                      {allHODs.filter(hod => !selectedIds.has(hod.participant_id)).length}
                    </span>
                  </div>
                  <p className="text-[8px] font-medium text-[var(--text-muted)] mt-1">
                    Check to add to project
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {allHODs.filter(hod => !selectedIds.has(hod.participant_id)).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 px-6">
                      <svg className="w-10 h-10 text-emerald-500/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest text-center">
                        All HODs Assigned
                      </p>
                      <p className="text-[8px] font-medium text-[var(--text-muted)] mt-1 text-center">
                        Every available HOD is assigned to this project
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border-color)]/50">
                      {allHODs.filter(hod => !selectedIds.has(hod.participant_id)).map((hod) => (
                        <HODRow
                          key={hod.participant_id}
                          hod={hod}
                          isSelected={false}
                          isOriginallyAssigned={originallyAssignedIds.has(hod.participant_id)}
                          onToggle={() => handleToggleHOD(hod.participant_id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex items-center justify-between flex-shrink-0 bg-[var(--bg-panel)]/30">
          <div className="flex items-center gap-4">
            {/* Summary */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600">
                  {selectedIds.size} Assigned
                </span>
              </div>
              <span className="text-[var(--text-muted)]">|</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-blue-500">
                  {allHODs.filter(hod => !selectedIds.has(hod.participant_id)).length} Available
                </span>
              </div>
            </div>
            {/* Changes indicator */}
            {(Array.from(selectedIds).filter(id => !originallyAssignedIds.has(id)).length > 0 ||
              Array.from(originallyAssignedIds).filter(id => !selectedIds.has(id)).length > 0) && (
              <span className="text-[8px] font-bold text-amber-500 bg-amber-500/20 px-2 py-1 rounded uppercase tracking-wider">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-[var(--border-color)] rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-panel)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

HODAssignmentModal.displayName = 'HODAssignmentModal';

export default HODAssignmentModal;

