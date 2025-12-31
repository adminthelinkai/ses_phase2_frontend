/**
 * Chat API utilities for Project Intelligence queries
 */

import { ConversationHistoryItem } from '../lib/supabase';

// Get Chat API URL from environment variable
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8000';

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface ProjectChatPayload {
  participant_id: string;
  message: string;
  conversation_history: ConversationHistoryItem[];
  project_id: string;
  enable_tools: boolean;
}

export interface GlobalChatPayload {
  message: string;
  conversation_history: ConversationHistoryItem[];
  project_id: string;
}

/**
 * Send a query to the Project Chat endpoint
 * Requires a valid participant_id from the participants table
 */
export async function sendProjectChatQuery(
  participantId: string,
  message: string,
  conversationHistory: ConversationHistoryItem[],
  projectId: string,
  enableTools: boolean = true
): Promise<ChatResponse> {
  const endpoint = `${CHAT_API_URL}/chat`;
  
  try {
    const payload: ProjectChatPayload = {
      participant_id: participantId,
      message,
      conversation_history: conversationHistory,
      project_id: projectId,
      enable_tools: enableTools,
    };

    console.log('Project Chat API Request:', { endpoint, payload });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Project Chat API Error Response:', { status: response.status, statusText: response.statusText, body: errorText });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { message: data.message || data.response || 'No response received.' };
  } catch (error) {
    console.error('Project Chat API error:', error);
    return {
      message: '',
      error: error instanceof Error ? error.message : 'Failed to process query. Please try again.',
    };
  }
}

/**
 * Send a query to the Global Chat endpoint
 * Does NOT require participant_id
 */
export async function sendGlobalChatQuery(
  message: string,
  conversationHistory: ConversationHistoryItem[],
  projectId: string
): Promise<ChatResponse> {
  const endpoint = `${CHAT_API_URL}/chat/universal`;
  
  try {
    const payload: GlobalChatPayload = {
      message,
      conversation_history: conversationHistory,
      project_id: projectId,
    };

    console.log('Global Chat API Request:', { endpoint, payload });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Global Chat API Error Response:', { status: response.status, statusText: response.statusText, body: errorText });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { message: data.message || data.response || 'No response received.' };
  } catch (error) {
    console.error('Global Chat API error:', error);
    return {
      message: '',
      error: error instanceof Error ? error.message : 'Failed to process query. Please try again.',
    };
  }
}
