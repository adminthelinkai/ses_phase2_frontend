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
  participant_id: string | null;
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
  description?: string;
  client_name?: string;
  status?: string;
}

export async function getBackendProjects(): Promise<BackendProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('project_id, name, description, client_name, status')
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

// ============== PROJECT ASSIGNMENTS ==============

export interface ProjectAssignment {
  assignment_id: string;
  participant_id: string;
  project_id: string;
  role_in_project?: string;
  is_active: boolean;
}

/**
 * Get projects assigned to a participant
 * Uses RPC function to bypass RLS
 */
export async function getAssignedProjects(participantId: string): Promise<BackendProject[]> {
  console.log('[Supabase] getAssignedProjects called with:', participantId);
  
  if (!participantId) {
    console.warn('[Supabase] No participant_id provided, returning empty projects');
    return [];
  }

  // Use RPC function that bypasses RLS
  console.log('[Supabase] Calling get_participant_projects RPC for:', participantId);
  const { data, error } = await supabase
    .rpc('get_participant_projects', { p_participant_id: participantId });

  console.log('[Supabase] RPC result:', { data, error });

  if (error) {
    console.error('[Supabase] Error fetching assigned projects:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('[Supabase] No projects found for participant:', participantId);
    return [];
  }

  return data as BackendProject[];
}

/**
 * Get team member's participant_id
 */
export async function getTeamMemberParticipantId(teamMemberId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('participant_id')
    .eq('id', teamMemberId)
    .single();

  if (error) {
    console.error('Error fetching team member participant_id:', error);
    return null;
  }
  
  return data?.participant_id || null;
}

// ============== ALL PARTICIPANTS (For Team Assignment) ==============

export interface ParticipantFull {
  participant_id: string;
  participant_key: string;
  name: string;
  discipline: string;
  designation: string;
  is_hod: boolean;
  seniority_level: string | null;
}

// Discipline display names for UI
export const DISCIPLINE_DISPLAY_NAMES: Record<string, string> = {
  'PROJECT': 'Project Management',
  'PROCESS': 'Process Engineering',
  'MECHANICAL': 'Mechanical Engineering',
  'CIVIL': 'Civil & Structural',
  'ELECTRICAL': 'Electrical Engineering',
  'I&C': 'Instrumentation & Control',
  'HSE': 'Health, Safety & Environment',
};

// Discipline order for consistent display
export const DISCIPLINE_ORDER = [
  'PROJECT',
  'PROCESS',
  'MECHANICAL',
  'CIVIL',
  'ELECTRICAL',
  'I&C',
  'HSE',
];

/**
 * Get all participants for team assignment
 */
export async function getAllParticipants(): Promise<ParticipantFull[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('participant_id, participant_key, name, discipline, designation, is_hod, seniority_level')
    .order('discipline', { ascending: true })
    .order('is_hod', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('[Supabase] Error fetching all participants:', error);
    return [];
  }

  return (data || []) as ParticipantFull[];
}

/**
 * Group participants by discipline
 */
export function groupParticipantsByDiscipline(
  participants: ParticipantFull[]
): Record<string, ParticipantFull[]> {
  const grouped: Record<string, ParticipantFull[]> = {};
  
  for (const participant of participants) {
    const discipline = participant.discipline || 'OTHER';
    if (!grouped[discipline]) {
      grouped[discipline] = [];
    }
    grouped[discipline].push(participant);
  }
  
  // Sort HODs first within each group
  for (const discipline of Object.keys(grouped)) {
    grouped[discipline].sort((a, b) => {
      if (a.is_hod && !b.is_hod) return -1;
      if (!a.is_hod && b.is_hod) return 1;
      return a.name.localeCompare(b.name);
    });
  }
  
  return grouped;
}

// ============== PARTICIPANT PROJECT ASSIGNMENT ==============

export interface ParticipantAssignmentPayload {
  participant_id: string;
  project_id: string;
  role_in_project?: string;
}

/**
 * Assign multiple participants to a project
 * Uses upsert to handle existing assignments
 */
export async function assignParticipantsToProject(
  projectId: string,
  participantIds: string[]
): Promise<{ success: boolean; error?: string; count?: number }> {
  if (!projectId || participantIds.length === 0) {
    return { success: false, error: 'Invalid project ID or empty participant list' };
  }

  try {
    // Create assignment records
    const assignments = participantIds.map((participantId) => ({
      assignment_id: crypto.randomUUID(),
      participant_id: participantId,
      project_id: projectId,
      assigned_at: new Date().toISOString(),
      is_active: true,
    }));

    const { data, error } = await supabase
      .from('participant_project_assignments')
      .upsert(assignments, {
        onConflict: 'participant_id,project_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('[Supabase] Error assigning participants:', error);
      return { success: false, error: error.message };
    }

    console.log('[Supabase] Successfully assigned participants:', data?.length);
    return { success: true, count: data?.length || participantIds.length };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Supabase] Exception assigning participants:', err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get participants currently assigned to a project
 */
export async function getProjectParticipants(projectId: string): Promise<ParticipantFull[]> {
  if (!projectId) {
    return [];
  }

  const { data, error } = await supabase
    .from('participant_project_assignments')
    .select(`
      participant_id,
      participants!inner (
        participant_id,
        participant_key,
        name,
        discipline,
        designation,
        is_hod,
        seniority_level
      )
    `)
    .eq('project_id', projectId)
    .eq('is_active', true);

  if (error) {
    console.error('[Supabase] Error fetching project participants:', error);
    return [];
  }

  // Flatten the nested participants data
  // Supabase join returns participants as nested object
  interface AssignmentWithParticipant {
    participant_id: string;
    participants: ParticipantFull | ParticipantFull[];
  }
  
  return (data || []).map((item: AssignmentWithParticipant) => {
    // Handle both single object and array responses
    const participant = Array.isArray(item.participants) 
      ? item.participants[0] 
      : item.participants;
    return participant;
  }).filter(Boolean) as ParticipantFull[];
}

// ============== HOD ASSIGNMENT FUNCTIONS ==============

/**
 * Get all HODs (participants with is_hod = true)
 */
export async function getAllHODs(): Promise<ParticipantFull[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('participant_id, participant_key, name, discipline, designation, is_hod, seniority_level')
    .eq('is_hod', true)
    .order('discipline', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('[Supabase] Error fetching HODs:', error);
    return [];
  }

  return (data || []) as ParticipantFull[];
}

/**
 * Get HODs currently assigned to a project
 */
export async function getProjectAssignedHODs(projectId: string): Promise<ParticipantFull[]> {
  if (!projectId) {
    return [];
  }

  const { data, error } = await supabase
    .from('participant_project_assignments')
    .select(`
      participant_id,
      participants!inner (
        participant_id,
        participant_key,
        name,
        discipline,
        designation,
        is_hod,
        seniority_level
      )
    `)
    .eq('project_id', projectId)
    .eq('is_active', true);

  if (error) {
    console.error('[Supabase] Error fetching project HODs:', error);
    return [];
  }

  // Flatten and filter to only HODs
  interface AssignmentWithParticipant {
    participant_id: string;
    participants: ParticipantFull | ParticipantFull[];
  }
  
  return (data || [])
    .map((item: AssignmentWithParticipant) => {
      const participant = Array.isArray(item.participants) 
        ? item.participants[0] 
        : item.participants;
      return participant;
    })
    .filter((p): p is ParticipantFull => p !== null && p !== undefined && p.is_hod === true);
}

/**
 * Update project HOD assignments (replace all)
 * Deactivates all existing HOD assignments and creates new ones
 */
export async function updateProjectHODs(
  projectId: string,
  hodParticipantIds: string[]
): Promise<{ success: boolean; error?: string; count?: number }> {
  if (!projectId) {
    return { success: false, error: 'Invalid project ID' };
  }

  try {
    // First, get all HOD participant IDs to know which assignments are HOD-related
    const allHODs = await getAllHODs();
    const hodIds = allHODs.map(h => h.participant_id);

    // Check which HODs are already assigned to this project
    const { data: existingAssignments } = await supabase
      .from('participant_project_assignments')
      .select('assignment_id, participant_id, is_active')
      .eq('project_id', projectId)
      .in('participant_id', hodIds);

    const existingMap = new Map(
      (existingAssignments || []).map(a => [a.participant_id, a])
    );

    // Determine which assignments to update and which to insert
    const toActivate: string[] = []; // assignment_ids to set is_active = true
    const toDeactivate: string[] = []; // assignment_ids to set is_active = false
    const toInsert: string[] = []; // participant_ids to create new assignments

    // For each HOD, determine the action
    for (const hodId of hodIds) {
      const existing = existingMap.get(hodId);
      const shouldBeAssigned = hodParticipantIds.includes(hodId);

      if (existing) {
        // Assignment exists - update is_active status if needed
        if (shouldBeAssigned && !existing.is_active) {
          toActivate.push(existing.assignment_id);
        } else if (!shouldBeAssigned && existing.is_active) {
          toDeactivate.push(existing.assignment_id);
        }
      } else if (shouldBeAssigned) {
        // No existing assignment, need to create one
        toInsert.push(hodId);
      }
    }

    // Deactivate removed HODs
    if (toDeactivate.length > 0) {
      const { error: deactivateError } = await supabase
        .from('participant_project_assignments')
        .update({ is_active: false })
        .in('assignment_id', toDeactivate);

      if (deactivateError) {
        console.error('[Supabase] Error deactivating HOD assignments:', deactivateError);
        return { success: false, error: deactivateError.message };
      }
    }

    // Activate previously deactivated HODs
    if (toActivate.length > 0) {
      const { error: activateError } = await supabase
        .from('participant_project_assignments')
        .update({ is_active: true })
        .in('assignment_id', toActivate);

      if (activateError) {
        console.error('[Supabase] Error activating HOD assignments:', activateError);
        return { success: false, error: activateError.message };
      }
    }

    // Insert new HOD assignments
    if (toInsert.length > 0) {
      const assignments = toInsert.map((participantId) => ({
        assignment_id: crypto.randomUUID(),
        participant_id: participantId,
        project_id: projectId,
        assigned_at: new Date().toISOString(),
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from('participant_project_assignments')
        .insert(assignments);

      if (insertError) {
        console.error('[Supabase] Error inserting HOD assignments:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    console.log('[Supabase] Successfully updated HOD assignments:', {
      activated: toActivate.length,
      deactivated: toDeactivate.length,
      inserted: toInsert.length,
    });
    return { success: true, count: hodParticipantIds.length };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Supabase] Exception updating HOD assignments:', err);
    return { success: false, error: errorMessage };
  }
}

