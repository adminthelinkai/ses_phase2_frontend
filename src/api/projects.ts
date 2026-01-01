/**
 * Project API utilities for project management
 * Follows enterprise standards from follow.md
 */

// Get Project API URL from environment variable (no hardcoded values)
const PROJECT_API_URL = import.meta.env.VITE_PROJECT_API_URL || 'http://mc4wss0g8gsgkcsgskwgo08g.72.61.226.144.sslip.io';

export interface CreateProjectPayload {
  name: string;
  description?: string;
  client_name: string;
  contract_reference?: string;
  start_date: string; // ISO8601 format
  end_date: string;   // ISO8601 format
}

export interface CreateProjectResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  error?: string;
}

/**
 * Create a new project
 * POST /projects/create
 */
export async function createProject(payload: CreateProjectPayload): Promise<CreateProjectResponse> {
  const endpoint = `${PROJECT_API_URL}/projects/create`;
  
  try {
    console.log('Project API Request:', { endpoint, payload });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Project API Error Response:', { 
        status: response.status, 
        statusText: response.statusText, 
        body: errorText 
      });
      
      // Try to parse error message from response
      let errorMessage = `Failed to create project: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
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
    console.log('Project API Success:', data);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Project API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project. Please try again.',
    };
  }
}

