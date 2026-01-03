import React, { useState, useCallback, memo, useRef } from 'react';
import { uploadDocument, UploadDocumentPayload } from '../../api/documents';
import { useToast } from '../../components/Toast';
import { Department } from '../../types';

// Document type options - extensible list
const DOCUMENT_TYPES = [
  { value: 'dbr', label: 'DBR (Design Basis Report)' },
  { value: 'spec', label: 'Specification' },
  { value: 'manual', label: 'Manual' },
  { value: 'drawing', label: 'Drawing' },
  { value: 'data_sheet', label: 'Data Sheet' },
  { value: 'calculation', label: 'Calculation' },
  { value: 'report', label: 'Report' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'other', label: 'Other' },
] as const;

// Maximum file size: 50MB (in bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface UploadDocumentModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  projectId: string;
  projectName?: string;
}

interface FormErrors {
  file?: string;
  doc_type?: string;
  department?: string;
  manual_version?: string;
  general?: string;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = memo(({ 
  onClose, 
  onSuccess,
  projectId,
  projectName,
}) => {
  const { showToast } = useToast();
  
  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [autoVersion, setAutoVersion] = useState<boolean>(true);
  const [manualVersion, setManualVersion] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ 
        ...prev, 
        file: `File size exceeds maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}`,
      }));
      return;
    }

    // Clear file error
    setErrors(prev => ({ ...prev, file: undefined }));
    setSelectedFile(file);
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle input changes
  const handleDocTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocType(e.target.value);
    if (errors.doc_type) {
      setErrors(prev => ({ ...prev, doc_type: undefined }));
    }
  }, [errors.doc_type]);

  const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartment(e.target.value);
    if (errors.department) {
      setErrors(prev => ({ ...prev, department: undefined }));
    }
  }, [errors.department]);

  const handleManualVersionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setManualVersion(value);
      if (errors.manual_version) {
        setErrors(prev => ({ ...prev, manual_version: undefined }));
      }
    }
  }, [errors.manual_version]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }

    if (!docType) {
      newErrors.doc_type = 'Document type is required';
    }

    if (!department) {
      newErrors.department = 'Department is required';
    }

    if (!autoVersion && (!manualVersion || manualVersion < 1)) {
      newErrors.manual_version = 'Manual version must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedFile, docType, department, autoVersion, manualVersion]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    if (!selectedFile) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: UploadDocumentPayload = {
        file: selectedFile,
        project_id: projectId,
        doc_type: docType,
        file_type: 'documents',
        auto_version: autoVersion,
        department: department,
        ...(autoVersion ? {} : { manual_version: manualVersion }),
      };

      const result = await uploadDocument(payload);

      if (result.success) {
        showToast('Document uploaded successfully', 'success');
        onSuccess?.();
        onClose();
      } else {
        setErrors({ general: result.error });
        showToast(result.error || 'Failed to upload document', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFile, docType, department, autoVersion, manualVersion, projectId, validateForm, showToast, onSuccess, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  // Handle remove file
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => ({ ...prev, file: undefined }));
  }, []);

  // Department options from enum
  const departmentOptions = Object.values(Department).map(dept => ({
    value: dept.toLowerCase(),
    label: dept.replace(/_/g, ' '),
  }));

  return (
    <div 
      className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight">Upload Document</h2>
            <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
              {projectName ? `Project: ${projectName}` : 'Document Configuration'}
            </p>
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

          {/* File Upload Area */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
              Document File <span className="text-rose-500">*</span>
            </label>
            {!selectedFile ? (
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/10'
                    : 'border-[var(--border-color)] hover:border-[var(--accent-blue)]/50 hover:bg-[var(--bg-panel)]'
                } ${errors.file ? 'border-rose-500' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={isSubmitting}
                  accept="*/*"
                />
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-xs font-bold text-[var(--text-primary)] mb-1">
                  Drag and drop a file here, or click to browse
                </p>
                <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                  Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>
            ) : (
              <div className="border border-[var(--border-color)] rounded-xl p-4 bg-[var(--bg-panel)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <svg
                      className="w-8 h-8 text-[var(--accent-blue)] flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">{selectedFile.name}</p>
                      <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                    className="ml-3 p-2 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {errors.file && <p className="text-[8px] font-bold text-rose-500 pl-1">{errors.file}</p>}
          </div>

          {/* Document Type */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
              Document Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={docType}
              onChange={handleDocTypeChange}
              disabled={isSubmitting}
              className={`w-full border rounded-xl py-3 px-4 text-xs font-mono font-bold bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                errors.doc_type ? 'border-rose-500' : 'border-[var(--border-color)]'
              }`}
            >
              <option value="">Select document type</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.doc_type && <p className="text-[8px] font-bold text-rose-500 pl-1">{errors.doc_type}</p>}
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={handleDepartmentChange}
              disabled={isSubmitting}
              className={`w-full border rounded-xl py-3 px-4 text-xs font-mono font-bold bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                errors.department ? 'border-rose-500' : 'border-[var(--border-color)]'
              }`}
            >
              <option value="">Select department</option>
              {departmentOptions.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            {errors.department && <p className="text-[8px] font-bold text-rose-500 pl-1">{errors.department}</p>}
          </div>

          {/* Version Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_version"
                checked={autoVersion}
                onChange={(e) => setAutoVersion(e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-panel)] text-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/30 disabled:opacity-50"
              />
              <label
                htmlFor="auto_version"
                className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest cursor-pointer"
              >
                Auto Version (recommended)
              </label>
            </div>

            {!autoVersion && (
              <div className="space-y-1.5 pl-7">
                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
                  Manual Version
                </label>
                <input
                  type="number"
                  min="1"
                  value={manualVersion}
                  onChange={handleManualVersionChange}
                  disabled={isSubmitting}
                  className={`w-full border rounded-xl py-3 px-4 text-xs font-mono font-bold bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                    errors.manual_version ? 'border-rose-500' : 'border-[var(--border-color)]'
                  }`}
                />
                {errors.manual_version && (
                  <p className="text-[8px] font-bold text-rose-500 pl-1">{errors.manual_version}</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-[var(--border-color)] rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-panel)] transition-all disabled:opacity-50"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="flex-1 py-3 bg-[var(--accent-blue)] rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-[var(--accent-blue)]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

UploadDocumentModal.displayName = 'UploadDocumentModal';

export default UploadDocumentModal;

