/**
 * Document upload API utilities
 * Follows enterprise standards from follow.md
 */

// Get Documents API URL from environment variable (no hardcoded values)
const DOCUMENTS_API_URL = import.meta.env.VITE_DOCUMENTS_API_URL || import.meta.env.VITE_PROJECT_API_URL || 'http://mc4wss0g8gsgkcsgskwgo08g.72.61.226.144.sslip.io';

export interface UploadDocumentPayload {
  file: File;
  project_id: string;
  doc_type: string;
  file_type?: string;
  auto_version?: boolean;
  manual_version?: number;
  department: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  data?: {
    document_id?: string;
    file_name?: string;
    file_path?: string;
    version?: number;
    [key: string]: unknown;
  };
  error?: string;
}

/**
 * Upload a document
 * POST /documents/upload
 */
export async function uploadDocument(payload: UploadDocumentPayload): Promise<UploadDocumentResponse> {
  const endpoint = `${DOCUMENTS_API_URL}/documents/upload`;
  
  try {
    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('project_id', payload.project_id);
    formData.append('doc_type', payload.doc_type);
    formData.append('file_type', payload.file_type || 'documents');
    formData.append('auto_version', String(payload.auto_version ?? true));
    if (payload.manual_version !== undefined) {
      formData.append('manual_version', String(payload.manual_version));
    }
    formData.append('department', payload.department);

    console.log('Document Upload API Request:', { 
      endpoint, 
      project_id: payload.project_id,
      doc_type: payload.doc_type,
      file_type: payload.file_type || 'documents',
      department: payload.department,
      file_name: payload.file.name,
      file_size: payload.file.size,
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        // Don't set Content-Type header - browser will set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Document Upload API Error Response:', { 
        status: response.status, 
        statusText: response.statusText, 
        body: errorText 
      });
      
      // Try to parse error message from response
      let errorMessage = `Failed to upload document: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // Use default error message
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    console.log('Document Upload API Success:', data);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Document Upload API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload document. Please try again.',
    };
  }
}

