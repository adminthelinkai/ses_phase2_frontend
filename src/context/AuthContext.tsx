import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, ParticipantAuth } from '../lib/supabase';
import { AuthState, User, Department, Role } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'epcm-auth-state';
const SESSION_VERSION = 3; // Increment this when user schema changes to force refresh

// Map database department code (from departments.code) to Department enum
const mapDepartment = (deptCode: string | null): Department => {
  if (!deptCode) return Department.CSA;
  const deptMap: Record<string, Department> = {
    'PROJECT': Department.PROJECT_MANAGEMENT,
    'PROCESS': Department.PROCESS,
    'MECHANICAL': Department.MECHANICAL,
    'CIVIL': Department.CSA,
    'ELECTRICAL': Department.ELECTRICAL,
    'I&C': Department.INSTRUMENT,
    'HSE': Department.CSA,
    // Legacy mappings
    'ADMIN': Department.ADMIN,
    'MANAGEMENT': Department.MANAGEMENT,
    'MGMT': Department.MANAGEMENT, // Management department code
    'CSA': Department.CSA,
    'INSTRUMENT': Department.INSTRUMENT,
    'PROJECT_MANAGEMENT': Department.PROJECT_MANAGEMENT,
  };
  return deptMap[deptCode.toUpperCase()] || Department.CSA;
};

// Map database designation title (from designations.title) to Role enum
const mapRole = (designationTitle: string | null): Role => {
  if (!designationTitle) return Role.ENGINEER;
  const titleUpper = designationTitle.toUpperCase();
  
  // Map designation titles to roles
  const roleMap: Record<string, Role> = {
    'ADMIN': Role.ADMIN,
    'SYSTEM ADMINISTRATOR': Role.ADMIN,
    'HEAD OF SITE ENGINEERING SERVICES': Role.HEAD_SES, // Head of SES - Full Access
    'HEAD_SES': Role.HEAD_SES,
    'MANAGEMENT': Role.MANAGEMENT,
    'MANAGNMENT': Role.MANAGEMENT, // Handle typo in DB
    'HOD': Role.HOD,
    'HEAD OF DEPARTRMENT': Role.HOD,
    'ENGINEER': Role.ENGINEER,
    'DESIGNER': Role.DESIGNER,
    'PROJECT MANAGER': Role.HOD,
    'SENIOR ENGINEER': Role.ENGINEER,
  };
  
  // Check exact match first
  if (roleMap[titleUpper]) {
    return roleMap[titleUpper];
  }
  
  // Check if title contains key words - but not HEAD OF SES (already handled above)
  if (titleUpper.includes('HEAD OF SITE')) {
    return Role.HEAD_SES;
  }
  if (titleUpper.includes('MANAGER') || titleUpper.includes('HEAD')) {
    return Role.HOD;
  }
  if (titleUpper.includes('SENIOR')) {
    return Role.ENGINEER;
  }
  if (titleUpper.includes('DESIGNER') || titleUpper.includes('COORDINATOR')) {
    return Role.DESIGNER;
  }
  
  return Role.ENGINEER;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null });
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const hasInitialized = useRef(false);

  // Helper to fetch fresh user data from database
  const fetchUserData = useCallback(async (participantId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          designations:designation_id (title),
          departments:department_id (code)
        `)
        .eq('participant_id', participantId)
        .single();

      if (error || !data) {
        console.error('Failed to fetch user data:', error);
        return null;
      }

      const participant = data as ParticipantAuth & {
        designations: { title: string } | null;
        departments: { code: string } | null;
      };
      
      return {
        id: participant.participant_id,
        name: participant.name,
        department: mapDepartment(participant.departments?.code || null),
        role: mapRole(participant.designations?.title || null),
        participantId: participant.participant_id,
      };
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  }, []);

  // Initialize auth state from localStorage and refresh from DB
  useEffect(() => {
    const initializeAuth = async () => {
      if (hasInitialized.current) {
        console.log('[Auth] Already initialized, skipping');
        return;
      }
      hasInitialized.current = true;
      console.log('[Auth] Initializing auth...');

      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      console.log('[Auth] Saved auth from localStorage:', savedAuth ? 'found' : 'not found');
      
      if (!savedAuth) {
        console.log('[Auth] No saved auth, setting isLoading=false');
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(savedAuth);
        console.log('[Auth] Parsed auth:', { 
          isAuthenticated: parsed.isAuthenticated, 
          userId: parsed.user?.id, 
          version: parsed.version,
          participantId: parsed.user?.participantId 
        });
        
        // Check if session version matches - if not, force refresh
        if (parsed.version !== SESSION_VERSION && parsed.user?.id) {
          console.log('[Auth] Session version mismatch, refreshing user data...', {
            savedVersion: parsed.version,
            currentVersion: SESSION_VERSION
          });
          const freshUser = await fetchUserData(parsed.user.id);
          console.log('[Auth] Fresh user data:', freshUser);
          
          if (freshUser) {
            const newAuth = { isAuthenticated: true, user: freshUser };
            setAuth(newAuth);
          } else {
            console.log('[Auth] User not found in DB, clearing session');
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } else if (parsed.isAuthenticated && parsed.user) {
          console.log('[Auth] Valid session with correct version, restoring');
          setAuth({ isAuthenticated: true, user: parsed.user });
        }
      } catch (err) {
        console.error('[Auth] Error parsing saved auth:', err);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      
      console.log('[Auth] Initialization complete, setting isLoading=false');
      setIsLoading(false);
    };

    initializeAuth();
  }, [fetchUserData]);

  // Persist auth state to localStorage whenever it changes
  useEffect(() => {
    console.log('[Auth] Auth state changed:', { 
      isAuthenticated: auth.isAuthenticated, 
      userId: auth.user?.id,
      participantId: auth.user?.participantId,
      isLoading 
    });
    
    if (auth.isAuthenticated && auth.user) {
      const toStore = { ...auth, version: SESSION_VERSION };
      console.log('[Auth] Saving to localStorage');
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toStore));
    } else if (!isLoading && hasInitialized.current) {
      // Only clear if we've initialized and auth is explicitly false
      console.log('[Auth] Clearing localStorage (not authenticated)');
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth, isLoading]);

  // Refresh session - can be called to get latest user data
  const refreshSession = useCallback(async () => {
    if (!auth.user?.id) return;
    
    setIsLoading(true);
    const freshUser = await fetchUserData(auth.user.id);
    if (freshUser) {
      setAuth({ isAuthenticated: true, user: freshUser });
    }
    setIsLoading(false);
  }, [auth.user?.id, fetchUserData]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[Auth] Login attempt for:', email);
    setIsLoading(true);
    
    try {
      // Query participants table with joins to get designation title and department code
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          designations:designation_id (title),
          departments:department_id (code)
        `)
        .eq('email', email.toLowerCase().trim())
        .single();

      console.log('[Auth] DB query result:', { data: data ? 'found' : 'not found', error });

      if (error || !data) {
        console.log('[Auth] Login failed: user not found');
        setIsLoading(false);
        return { success: false, error: 'Invalid email address' };
      }

      const participant = data as ParticipantAuth & {
        designations: { title: string } | null;
        departments: { code: string } | null;
      };
      
      console.log('[Auth] Participant found:', {
        participant_id: participant.participant_id,
        name: participant.name,
        email: participant.email,
        designation_title: participant.designations?.title,
        department_code: participant.departments?.code
      });

      // Check password (Note: In production, passwords should be hashed)
      const trimmedPassword = password.trim();
      if (participant.password !== trimmedPassword) {
        console.log('[Auth] Login failed: password mismatch');
        setIsLoading(false);
        return { success: false, error: 'Invalid password' };
      }

      // Create user object from participant data
      const user: User = {
        id: participant.participant_id,
        name: participant.name,
        department: mapDepartment(participant.departments?.code || null),
        role: mapRole(participant.designations?.title || null),
        participantId: participant.participant_id,
      };

      console.log('[Auth] Login successful, user:', user);
      setAuth({ isAuthenticated: true, user });
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setAuth({ isAuthenticated: false, user: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, refreshSession, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

