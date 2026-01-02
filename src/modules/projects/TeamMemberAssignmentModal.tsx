import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useToast } from '../../components/Toast';
import {
  getDepartmentTeamMembers,
  getProjectDepartmentTeamMembers,
  updateProjectTeamMembers,
  ParticipantFull,
  DISCIPLINE_DISPLAY_NAMES,
} from '../../lib/supabase';

interface TeamMemberAssignmentModalProps {
  projectId: string;
  projectName: string;
  discipline: string;
  onClose: () => void;
  onComplete?: () => void;
}

// Team member row component - memoized
const TeamMemberRow = memo(({
  member,
  isSelected,
  isOriginallyAssigned,
  onToggle,
}: {
  member: ParticipantFull;
  isSelected: boolean;
  isOriginallyAssigned: boolean;
  onToggle: () => void;
}) => {
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
      className={`w-full flex items-center gap-4 px-4 py-3.5 text-left border-b border-[var(--border-color)]/50 last:border-b-0 transition-all ${
        isSelected
          ? 'bg-blue-500/10 hover:bg-blue-500/20'
          : 'hover:bg-[var(--bg-panel)]/50'
      }`}
    >
      {/* Checkbox */}
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        isSelected
          ? 'bg-blue-500 border-blue-500'
          : 'border-[var(--border-color)] bg-[var(--bg-panel)]'
      }`}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-bold text-[var(--text-primary)]">
            {member.name}
          </span>
          <span className={`text-[6px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex-shrink-0 ${
            status.color === 'emerald' ? 'text-emerald-600 bg-emerald-500/20' :
            status.color === 'rose' ? 'text-rose-600 bg-rose-500/20' :
            status.color === 'blue' ? 'text-blue-600 bg-blue-500/20' :
            'text-gray-600 bg-gray-500/20'
          }`}>
            {status.icon} {status.label}
          </span>
        </div>
        <p className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">
          {member.designation}
        </p>
      </div>

      {/* ID Badge */}
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] bg-[var(--bg-sidebar)] px-2 py-1 rounded">
          {member.participant_key}
        </span>
      </div>
    </button>
  );
});

TeamMemberRow.displayName = 'TeamMemberRow';

// Main component
const TeamMemberAssignmentModal: React.FC<TeamMemberAssignmentModalProps> = memo(({
  projectId,
  projectName,
  discipline,
  onClose,
  onComplete,
}) => {
  const { showToast } = useToast();

  // State
  const [allTeamMembers, setAllTeamMembers] = useState<ParticipantFull[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [originallyAssignedIds, setOriginallyAssignedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayName = DISCIPLINE_DISPLAY_NAMES[discipline] || discipline;

  // Fetch all team members and currently assigned team members on mount
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all team members and currently assigned team members in parallel
        const [teamMembers, assignedTeamMembers] = await Promise.all([
          getDepartmentTeamMembers(discipline),
          getProjectDepartmentTeamMembers(projectId, discipline),
        ]);

        if (mounted) {
          setAllTeamMembers(teamMembers);
          // Pre-select currently assigned team members and track original assignments
          const assignedIds = new Set(assignedTeamMembers.map(tm => tm.participant_id));
          setSelectedIds(assignedIds);
          setOriginallyAssignedIds(assignedIds);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        if (mounted) {
          showToast('Failed to load team members', 'error');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [projectId, discipline, showToast]);

  // Separate assigned and available team members
  const { assigned, available } = useMemo(() => {
    const assigned: ParticipantFull[] = [];
    const available: ParticipantFull[] = [];

    allTeamMembers.forEach(member => {
      if (selectedIds.has(member.participant_id)) {
        assigned.push(member);
      } else {
        available.push(member);
      }
    });

    return { assigned, available };
  }, [allTeamMembers, selectedIds]);

  // Toggle individual team member selection
  const handleToggleMember = useCallback((memberId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const result = await updateProjectTeamMembers(
        projectId,
        discipline,
        Array.from(selectedIds)
      );

      if (result.success) {
        showToast(`Successfully updated ${result.count} team member assignments`, 'success');
        if (onComplete) {
          onComplete();
        }
        onClose();
      } else {
        showToast(result.error || 'Failed to update assignments', 'error');
      }
    } catch (error) {
      console.error('Error updating team member assignments:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [projectId, discipline, selectedIds, showToast, onComplete, onClose]);

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
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight">
              Manage Team Members
            </h2>
            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5 truncate pl-7">
              {projectName} • {displayName}
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

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Loading Team Members...
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden min-h-0">
              {/* Left Panel - Assigned */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                    Assigned to Project
                  </h3>
                  <span className="text-[8px] font-bold text-emerald-600 bg-emerald-500/20 px-2 py-1 rounded">
                    {assigned.length}
                  </span>
                </div>
                <p className="text-[8px] text-[var(--text-muted)] mb-4 shrink-0">
                  Uncheck to remove from project
                </p>
                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar bg-[var(--bg-panel)] rounded-xl border border-[var(--border-color)]">
                  {assigned.length > 0 ? (
                    <div>
                      {assigned.map((member) => (
                        <TeamMemberRow
                          key={member.participant_id}
                          member={member}
                          isSelected={selectedIds.has(member.participant_id)}
                          isOriginallyAssigned={originallyAssignedIds.has(member.participant_id)}
                          onToggle={() => handleToggleMember(member.participant_id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-[10px] text-[var(--text-muted)] italic">
                        No team members assigned
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Available */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                    Available Team Members
                  </h3>
                  <span className="text-[8px] font-bold text-blue-600 bg-blue-500/20 px-2 py-1 rounded">
                    {available.length}
                  </span>
                </div>
                <p className="text-[8px] text-[var(--text-muted)] mb-4 shrink-0">
                  Check to add to project
                </p>
                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar bg-[var(--bg-panel)] rounded-xl border border-[var(--border-color)]">
                  {available.length > 0 ? (
                    <div>
                      {available.map((member) => (
                        <TeamMemberRow
                          key={member.participant_id}
                          member={member}
                          isSelected={selectedIds.has(member.participant_id)}
                          isOriginallyAssigned={originallyAssignedIds.has(member.participant_id)}
                          onToggle={() => handleToggleMember(member.participant_id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-[10px] text-[var(--text-muted)] italic">
                        No available team members
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-sidebar)] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  {assigned.length} Assigned
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  {available.length} Available
                </span>
              </div>
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
                className="px-5 py-2.5 bg-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
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
    </div>
  );
});

TeamMemberAssignmentModal.displayName = 'TeamMemberAssignmentModal';

export default TeamMemberAssignmentModal;

