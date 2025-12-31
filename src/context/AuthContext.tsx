import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, TeamMember } from '../lib/supabase';
import { AuthState, User, Department, Role } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'epcm-auth-state';

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
  const [auth, setAuth] = useState<AuthState>(() => {
    // Restore auth state from localStorage on mount
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        return JSON.parse(savedAuth);
      } catch {
        return { isAuthenticated: false, user: null };
      }
    }
    return { isAuthenticated: false, user: null };
  });
  const [isLoading, setIsLoading] = useState(false);

  // Persist auth state to localStorage whenever it changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Query team_members table to validate credentials
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error || !data) {
        setIsLoading(false);
        return { success: false, error: 'Invalid email address' };
      }

      const teamMember = data as TeamMember;

      // Check password (Note: In production, passwords should be hashed)
      if (teamMember.password !== password) {
        setIsLoading(false);
        return { success: false, error: 'Invalid password' };
      }

      // Create user object from team member data
      const user: User = {
        id: teamMember.id,
        name: teamMember.email.split('@')[0], // Use email prefix as name
        department: mapDepartment(teamMember.department),
        role: mapRole(teamMember.role),
      };

      const newAuth: AuthState = {
        isAuthenticated: true,
        user,
      };

      setAuth(newAuth);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setAuth({ isAuthenticated: false, user: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isLoading }}>
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

