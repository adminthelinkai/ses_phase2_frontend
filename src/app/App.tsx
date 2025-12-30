import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, Role, Department } from '../types';

const Home = lazy(() => import('../modules/home/Home'));
const Workspace = lazy(() => import('../modules/workspace/Workspace'));
const Login = lazy(() => import('../modules/auth/Login'));

const LoadingView = () => (
  <div className="flex-1 flex items-center justify-center bg-[var(--bg-base)]">
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin"></div>
      <div className="mt-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] animate-pulse">Synchronizing Core Engine...</div>
    </div>
  </div>
);

const AUTH_STORAGE_KEY = 'epcm-auth-state';

const App: React.FC = () => {
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

  // Persist auth state to localStorage whenever it changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  const handleLogin = (username: string) => {
    // Simulated successful login
    const newAuth: AuthState = {
      isAuthenticated: true,
      user: {
        id: 'user-001',
        name: username || 'John Doe',
        department: Department.CSA,
        role: Role.HOD,
      },
    };
    setAuth(newAuth);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuth));
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingView />}>
        <Routes>
          <Route 
            path="/login" 
            element={auth.isAuthenticated ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/home" 
            element={auth.isAuthenticated ? <Home /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/workspace" 
            element={auth.isAuthenticated ? <Workspace /> : <Navigate to="/login" replace />} 
          />
          <Route path="/" element={<Navigate to={auth.isAuthenticated ? "/home" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/home" : "/login"} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;