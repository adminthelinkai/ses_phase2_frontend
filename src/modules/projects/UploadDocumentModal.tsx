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

interface FileUploadItem {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  docType?: string;
  customType?: string; // Custom type name when "Other" is selected
  department?: string;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = memo(({ 
  onClose, 
  onSuccess,
  projectId,
  projectName,
}) => {
  const { showToast } = useToast();
  
  // Form state
  const [uploadQueue, setUploadQueue] = useState<FileUploadItem[]>([]);
  const [autoVersion, setAutoVersion] = useState<boolean>(true);
  const [manualVersion, setManualVersion] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1);
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Check if file already exists in queue (by name and size)
  const isFileDuplicate = useCallback((file: File, queue: FileUploadItem[]): boolean => {
    return queue.some(item => item.file.name === file.name && item.file.size === file.size);
  }, []);

  // Handle file selection - supports multiple files
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: FileUploadItem[] = [];
    const newErrors: string[] = [];

    fileArray.forEach((file) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`${file.name}: File size exceeds maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}`);
        return;
      }

      // Check for duplicates
      if (isFileDuplicate(file, uploadQueue)) {
        newErrors.push(`${file.name}: File already added`);
        return;
      }

      validFiles.push({
        file,
        status: 'pending',
      });
    });

    if (newErrors.length > 0) {
      setErrors(prev => ({ 
        ...prev, 
        file: newErrors.join('; '),
      }));
      if (validFiles.length === 0) {
        return;
      }
    } else {
      setErrors(prev => ({ ...prev, file: undefined }));
    }

    setUploadQueue(prev => [...prev, ...validFiles]);
  }, [uploadQueue, isFileDuplicate]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Handle per-file document type change
  const handleFileDocTypeChange = useCallback((index: number, value: string) => {
    setUploadQueue(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, docType: value, customType: value === 'other' ? item.customType || '' : undefined } 
        : item
    ));
    setErrors(prev => ({ ...prev, doc_type: undefined, file: undefined }));
  }, []);

  // Handle custom type input change
  const handleCustomTypeChange = useCallback((index: number, value: string) => {
    setUploadQueue(prev => prev.map((item, i) => 
      i === index ? { ...item, customType: value } : item
    ));
    setErrors(prev => ({ ...prev, doc_type: undefined, file: undefined }));
  }, []);

  // Handle per-file department change
  const handleFileDepartmentChange = useCallback((index: number, value: string) => {
    setUploadQueue(prev => prev.map((item, i) => 
      i === index ? { ...item, department: value } : item
    ));
    setErrors(prev => ({ ...prev, department: undefined, file: undefined }));
  }, []);

  const handleManualVersionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setManualVersion(value);
      if (errors.manual_version) {
        setErrors(prev => ({ ...prev, manual_version: undefined }));
      }
    }
  }, [errors.manual_version]);

  // Remove file from queue
  const handleRemoveFile = useCallback((index: number) => {
    setUploadQueue(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, file: undefined }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (uploadQueue.length === 0) {
      newErrors.file = 'Please select at least one file to upload';
    }

    // Validate each file has docType and department
    const missingTypeIndices: number[] = [];
    const missingDeptIndices: number[] = [];
    
    uploadQueue.forEach((item, index) => {
      if (!item.docType || item.docType.trim() === '') {
        missingTypeIndices.push(index);
      } else if (item.docType === 'other' && (!item.customType || item.customType.trim() === '')) {
        // If "Other" is selected, custom type must be provided
        missingTypeIndices.push(index);
      }
      if (!item.department || item.department.trim() === '') {
        missingDeptIndices.push(index);
      }
    });

    if (missingTypeIndices.length > 0) {
      newErrors.doc_type = `Please select document type for ${missingTypeIndices.length} file(s)`;
    }

    if (missingDeptIndices.length > 0) {
      newErrors.department = `Please select department for ${missingDeptIndices.length} file(s)`;
    }

    if (!autoVersion && (!manualVersion || manualVersion < 1)) {
      newErrors.manual_version = 'Manual version must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [uploadQueue, autoVersion, manualVersion]);

  // Sequential upload function
  const startSequentialUpload = useCallback(async () => {
    const queue = [...uploadQueue];

    for (let index = 0; index < queue.length; index++) {
      const item = queue[index];
      setCurrentUploadIndex(index);
      
      // Update status to uploading
      setUploadQueue(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'uploading' } : item
      ));

      try {
        // Use custom type if "Other" is selected, otherwise use the selected docType
        const finalDocType = item.docType === 'other' && item.customType 
          ? item.customType.trim() 
          : (item.docType || '');
        
        const payload: UploadDocumentPayload = {
          file: item.file,
          project_id: projectId,
          doc_type: finalDocType,
          file_type: 'documents',
          auto_version: autoVersion,
          department: item.department || '',
          ...(autoVersion ? {} : { manual_version: manualVersion }),
        };

        const result = await uploadDocument(payload);

        // Update status
        setUploadQueue(prev => prev.map((item, i) => 
          i === index 
            ? { ...item, status: result.success ? 'success' : 'error', error: result.success ? undefined : (result.error || 'Upload failed') }
            : item
        ));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadQueue(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'error', error: errorMessage } : item
        ));
      }
    }

    // All files processed
    setIsUploading(false);
    setCurrentUploadIndex(-1);
    setUploadQueue(prev => {
      const successCount = prev.filter(item => item.status === 'success').length;
      showToast(`${successCount} of ${prev.length} file(s) uploaded successfully`, 'success');
      return prev;
    });
  }, [uploadQueue, projectId, autoVersion, manualVersion, showToast]);

  // Handle form submission - start sequential upload
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    if (uploadQueue.length === 0) {
      return;
    }

    setIsUploading(true);
    setErrors({});
    
    // Start sequential upload
    startSequentialUpload();
  }, [uploadQueue, validateForm, showToast, startSequentialUpload]);

  // Handle Done button
  const handleDone = useCallback(() => {
    onSuccess?.();
    onClose();
  }, [onSuccess, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isUploading) {
      onClose();
    }
  }, [onClose, isUploading]);

  // Department options from enum
  const departmentOptions = Object.values(Department).map(dept => ({
    value: dept.toLowerCase(),
    label: dept.replace(/_/g, ' '),
  }));

  // Calculate upload statistics
  const successCount = uploadQueue.filter(item => item.status === 'success').length;
  const errorCount = uploadQueue.filter(item => item.status === 'error').length;
  const pendingCount = uploadQueue.filter(item => item.status === 'pending').length;
  const uploadingCount = uploadQueue.filter(item => item.status === 'uploading').length;
  const allUploaded = uploadQueue.length > 0 && successCount + errorCount === uploadQueue.length && uploadingCount === 0;
  const canUpload = uploadQueue.length > 0 && !isUploading && pendingCount > 0;

  return (
    <div 
      className="fixed inset-0 z-[1001] flex items-center justify-center p-2 sm:p-4 md:p-6"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl min-w-[320px] bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight truncate">Upload Documents</h2>
            <p className="text-[7px] sm:text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5 truncate">
              {projectName ? `Project: ${projectName}` : 'Document Configuration'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-panel)] transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">{errors.general}</p>
            </div>
          )}

          {/* File Upload Area */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">
              Document Files <span className="text-rose-500">*</span>
            </label>
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/10'
                  : 'border-[var(--border-color)] hover:border-[var(--accent-blue)]/50 hover:bg-[var(--bg-panel)]'
              } ${errors.file ? 'border-rose-500' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isUploading}
                accept="*/*"
              />
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-[var(--text-muted)]"
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
              <p className="text-[10px] sm:text-xs font-bold text-[var(--text-primary)] mb-1">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-[7px] sm:text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                Maximum file size: {formatFileSize(MAX_FILE_SIZE)} • Multiple files allowed
              </p>
            </div>
            {errors.file && <p className="text-[8px] font-bold text-rose-500 pl-1">{errors.file}</p>}
          </div>

          {/* File List */}
          {uploadQueue.length > 0 && (
            <div className="space-y-2 sm:space-y-3 max-h-[40vh] sm:max-h-96 overflow-y-auto border border-[var(--border-color)] rounded-xl p-3 sm:p-4 bg-[var(--bg-panel)]">
              <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Selected Files ({uploadQueue.length})
              </div>
              {uploadQueue.map((item, index) => {
                const hasError = item.status === 'error';
                const isPending = item.status === 'pending';
                const showFields = isPending || item.status === 'uploading';
                const missingType = !item.docType || item.docType.trim() === '';
                const missingDept = !item.department || item.department.trim() === '';
                
                return (
                  <div
                    key={`${item.file.name}-${item.file.size}-${index}`}
                    className={`p-2.5 sm:p-3 rounded-lg bg-[var(--bg-sidebar)] border ${
                      missingType || missingDept ? 'border-rose-500/50' : 'border-[var(--border-color)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {item.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)]/30" />
                        )}
                        {item.status === 'uploading' && (
                          <div className="w-5 h-5 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
                        )}
                        {item.status === 'success' && (
                          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {item.status === 'error' && (
                          <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>

                      {/* File Info and Fields */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* File Name and Size */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-bold text-[var(--text-primary)] truncate">{item.file.name}</p>
                            <p className="text-[7px] sm:text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wide mt-0.5">
                              {formatFileSize(item.file.size)}
                            </p>
                          </div>
                          {/* Remove Button */}
                          {isPending && !isUploading && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 transition-colors flex-shrink-0"
                            >
                              <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Document Type and Department Dropdowns - Inline */}
                        {showFields && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              {/* Document Type */}
                              <div className="space-y-1">
                                <label className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                  Type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                  value={item.docType || ''}
                                  onChange={(e) => handleFileDocTypeChange(index, e.target.value)}
                                  disabled={isUploading}
                                  className={`w-full border rounded-lg py-1.5 sm:py-2 px-2 text-[8px] sm:text-[9px] font-mono font-bold bg-[var(--bg-panel)] focus:outline-none focus:ring-1 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                                    missingType ? 'border-rose-500' : 'border-[var(--border-color)]'
                                  }`}
                                >
                                  <option value="">Select type</option>
                                  {DOCUMENT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Department */}
                              <div className="space-y-1">
                                <label className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                  Department <span className="text-rose-500">*</span>
                                </label>
                                <select
                                  value={item.department || ''}
                                  onChange={(e) => handleFileDepartmentChange(index, e.target.value)}
                                  disabled={isUploading}
                                  className={`w-full border rounded-lg py-1.5 sm:py-2 px-2 text-[8px] sm:text-[9px] font-mono font-bold bg-[var(--bg-panel)] focus:outline-none focus:ring-1 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                                    missingDept ? 'border-rose-500' : 'border-[var(--border-color)]'
                                  }`}
                                >
                                  <option value="">Select dept</option>
                                  {departmentOptions.map(dept => (
                                    <option key={dept.value} value={dept.value}>
                                      {dept.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Custom Type Input - Show when "Other" is selected */}
                            {item.docType === 'other' && (
                              <div className="space-y-1">
                                <label className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                  Other Type Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={item.customType || ''}
                                  onChange={(e) => handleCustomTypeChange(index, e.target.value)}
                                  placeholder="Enter custom document type"
                                  disabled={isUploading}
                                  className={`w-full border rounded-lg py-1.5 sm:py-2 px-2 text-[8px] sm:text-[9px] font-mono font-bold bg-[var(--bg-panel)] focus:outline-none focus:ring-1 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
                                    missingType && item.docType === 'other' ? 'border-rose-500' : 'border-[var(--border-color)]'
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Error Message */}
                        {hasError && item.error && (
                          <p className="text-[8px] font-bold text-rose-500" title={item.error}>
                            {item.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload Summary */}
          {isUploading && (
            <div className="p-3 bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30 rounded-xl">
              <p className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-wide text-center">
                Uploading {currentUploadIndex + 1} of {uploadQueue.length} files...
              </p>
            </div>
          )}

          {allUploaded && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide text-center">
                {successCount} of {uploadQueue.length} file(s) uploaded successfully
                {errorCount > 0 && ` • ${errorCount} failed`}
              </p>
            </div>
          )}

          {/* Validation Errors Summary */}
          {(errors.doc_type || errors.department) && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              {errors.doc_type && (
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">{errors.doc_type}</p>
              )}
              {errors.department && (
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mt-1">{errors.department}</p>
              )}
            </div>
          )}

          {/* Version Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_version"
                checked={autoVersion}
                onChange={(e) => setAutoVersion(e.target.checked)}
                disabled={isUploading}
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
                  disabled={isUploading}
                  className={`w-full border rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-mono font-bold bg-[var(--bg-panel)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all disabled:opacity-50 ${
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
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 py-2.5 sm:py-3 border border-[var(--border-color)] rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-panel)] transition-all disabled:opacity-50"
            >
              Skip
            </button>
            {allUploaded ? (
              <button
                type="button"
                onClick={handleDone}
                className="flex-1 py-2.5 sm:py-3 bg-emerald-500 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white hover:bg-emerald-500/90 transition-all"
              >
                Done
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canUpload || isUploading}
                className="flex-1 py-2.5 sm:py-3 bg-[var(--accent-blue)] rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white hover:bg-[var(--accent-blue)]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${uploadQueue.length > 0 ? `${uploadQueue.length} File${uploadQueue.length > 1 ? 's' : ''}` : 'Document'}`
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
});

UploadDocumentModal.displayName = 'UploadDocumentModal';

export default UploadDocumentModal;
