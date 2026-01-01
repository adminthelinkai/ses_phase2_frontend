import React, { useState, useCallback, memo } from 'react';
import { createProject, CreateProjectPayload } from '../../api/projects';
import { useToast } from '../../components/Toast';

export interface CreatedProjectData {
  id: string;
  name: string;
}

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: (projectData: CreatedProjectData) => void;
}

interface FormErrors {
  name?: string;
  client_name?: string;
  start_date?: string;
  end_date?: string;
  general?: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = memo(({ onClose, onSuccess }) => {
  const { showToast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<CreateProjectPayload>({
    name: '',
    description: '',
    client_name: '',
    contract_reference: '',
    start_date: '',
    end_date: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end <= start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Format dates to ISO8601
      const payload: CreateProjectPayload = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      const result = await createProject(payload);

      if (result.success && result.data) {
        showToast('Project created successfully', 'success');
        // Pass project data to parent for team assignment
        onSuccess({
          id: result.data.id || result.data.project_id as string,
          name: result.data.name || formData.name,
        });
        // Don't close here - parent will close after team assignment flow
      } else {
        setErrors({ general: result.error });
        showToast(result.error || 'Failed to create project', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, showToast, onSuccess, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight">Create New Project</h2>
            <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Project Configuration</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-panel)] transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">{errors.general}</p>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter project name"
              className={`w-full border rounded-xl py-3 px-4 text-xs font-mono font-bold placeholder-[var(--text-muted)] bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                errors.name ? 'border-rose-500' : 'border-[var(--border-color)]'
              }`}
            />
            {errors.name && <p className="text-[8px] font-bold text-rose-500 pl-1">{errors.name}</p>}
          </div>

          {/* Client Name */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter client name"
              className={`w-full border rounded-xl py-3 px-4 text-xs font-mono font-bold placeholder-[var(--text-muted)] bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                errors.client_name ? 'border-rose-500' : 'border-[var(--border-color)]'
              }`}
            />
            {errors.client_name && <p className="text-[8px] font-bold text-rose-500 pl-1">{errors.client_name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter project description (optional)"
              rows={2}
              className="w-full border border-[var(--border-color)] rounded-xl py-3 px-4 text-xs font-mono font-bold placeholder-[var(--text-muted)] bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 resize-none"
            />
          </div>

          {/* Contract Reference */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
              Contract Reference
            </label>
            <input
              type="text"
              name="contract_reference"
              value={formData.contract_reference}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter contract reference (optional)"
              className="w-full border border-[var(--border-color)] rounded-xl py-3 px-4 text-xs font-mono font-bold placeholder-[var(--text-muted)] bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50"
            />
          </div>

          {/* Date Fields - 2 Column */}
          <div className="grid grid-cols-2 gap-3">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full border rounded-xl py-3 px-4 text-xs font-mono font-bold bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                  errors.start_date ? 'border-rose-500' : 'border-[var(--border-color)]'
                }`}
              />
              {errors.start_date && <p className="text-[8px] font-bold text-rose-500 pl-1">{errors.start_date}</p>}
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full border rounded-xl py-3 px-4 text-xs font-mono font-bold bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                  errors.end_date ? 'border-rose-500' : 'border-[var(--border-color)]'
                }`}
              />
              {errors.end_date && <p className="text-[8px] font-bold text-rose-500 pl-1">{errors.end_date}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-[var(--border-color)] rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-panel)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[var(--accent-blue)] rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-[var(--accent-blue)]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CreateProjectModal.displayName = 'CreateProjectModal';

export default CreateProjectModal;

