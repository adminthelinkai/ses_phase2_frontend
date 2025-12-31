import React from 'react';

/**
 * Electrical Department Background
 * Circuit board traces pattern with connection nodes
 */
const ElectricalBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Circuit Pattern */}
      <div className="absolute inset-0 bg-electrical-circuit opacity-25 transition-all duration-700" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_85%)] opacity-60" />
      
      {/* Circuit Traces - Horizontal */}
      <div className="absolute top-[20%] left-0 w-[30%] h-px bg-[var(--accent-elec)] opacity-20" />
      <div className="absolute top-[20%] left-[30%] w-px h-[15%] bg-[var(--accent-elec)] opacity-20" />
      <div className="absolute top-[35%] left-[30%] w-[25%] h-px bg-[var(--accent-elec)] opacity-20" />
      
      <div className="absolute top-[45%] right-0 w-[35%] h-px bg-[var(--accent-elec)] opacity-20" />
      <div className="absolute top-[45%] right-[35%] w-px h-[20%] bg-[var(--accent-elec)] opacity-20" />
      <div className="absolute top-[65%] right-[35%] w-[20%] h-px bg-[var(--accent-elec)] opacity-20" />
      
      <div className="absolute top-[70%] left-[10%] w-[40%] h-px bg-[var(--accent-elec)] opacity-15" />
      <div className="absolute top-[70%] left-[50%] w-px h-[15%] bg-[var(--accent-elec)] opacity-15" />
      
      {/* Connection Nodes */}
      <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-[var(--accent-elec)] opacity-30 shadow-[0_0_8px_var(--accent-elec)]" />
      <div className="absolute top-[35%] left-[55%] w-2 h-2 rounded-full bg-[var(--accent-elec)] opacity-30 shadow-[0_0_8px_var(--accent-elec)]" />
      <div className="absolute top-[45%] right-[35%] w-2 h-2 rounded-full bg-[var(--accent-elec)] opacity-30 shadow-[0_0_8px_var(--accent-elec)]" />
      <div className="absolute top-[65%] right-[15%] w-2 h-2 rounded-full bg-[var(--accent-elec)] opacity-30 shadow-[0_0_8px_var(--accent-elec)]" />
      <div className="absolute top-[70%] left-[50%] w-2 h-2 rounded-full bg-[var(--accent-elec)] opacity-30 shadow-[0_0_8px_var(--accent-elec)]" />
      
      {/* IC Chip Outlines */}
      <div className="absolute top-[15%] right-[20%] w-16 h-10 border border-[var(--accent-elec)] opacity-15 rounded-sm">
        <div className="absolute -left-2 top-2 w-2 h-px bg-[var(--accent-elec)]" />
        <div className="absolute -left-2 top-4 w-2 h-px bg-[var(--accent-elec)]" />
        <div className="absolute -left-2 top-6 w-2 h-px bg-[var(--accent-elec)]" />
        <div className="absolute -right-2 top-2 w-2 h-px bg-[var(--accent-elec)]" />
        <div className="absolute -right-2 top-4 w-2 h-px bg-[var(--accent-elec)]" />
        <div className="absolute -right-2 top-6 w-2 h-px bg-[var(--accent-elec)]" />
      </div>
      
      <div className="absolute bottom-[25%] left-[15%] w-12 h-8 border border-[var(--accent-elec)] opacity-15 rounded-sm">
        <div className="absolute -left-2 top-2 w-2 h-px bg-[var(--accent-elec)]" />
        <div className="absolute -left-2 top-4 w-2 h-px bg-[var(--accent-elec)]" />
        <div className="absolute -right-2 top-2 w-2 h-px bg-[var(--accent-elec)]" />
        <div className="absolute -right-2 top-4 w-2 h-px bg-[var(--accent-elec)]" />
      </div>
      
      {/* Resistor Symbols */}
      <div className="absolute top-[50%] left-[20%] flex items-center opacity-15">
        <div className="w-4 h-px bg-[var(--accent-elec)]" />
        <div className="w-8 h-3 border border-[var(--accent-elec)]" />
        <div className="w-4 h-px bg-[var(--accent-elec)]" />
      </div>
      
      {/* Ground Symbol */}
      <div className="absolute bottom-[15%] right-[25%] flex flex-col items-center opacity-15">
        <div className="w-px h-4 bg-[var(--accent-elec)]" />
        <div className="w-6 h-px bg-[var(--accent-elec)]" />
        <div className="w-4 h-px bg-[var(--accent-elec)] mt-1" />
        <div className="w-2 h-px bg-[var(--accent-elec)] mt-1" />
      </div>
      
      {/* Power Rails */}
      <div className="absolute top-8 left-0 right-0 h-px bg-[var(--accent-elec)] opacity-10" />
      <div className="absolute bottom-8 left-0 right-0 h-px bg-[var(--accent-elec)] opacity-10" />
    </div>
  );
};

export default ElectricalBackground;

