import React from 'react';

/**
 * Process Department Background
 * Flow diagram pattern with process nodes and connections
 */
const ProcessBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Flow Grid Pattern */}
      <div className="absolute inset-0 bg-process-flow opacity-25 transition-all duration-700" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_85%)] opacity-60" />
      
      {/* Flow Arrows - Horizontal */}
      <div className="absolute top-[25%] left-[10%] flex items-center opacity-15">
        <div className="w-20 h-px bg-[var(--accent-process)]" />
        <div className="w-0 h-0 border-l-[8px] border-l-[var(--accent-process)] border-y-[4px] border-y-transparent" />
      </div>
      <div className="absolute top-[50%] left-[30%] flex items-center opacity-15">
        <div className="w-32 h-px bg-[var(--accent-process)]" />
        <div className="w-0 h-0 border-l-[8px] border-l-[var(--accent-process)] border-y-[4px] border-y-transparent" />
      </div>
      <div className="absolute top-[75%] right-[20%] flex items-center opacity-15">
        <div className="w-24 h-px bg-[var(--accent-process)]" />
        <div className="w-0 h-0 border-l-[8px] border-l-[var(--accent-process)] border-y-[4px] border-y-transparent" />
      </div>
      
      {/* Process Nodes - Rectangles */}
      <div className="absolute top-[20%] left-[5%] w-14 h-10 border-2 border-[var(--accent-process)] opacity-20 rounded" />
      <div className="absolute top-[20%] left-[35%] w-14 h-10 border-2 border-[var(--accent-process)] opacity-20 rounded" />
      <div className="absolute top-[45%] left-[25%] w-14 h-10 border-2 border-[var(--accent-process)] opacity-20 rounded" />
      <div className="absolute top-[45%] right-[25%] w-14 h-10 border-2 border-[var(--accent-process)] opacity-20 rounded" />
      <div className="absolute top-[70%] right-[45%] w-14 h-10 border-2 border-[var(--accent-process)] opacity-20 rounded" />
      
      {/* Decision Diamonds */}
      <div className="absolute top-[35%] left-[55%] w-10 h-10 border-2 border-[var(--accent-process)] opacity-20 rotate-45" />
      <div className="absolute top-[60%] left-[15%] w-8 h-8 border-2 border-[var(--accent-process)] opacity-15 rotate-45" />
      
      {/* Start/End Circles */}
      <div className="absolute top-[15%] left-[75%] w-8 h-8 rounded-full border-2 border-[var(--accent-process)] opacity-20" />
      <div className="absolute bottom-[15%] right-[10%] w-10 h-10 rounded-full border-4 border-[var(--accent-process)] opacity-20">
        <div className="absolute inset-2 rounded-full bg-[var(--accent-process)] opacity-50" />
      </div>
      
      {/* Vertical Flow Lines */}
      <div className="absolute top-[30%] left-[12%] h-16 w-px bg-[var(--accent-process)] opacity-15" />
      <div className="absolute top-[55%] left-[32%] h-12 w-px bg-[var(--accent-process)] opacity-15" />
      <div className="absolute top-[40%] right-[30%] h-20 w-px bg-[var(--accent-process)] opacity-15" />
      
      {/* Pipeline Symbols */}
      <div className="absolute bottom-[30%] left-[40%] flex items-center gap-1 opacity-15">
        <div className="w-6 h-3 border border-[var(--accent-process)] rounded-full" />
        <div className="w-8 h-px bg-[var(--accent-process)]" />
        <div className="w-6 h-3 border border-[var(--accent-process)] rounded-full" />
      </div>
      
      {/* Tank/Vessel Symbol */}
      <div className="absolute top-[65%] right-[15%] w-10 h-14 border-2 border-[var(--accent-process)] opacity-15 rounded-b-full">
        <div className="absolute -top-1 left-1/2 w-6 h-2 border-2 border-[var(--accent-process)] -translate-x-1/2 rounded-t" />
      </div>
      
      {/* Pump Symbol */}
      <div className="absolute bottom-[25%] left-[60%] opacity-15">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-process)]" />
        <div className="absolute top-1/2 -right-3 w-3 h-px bg-[var(--accent-process)]" />
        <div className="absolute top-1/2 -left-3 w-3 h-px bg-[var(--accent-process)]" />
      </div>
    </div>
  );
};

export default ProcessBackground;

