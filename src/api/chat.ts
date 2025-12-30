/**
 * Chat API utilities for Project Intelligence queries
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

const API_ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get Gemini API key from environment (defined in vite.config.ts)
const getGeminiApiKey = () => {
  // @ts-ignore - process.env is defined via vite.config.ts define
  return typeof process !== 'undefined' && process.env?.GEMINI_API_KEY 
    ? process.env.GEMINI_API_KEY 
    : undefined;
};

/**
 * Send a query to the AI chat endpoint
 */
export async function sendChatQuery(query: string): Promise<ChatResponse> {
  try {
    const GEMINI_API_KEY = getGeminiApiKey();
    
    // If Gemini API key is available, use it directly
    if (GEMINI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an AI assistant for an EPCM (Engineering, Procurement, Construction, and Management) system. 
                Answer the following technical project query: ${query}`
              }]
            }]
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      
      return { message: text };
    }

    // Fallback to backend API endpoint
    const response = await fetch(`${API_ENDPOINT}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { message: data.message || data.response || 'No response received.' };
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      message: '',
      error: error instanceof Error ? error.message : 'Failed to process query. Please try again.',
    };
  }
}

