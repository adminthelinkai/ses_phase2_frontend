
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects, Project } from '../../data';

const Home = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('epcm-theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('epcm-theme', theme);
  }, [theme]);

  const handleLaunch = (project: Project) => {
    setSelectedProjectId(project.id);
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/workspace', { state: { projectId: project.id } });
    }, 600);
  };

  return (
    <div className={`flex flex-col h-screen relative overflow-hidden transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-[0.985]' : 'opacity-100'}`}>
      
      {/* ATMOSPHERIC LAYER */}
      <div className="fixed inset-0 bg-dot-grid pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_40%,_var(--accent-glow)_0%,_transparent_65%)] pointer-events-none"></div>
      
      {/* GLOBAL HEADER */}
      <header className="fixed top-0 inset-x-0 h-16 z-50 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-10">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-9 h-9 bg-[var(--accent-blue)] rounded flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <span className="text-white font-black text-sm">E</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[11px] tracking-tight uppercase text-[var(--text-primary)]">EPCM FOUNDATION</span>
              <span className="text-[6px] font-bold text-[var(--text-muted)] tracking-[0.5em] uppercase">Core Unit // 01</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
              className="p-2.5 rounded-full hover:bg-[var(--accent-blue)]/5 transition-colors text-[var(--text-muted)] hover:text-[var(--accent-blue)]"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <div className="h-6 w-px bg-[var(--border-color)]"></div>
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <div className="text-[9px] font-black text-[var(--text-primary)] uppercase">John Doe</div>
                  <div className="text-[7px] font-bold text-[var(--accent-blue)] tracking-widest uppercase">Lead Coordinator</div>
               </div>
               <div className="w-8 h-8 rounded-full border border-[var(--border-color)] bg-[var(--bg-panel)] flex items-center justify-center text-[9px] font-black text-[var(--accent-blue)] shadow-sm">JD</div>
            </div>
          </div>
        </div>
      </header>

      {/* INTERFACE AREA */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[1400px] mx-auto px-10 relative z-10">
        
        {/* HERO */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-top-4 duration-1000 shrink-0">
          <div className="flex items-center justify-center gap-4 mb-6 opacity-40">
            <div className="h-px w-10 bg-[var(--accent-blue)]"></div>
            <span className="text-[10px] font-black tracking-[0.6em] uppercase text-[var(--text-muted)]">Operational Intelligence Hub</span>
            <div className="h-px w-10 bg-[var(--accent-blue)]"></div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-[var(--text-primary)] leading-none select-none">
            PROJECT<span className="text-[var(--accent-blue)] opacity-80">/INTEL</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto text-[10px] font-bold leading-relaxed uppercase tracking-[0.3em] opacity-60">
            Precision Execution Framework for Multi-Discipline Engineering.
          </p>
        </div>

        {/* COMMAND MODULE */}
        <div className="w-full max-w-3xl mb-20 animate-in fade-in zoom-in-95 duration-1000 delay-200 shrink-0">
          <div className="glass-panel p-1 rounded-xl group focus-within:ring-2 ring-[var(--accent-blue)]/20 transition-all duration-500">
            <div className="flex items-center h-14 relative px-2">
              <div className="pl-4 text-[var(--accent-blue)] opacity-60">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                readOnly
                placeholder="INPUT SYSTEM COMMAND..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono text-[11px] px-6 uppercase tracking-[0.2em] cursor-default"
              />
              <button className="bg-[var(--accent-blue)] px-8 h-10 rounded-lg text-white font-black text-[10px] tracking-[0.3em] uppercase hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(31,93,142,0.3)] active:scale-95">
                EXEC
              </button>
            </div>
          </div>
          
          <div className="flex justify-center gap-12 mt-6 opacity-40">
            {['ANALYTICS', 'CLASH_LOG', 'NODE_STATUS'].map((tag) => (
              <div key={tag} className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 rounded-full bg-[var(--accent-blue)] group-hover:scale-150 transition-transform"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)]">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* REGISTRY SECTION */}
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400 max-h-[260px]">
          <div className="flex items-center gap-6 px-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse"></div>
              <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.4em]">REGISTRY.Active</span>
            </div>
            <div className="h-px flex-1 bg-[var(--border-color)]"></div>
            <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold">TOTAL_ASSETS: 00{projects.length}</span>
          </div>

          <div className="flex overflow-x-auto scrollbar-hide gap-5 px-1 pb-10 w-full mask-fade-edges">
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={() => handleLaunch(project)}
                className={`flex-shrink-0 group cursor-pointer relative transition-all duration-500 ${selectedProjectId === project.id ? 'scale-[0.96] opacity-30 blur-[2px]' : 'hover:-translate-y-2'}`}
              >
                {/* TECHNICAL ASSET MODULE */}
                <div className="glass-panel w-[260px] h-[150px] p-7 flex flex-col justify-between rounded-lg relative overflow-hidden group">
                  
                  {/* CORNER MARKINGS */}
                  <div className="absolute top-0 right-0 w-6 h-6 opacity-20 border-t-2 border-r-2 border-[var(--text-muted)] group-hover:border-[var(--accent-blue)] group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 opacity-10 border-b border-l border-[var(--text-muted)]"></div>
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 pointer-events-none"></div>

                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-[var(--accent-blue)] font-bold tracking-widest">{project.id}</span>
                      <span className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-60">UNIT.ID</span>
                    </div>
                    <div className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest border ${
                      project.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                      project.status === 'on-hold' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                      'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {project.status}
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-[16px] font-black text-[var(--text-primary)] uppercase tracking-tight leading-none group-hover:text-[var(--accent-blue)] transition-colors duration-300">
                      {project.name}
                    </h3>
                    <div className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                       DISCIPLINE: <span className="text-[var(--text-primary)]">MULTI</span>
                    </div>
                  </div>

                  <div className="mt-auto relative z-10">
                    <div className="h-[2px] w-full bg-[var(--border-color)] rounded-full overflow-hidden">
                      <div className={`h-full bg-[var(--accent-blue)] shadow-[0_0_10px_var(--accent-blue)] transition-all duration-700 ${selectedProjectId ? 'w-full' : 'w-1/4'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full h-14 flex items-center px-10 shrink-0 border-t border-[var(--border-color)]">
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between opacity-50 text-[8px] font-black uppercase tracking-[0.5em] select-none">
          <div className="flex items-center gap-8">
            <span className="text-[var(--accent-blue)] font-black">STATION: GAMMA-OS-08</span>
            <span className="hidden lg:block">UPTIME: 99.998%</span>
          </div>
          <div className="flex items-center gap-10">
             <span>FOUNDATION: v2.6.0-LTS</span>
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               <span className="text-emerald-600 dark:text-emerald-400">ENCRYPTED</span>
             </div>
             <span className="font-mono opacity-80">LATENCY: 14MS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
