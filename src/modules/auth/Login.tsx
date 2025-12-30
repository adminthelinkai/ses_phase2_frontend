import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

// Hardcoded credentials
const VALID_EMAIL = 'info@thelinkai.com';
const VALID_PASSWORD = 'admin@123';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('epcm-theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('epcm-theme', theme);
  }, [theme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate credentials
    if (username.trim().toLowerCase() !== VALID_EMAIL.toLowerCase()) {
      setError('Invalid email address');
      return;
    }
    
    if (password !== VALID_PASSWORD) {
      setError('Invalid password');
      return;
    }
    
    setIsAuthenticating(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin(username);
      setIsAuthenticating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[var(--bg-base)]">
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 bg-dot-grid pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_40%,_var(--accent-glow)_0%,_transparent_70%)] pointer-events-none"></div>
      
      {/* TECHNICAL OVERLAYS */}
      <div className="crosshair top-[20%] left-[15%] opacity-40"></div>
      <div className="crosshair bottom-[20%] right-[15%] opacity-40"></div>
      <div className="blueprint-mark w-24 h-24 top-10 right-10 border-t-2 border-r-2 opacity-10 border-[var(--accent-blue)]"></div>

      {/* LOGIN MODULE */}
      <div className="w-full max-w-[420px] px-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[var(--accent-blue)] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(31,93,142,0.4)] mb-6">
            <span className="text-white font-black text-2xl">E</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-[var(--text-primary)]">EPCM OS / CORE</h1>
          <p className="text-[9px] font-bold text-[var(--text-muted)] tracking-[0.5em] uppercase mt-2">Authorization Required</p>
        </div>

        <div className="glass-panel p-1 rounded-2xl relative">
          <div className="bg-[var(--bg-panel)]/90 backdrop-blur-2xl rounded-[15px] p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">System Identifier</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-blue)] opacity-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input 
                    type="email"
                    required
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder="EMAIL_ADDRESS"
                    className="w-full border border-[var(--border-color)] rounded-xl py-3.5 pl-12 pr-4 text-xs font-mono font-bold placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all input-text-visible"
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'rgba(13, 17, 23, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                      color: theme === 'dark' ? '#f0f4f8' : '#0f172a',
                      WebkitTextFillColor: theme === 'dark' ? '#f0f4f8' : '#0f172a'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Access Protocol</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-blue)] opacity-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••••••"
                    className="w-full border border-[var(--border-color)] rounded-xl py-3.5 pl-12 pr-4 text-xs font-mono font-bold placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all input-text-visible"
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'rgba(13, 17, 23, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                      color: theme === 'dark' ? '#f0f4f8' : '#0f172a',
                      WebkitTextFillColor: theme === 'dark' ? '#f0f4f8' : '#0f172a'
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest text-center">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={isAuthenticating}
                className="w-full h-12 bg-[var(--accent-blue)] text-white rounded-xl font-black text-[10px] tracking-[0.3em] uppercase shadow-[0_8px_20px_rgba(31,93,142,0.3)] hover:brightness-110 active:scale-[0.98] transition-all relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAuthenticating ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>SYNCING...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">INITIALIZE SESSION</span>
                    <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-[var(--border-color)] flex justify-between items-center opacity-60">
              <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Status: Restricted Access</span>
              <button 
                type="button"
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                className="text-[8px] font-black text-[var(--accent-blue)] uppercase tracking-widest hover:underline"
              >
                UI_THEME: {theme.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-12 text-center text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-[0.4em] leading-relaxed opacity-50">
          Proprietary Intelligence Core // Secure Terminal v2.6.0<br/>
          Authorization managed by Central SES Administration.
        </p>
      </div>

      {/* FOOTER METRICS */}
      <footer className="fixed bottom-0 inset-x-0 h-14 border-t border-[var(--border-color)] flex items-center px-10">
        <div className="w-full flex justify-between items-center text-[7px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)]">
          <div className="flex gap-8">
            <span>NODAL_LATENCY: 0.12ms</span>
            <span>SECURE_ENCLAVE_ACTIVE</span>
          </div>
          <div className="flex gap-8">
            <span>TERMINAL_ID: 0x88F2A</span>
            <span>SYSTEM_READY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;