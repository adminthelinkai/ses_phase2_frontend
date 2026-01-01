import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useToast } from '../../components/Toast';
import {
  getAllParticipants,
  groupParticipantsByDiscipline,
  assignParticipantsToProject,
  ParticipantFull,
  DISCIPLINE_DISPLAY_NAMES,
  DISCIPLINE_ORDER,
} from '../../lib/supabase';

interface TeamAssignmentModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onComplete: () => void;
}

// Discipline section component - memoized for performance
const DisciplineSection = memo(({
  discipline,
  participants,
  selectedIds,
  expandedSections,
  onToggleSection,
  onToggleParticipant,
  onSelectAll,
}: {
  discipline: string;
  participants: ParticipantFull[];
  selectedIds: Set<string>;
  expandedSections: Set<string>;
  onToggleSection: (discipline: string) => void;
  onToggleParticipant: (id: string) => void;
  onSelectAll: (discipline: string, participantIds: string[]) => void;
}) => {
  const isExpanded = expandedSections.has(discipline);
  const displayName = DISCIPLINE_DISPLAY_NAMES[discipline] || discipline;
  const participantIds = participants.map(p => p.participant_id);
  const allSelected = participantIds.every(id => selectedIds.has(id));
  const someSelected = participantIds.some(id => selectedIds.has(id));

  return (
    <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-panel)]/50">
      {/* Section Header */}
      <button
        type="button"
        onClick={() => onToggleSection(discipline)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-panel)] transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Icon */}
          <svg
            className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          
          <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            {displayName}
          </span>
          
          <span className="text-[8px] font-bold text-[var(--text-muted)] bg-[var(--bg-sidebar)] px-2 py-0.5 rounded-full">
            {participants.length}
          </span>
        </div>

        {/* Select All Checkbox */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectAll(discipline, participantIds);
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
            {allSelected ? 'Deselect All' : 'Select All'}
          </span>
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              allSelected
                ? 'bg-[var(--accent-blue)] border-[var(--accent-blue)]'
                : someSelected
                ? 'bg-[var(--accent-blue)]/30 border-[var(--accent-blue)]'
                : 'border-[var(--border-color)] bg-transparent'
            }`}
          >
            {allSelected && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {someSelected && !allSelected && (
              <div className="w-2 h-0.5 bg-white rounded-full" />
            )}
          </div>
        </div>
      </button>

      {/* Participants List */}
      {isExpanded && (
        <div className="border-t border-[var(--border-color)] divide-y divide-[var(--border-color)]/50">
          {participants.map((participant) => (
            <ParticipantRow
              key={participant.participant_id}
              participant={participant}
              isSelected={selectedIds.has(participant.participant_id)}
              onToggle={() => onToggleParticipant(participant.participant_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

DisciplineSection.displayName = 'DisciplineSection';

// Individual participant row - memoized
const ParticipantRow = memo(({
  participant,
  isSelected,
  onToggle,
}: {
  participant: ParticipantFull;
  isSelected: boolean;
  onToggle: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isSelected ? 'bg-[var(--accent-blue)]/10' : 'hover:bg-[var(--bg-panel)]'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected
            ? 'bg-[var(--accent-blue)] border-[var(--accent-blue)]'
            : 'border-[var(--border-color)] bg-transparent'
        }`}
      >
        {isSelected && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Participant Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">
            {participant.name}
          </span>
          {participant.is_hod && (
            <span className="text-[7px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0">
              HOD
            </span>
          )}
        </div>
        <p className="text-[9px] font-medium text-[var(--text-muted)] truncate">
          {participant.designation}
        </p>
      </div>

      {/* Key Badge */}
      <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] bg-[var(--bg-sidebar)] px-2 py-1 rounded flex-shrink-0">
        {participant.participant_key}
      </span>
    </button>
  );
});

ParticipantRow.displayName = 'ParticipantRow';

// Loading skeleton for participants
const LoadingSkeleton = memo(() => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="border border-[var(--border-color)] rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[var(--bg-panel)] rounded" />
          <div className="h-3 w-32 bg-[var(--bg-panel)] rounded" />
          <div className="h-4 w-6 bg-[var(--bg-panel)] rounded-full ml-auto" />
        </div>
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Main component
const TeamAssignmentModal: React.FC<TeamAssignmentModalProps> = memo(({
  projectId,
  projectName,
  onClose,
  onComplete,
}) => {
  const { showToast } = useToast();

  // State
  const [participants, setParticipants] = useState<ParticipantFull[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(DISCIPLINE_ORDER));
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch participants on mount
  useEffect(() => {
    let mounted = true;

    const fetchParticipants = async () => {
      setIsLoading(true);
      try {
        const data = await getAllParticipants();
        if (mounted) {
          setParticipants(data);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
        if (mounted) {
          showToast('Failed to load team members', 'error');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchParticipants();
    return () => { mounted = false; };
  }, [showToast]);

  // Group participants by discipline with search filter
  const groupedParticipants = useMemo(() => {
    const filtered = searchQuery
      ? participants.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.participant_key.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : participants;

    return groupParticipantsByDiscipline(filtered);
  }, [participants, searchQuery]);

  // Sorted disciplines based on order
  const sortedDisciplines = useMemo(() => {
    return DISCIPLINE_ORDER.filter(d => groupedParticipants[d]?.length > 0);
  }, [groupedParticipants]);

  // Toggle section expand/collapse
  const handleToggleSection = useCallback((discipline: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(discipline)) {
        next.delete(discipline);
      } else {
        next.add(discipline);
      }
      return next;
    });
  }, []);

  // Toggle individual participant selection
  const handleToggleParticipant = useCallback((participantId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(participantId)) {
        next.delete(participantId);
      } else {
        next.add(participantId);
      }
      return next;
    });
  }, []);

  // Select/Deselect all in a discipline
  const handleSelectAll = useCallback((discipline: string, participantIds: string[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allSelected = participantIds.every(id => next.has(id));
      
      if (allSelected) {
        // Deselect all
        participantIds.forEach(id => next.delete(id));
      } else {
        // Select all
        participantIds.forEach(id => next.add(id));
      }
      
      return next;
    });
  }, []);

  // Handle assignment submission
  const handleAssign = useCallback(async () => {
    if (selectedIds.size === 0) {
      showToast('Please select at least one team member', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await assignParticipantsToProject(
        projectId,
        Array.from(selectedIds)
      );

      if (result.success) {
        showToast(`Successfully assigned ${result.count} team members`, 'success');
        onComplete();
      } else {
        showToast(result.error || 'Failed to assign team members', 'error');
      }
    } catch (error) {
      console.error('Error assigning participants:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [projectId, selectedIds, showToast, onComplete]);

  // Handle skip (close without assigning)
  const handleSkip = useCallback(() => {
    onClose();
    onComplete();
  }, [onClose, onComplete]);

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
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight">
              Assign Team Members
            </h2>
            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5 truncate">
              Project: {projectName}
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

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-[var(--border-color)] flex-shrink-0">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, designation, or key..."
              className="w-full border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono font-medium placeholder-[var(--text-muted)] bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <LoadingSkeleton />
          ) : sortedDisciplines.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {searchQuery ? 'No matching team members found' : 'No team members available'}
              </p>
            </div>
          ) : (
            sortedDisciplines.map((discipline) => (
              <DisciplineSection
                key={discipline}
                discipline={discipline}
                participants={groupedParticipants[discipline]}
                selectedIds={selectedIds}
                expandedSections={expandedSections}
                onToggleSection={handleToggleSection}
                onToggleParticipant={handleToggleParticipant}
                onSelectAll={handleSelectAll}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex items-center justify-between flex-shrink-0 bg-[var(--bg-panel)]/30">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${selectedIds.size > 0 ? 'bg-emerald-500' : 'bg-[var(--text-muted)]'}`} />
            <span className="text-[10px] font-bold text-[var(--text-secondary)]">
              {selectedIds.size} member{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-[var(--border-color)] rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-panel)] transition-all disabled:opacity-50"
            >
              Skip for Now
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={isSubmitting || selectedIds.size === 0}
              className="px-5 py-2.5 bg-[var(--accent-blue)] rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-[var(--accent-blue)]/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Assign Team
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TeamAssignmentModal.displayName = 'TeamAssignmentModal';

export default TeamAssignmentModal;

