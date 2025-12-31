import React from 'react';

/**
 * Project Management Department Background
 * Blueprint grid with project timeline markers and Gantt-style decorations
 */
const PMBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Blueprint Grid Pattern */}
      <div className="absolute inset-0 bg-pm-grid opacity-[0.15] transition-all duration-700" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_80%)] opacity-70" />
      
      {/* Timeline Markers - Horizontal Lines */}
      <div className="absolute top-[15%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-pm)] to-transparent opacity-[0.08]" />
      <div className="absolute top-[35%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-pm)] to-transparent opacity-[0.05]" />
      <div className="absolute top-[55%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-pm)] to-transparent opacity-[0.08]" />
      <div className="absolute top-[75%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-pm)] to-transparent opacity-[0.05]" />
      
      {/* Gantt Chart Style Bars */}
      <div className="absolute top-[18%] left-[10%] w-32 h-1.5 bg-[var(--accent-pm)] opacity-[0.04] rounded-full" />
      <div className="absolute top-[18%] left-[45%] w-48 h-1.5 bg-[var(--accent-pm)] opacity-[0.03] rounded-full" />
      <div className="absolute top-[38%] left-[20%] w-40 h-1.5 bg-[var(--accent-pm)] opacity-[0.04] rounded-full" />
      <div className="absolute top-[38%] left-[65%] w-24 h-1.5 bg-[var(--accent-pm)] opacity-[0.03] rounded-full" />
      <div className="absolute top-[58%] left-[15%] w-56 h-1.5 bg-[var(--accent-pm)] opacity-[0.04] rounded-full" />
      <div className="absolute top-[78%] left-[30%] w-36 h-1.5 bg-[var(--accent-pm)] opacity-[0.03] rounded-full" />
      
      {/* Milestone Diamonds */}
      <div className="absolute top-[17%] left-[42%] w-2.5 h-2.5 bg-[var(--accent-pm)] opacity-[0.1] rotate-45" />
      <div className="absolute top-[37%] left-[60%] w-2.5 h-2.5 bg-[var(--accent-pm)] opacity-[0.1] rotate-45" />
      <div className="absolute top-[57%] left-[70%] w-2.5 h-2.5 bg-[var(--accent-pm)] opacity-[0.1] rotate-45" />
      <div className="absolute top-[77%] left-[65%] w-2.5 h-2.5 bg-[var(--accent-pm)] opacity-[0.1] rotate-45" />
      
      {/* Project Phase Markers */}
      <div className="absolute top-20 left-[8%] flex flex-col items-center opacity-[0.06]">
        <div className="w-px h-16 bg-[var(--accent-pm)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-pm)]" />
      </div>
      <div className="absolute top-20 left-[25%] flex flex-col items-center opacity-[0.06]">
        <div className="w-px h-24 bg-[var(--accent-pm)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-pm)]" />
      </div>
      <div className="absolute top-20 left-[50%] flex flex-col items-center opacity-[0.06]">
        <div className="w-px h-20 bg-[var(--accent-pm)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-pm)]" />
      </div>
      <div className="absolute top-20 left-[75%] flex flex-col items-center opacity-[0.06]">
        <div className="w-px h-28 bg-[var(--accent-pm)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-pm)]" />
      </div>
      
      {/* Corner Blueprint Marks */}
      <div className="absolute top-8 left-8 w-10 h-10 border-t border-l border-[var(--accent-pm)] opacity-[0.08]" />
      <div className="absolute top-8 right-8 w-10 h-10 border-t border-r border-[var(--accent-pm)] opacity-[0.08]" />
      <div className="absolute bottom-8 left-8 w-10 h-10 border-b border-l border-[var(--accent-pm)] opacity-[0.08]" />
      <div className="absolute bottom-8 right-8 w-10 h-10 border-b border-r border-[var(--accent-pm)] opacity-[0.08]" />
      
      {/* Schedule Grid Lines - Vertical */}
      <div className="absolute top-0 bottom-0 left-[20%] w-px bg-[var(--accent-pm)] opacity-[0.03]" />
      <div className="absolute top-0 bottom-0 left-[40%] w-px bg-[var(--accent-pm)] opacity-[0.03]" />
      <div className="absolute top-0 bottom-0 left-[60%] w-px bg-[var(--accent-pm)] opacity-[0.03]" />
      <div className="absolute top-0 bottom-0 left-[80%] w-px bg-[var(--accent-pm)] opacity-[0.03]" />
    </div>
  );
};

export default PMBackground;

