import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, TeamMember } from '../lib/supabase';
import { AuthState, User, Department, Role } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'epcm-auth-state';
const SESSION_VERSION = 2; // Increment this when user schema changes to force refresh

// Map database department string to Department enum
const mapDepartment = (dept: string | null): Department => {
  if (!dept) return Department.CSA;
  const deptMap: Record<string, Department> = {
    'ADMIN': Department.ADMIN,
    'MANAGEMENT': Department.MANAGEMENT,
    'CSA': Department.CSA,
    'ELECTRICAL': Department.ELECTRICAL,
    'INSTRUMENT': Department.INSTRUMENT,
    'PROJECT_MANAGEMENT': Department.PROJECT_MANAGEMENT,
    'PROCESS': Department.PROCESS,
    'MECHANICAL': Department.MECHANICAL,
  };
  return deptMap[dept.toUpperCase()] || Department.CSA;
};

// Map database role string to Role enum
const mapRole = (role: string | null): Role => {
  if (!role) return Role.ENGINEER;
  const roleMap: Record<string, Role> = {
    'ADMIN': Role.ADMIN,
    'MANAGEMENT': Role.MANAGEMENT,
    'HOD': Role.HOD,
    'ENGINEER': Role.ENGINEER,
    'DESIGNER': Role.DESIGNER,
  };
  return roleMap[role.toUpperCase()] || Role.ENGINEER;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null });
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const hasInitialized = useRef(false);

  // Helper to fetch fresh user data from database
  const fetchUserData = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Failed to fetch user data:', error);
        return null;
      }

      const teamMember = data as TeamMember;
      return {
        id: teamMember.id,
        name: teamMember.email.split('@')[0],
        department: mapDepartment(teamMember.department),
        role: mapRole(teamMember.role),
        participantId: teamMember.participant_id,
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
      // Query team_members table to validate credentials
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      console.log('[Auth] DB query result:', { data: data ? 'found' : 'not found', error });

      if (error || !data) {
        console.log('[Auth] Login failed: user not found');
        setIsLoading(false);
        return { success: false, error: 'Invalid email address' };
      }

      const teamMember = data as TeamMember;
      console.log('[Auth] Team member found:', {
        id: teamMember.id,
        email: teamMember.email,
        department: teamMember.department,
        role: teamMember.role,
        participant_id: teamMember.participant_id
      });

      // Check password (Note: In production, passwords should be hashed)
      const trimmedPassword = password.trim();
      if (teamMember.password !== trimmedPassword) {
        console.log('[Auth] Login failed: password mismatch', {
          expected: teamMember.password,
          received: trimmedPassword,
          expectedLength: teamMember.password?.length,
          receivedLength: trimmedPassword.length
        });
        setIsLoading(false);
        return { success: false, error: 'Invalid password' };
      }

      // Create user object from team member data
      const user: User = {
        id: teamMember.id,
        name: teamMember.email.split('@')[0], // Use email prefix as name
        department: mapDepartment(teamMember.department),
        role: mapRole(teamMember.role),
        participantId: teamMember.participant_id,
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

