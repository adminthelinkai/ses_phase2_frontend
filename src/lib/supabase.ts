import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase-dev-p2.thelinkai.com';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NzA3Nzk0MCwiZXhwIjo0OTIyNzUxNTQwLCJyb2xlIjoiYW5vbiJ9.jWVsv0b5WQ7epbpVEguHbfbPk4wrLORPxwNZ8KRsMwg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for team_members table
export interface TeamMember {
  id: string;
  email: string;
  password: string;
  department: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

// Types for chat sessions
export interface ChatSession {
  id: string;
  participant_id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Types for chat messages
export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Conversation history format for API
export interface ConversationHistoryItem {
  role: string;
  content: string;
}

// ============== PROJECT CHAT SESSIONS ==============

export async function getProjectChatSessions(
  participantId: string,
  projectId: string
): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('project_chat_sessions')
    .select('*')
    .eq('participant_id', participantId)
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching project chat sessions:', error);
    return [];
  }
  return data || [];
}

export async function createProjectChatSession(
  participantId: string,
  projectId: string,
  title: string
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('project_chat_sessions')
    .insert({
      participant_id: participantId,
      project_id: projectId,
      title: title.slice(0, 100), // Limit title length
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project chat session:', error);
    return null;
  }
  return data;
}

export async function deleteProjectChatSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('project_chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting project chat session:', error);
    return false;
  }
  return true;
}

export async function updateProjectChatSessionTimestamp(sessionId: string): Promise<void> {
  await supabase
    .from('project_chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);
}

export async function updateProjectChatSessionTitle(sessionId: string, title: string): Promise<boolean> {
  const { error } = await supabase
    .from('project_chat_sessions')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating project chat session title:', error);
    return false;
  }
  return true;
}

// ============== PROJECT CHAT MESSAGES ==============

export async function getProjectChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('project_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching project chat messages:', error);
    return [];
  }
  return data || [];
}

export async function saveProjectChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('project_chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving project chat message:', error);
    return null;
  }

  // Update session timestamp
  await updateProjectChatSessionTimestamp(sessionId);
  
  return data;
}

// ============== GLOBAL CHAT SESSIONS ==============

export async function getGlobalChatSessions(
  participantId: string,
  projectId: string
): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('global_chat_sessions')
    .select('*')
    .eq('participant_id', participantId)
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching global chat sessions:', error);
    return [];
  }
  return data || [];
}

export async function createGlobalChatSession(
  participantId: string,
  projectId: string,
  title: string
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('global_chat_sessions')
    .insert({
      participant_id: participantId,
      project_id: projectId,
      title: title.slice(0, 100),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating global chat session:', error);
    return null;
  }
  return data;
}

export async function deleteGlobalChatSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('global_chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting global chat session:', error);
    return false;
  }
  return true;
}

export async function updateGlobalChatSessionTimestamp(sessionId: string): Promise<void> {
  await supabase
    .from('global_chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);
}

export async function updateGlobalChatSessionTitle(sessionId: string, title: string): Promise<boolean> {
  const { error } = await supabase
    .from('global_chat_sessions')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating global chat session title:', error);
    return false;
  }
  return true;
}

// ============== GLOBAL CHAT MESSAGES ==============

export async function getGlobalChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('global_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching global chat messages:', error);
    return [];
  }
  return data || [];
}

export async function saveGlobalChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('global_chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving global chat message:', error);
    return null;
  }

  // Update session timestamp
  await updateGlobalChatSessionTimestamp(sessionId);
  
  return data;
}

// ============== UTILITY FUNCTIONS ==============

export function buildConversationHistory(messages: ChatMessage[]): ConversationHistoryItem[] {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

// ============== PARTICIPANTS ==============

export interface Participant {
  participant_id: string;
  participant_key: string;
  name: string;
  discipline: string;
  designation: string;
}

// Department to discipline mapping
const departmentToDiscipline: Record<string, string> = {
  'PROJECT_MANAGEMENT': 'PROJECT',
  'CSA': 'CIVIL',
  'ELECTRICAL': 'ELECTRICAL',
  'MECHANICAL': 'MECHANICAL',
  'PROCESS': 'PROCESS',
  'INSTRUMENT': 'INSTRUMENT',
  'ADMIN': 'PROJECT',
  'MANAGEMENT': 'PROJECT',
};

export async function getParticipantByDepartment(department: string): Promise<Participant | null> {
  const discipline = departmentToDiscipline[department] || 'PROJECT';
  
  const { data, error } = await supabase
    .from('participants')
    .select('participant_id, participant_key, name, discipline, designation')
    .eq('discipline', discipline)
    .eq('is_hod', true)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching participant:', error);
    // Fallback to PM participant
    const { data: fallback } = await supabase
      .from('participants')
      .select('participant_id, participant_key, name, discipline, designation')
      .eq('participant_key', 'PM')
      .single();
    return fallback || null;
  }
  return data;
}

// ============== PROJECTS (Backend) ==============

export interface BackendProject {
  project_id: string;
  name: string;
}

export async function getBackendProjects(): Promise<BackendProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('project_id, name')
    .limit(10);

  if (error) {
    console.error('Error fetching backend projects:', error);
    return [];
  }
  return data || [];
}

export async function getDefaultBackendProjectId(): Promise<string> {
  const { data, error } = await supabase
    .from('projects')
    .select('project_id')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching default project:', error);
    return '';
  }
  return data.project_id;
}

