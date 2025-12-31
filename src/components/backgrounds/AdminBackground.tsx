import React from 'react';

/**
 * Admin Department Background
 * Tech hexagon grid with data visualization elements
 */
const AdminBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Hexagon Grid Pattern */}
      <div className="absolute inset-0 bg-admin-hex opacity-20 transition-all duration-700" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_80%)] opacity-70" />
      
      {/* Hexagon Outlines */}
      <svg className="absolute top-[15%] left-[10%] w-24 h-24 opacity-15" viewBox="0 0 100 100">
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill="none"
          stroke="var(--accent-admin)"
          strokeWidth="2"
        />
      </svg>
      
      <svg className="absolute top-[10%] right-[20%] w-32 h-32 opacity-10" viewBox="0 0 100 100">
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill="none"
          stroke="var(--accent-admin)"
          strokeWidth="1.5"
        />
        <polygon
          points="50,20 80,35 80,65 50,80 20,65 20,35"
          fill="none"
          stroke="var(--accent-admin)"
          strokeWidth="1"
        />
      </svg>
      
      <svg className="absolute bottom-[20%] left-[20%] w-20 h-20 opacity-12" viewBox="0 0 100 100">
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill="none"
          stroke="var(--accent-admin)"
          strokeWidth="2"
        />
      </svg>
      
      <svg className="absolute bottom-[30%] right-[15%] w-28 h-28 opacity-10" viewBox="0 0 100 100">
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill="none"
          stroke="var(--accent-admin)"
          strokeWidth="1.5"
        />
      </svg>
      
      {/* Data Nodes */}
      <div className="absolute top-[25%] left-[40%] w-3 h-3 rounded-full bg-[var(--accent-admin)] opacity-25 shadow-[0_0_10px_var(--accent-admin)]" />
      <div className="absolute top-[45%] left-[55%] w-2 h-2 rounded-full bg-[var(--accent-admin)] opacity-20 shadow-[0_0_8px_var(--accent-admin)]" />
      <div className="absolute top-[60%] left-[35%] w-3 h-3 rounded-full bg-[var(--accent-admin)] opacity-25 shadow-[0_0_10px_var(--accent-admin)]" />
      <div className="absolute top-[35%] right-[35%] w-2 h-2 rounded-full bg-[var(--accent-admin)] opacity-20 shadow-[0_0_8px_var(--accent-admin)]" />
      
      {/* Connection Lines */}
      <div className="absolute top-[26%] left-[42%] w-[13%] h-px bg-gradient-to-r from-[var(--accent-admin)] to-transparent opacity-15 rotate-[25deg] origin-left" />
      <div className="absolute top-[46%] left-[56%] w-[10%] h-px bg-gradient-to-r from-[var(--accent-admin)] to-transparent opacity-15 rotate-[-20deg] origin-left" />
      <div className="absolute top-[36%] right-[36%] w-[8%] h-px bg-gradient-to-l from-[var(--accent-admin)] to-transparent opacity-15 rotate-[30deg] origin-right" />
      
      {/* Network Mesh Lines */}
      <div className="absolute top-[20%] left-[25%] right-[25%] h-px bg-gradient-to-r from-transparent via-[var(--accent-admin)] to-transparent opacity-8" />
      <div className="absolute top-[40%] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[var(--accent-admin)] to-transparent opacity-8" />
      <div className="absolute top-[60%] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[var(--accent-admin)] to-transparent opacity-8" />
      <div className="absolute top-[80%] left-[30%] right-[30%] h-px bg-gradient-to-r from-transparent via-[var(--accent-admin)] to-transparent opacity-8" />
      
      {/* Server/Database Icon */}
      <div className="absolute bottom-[15%] left-[45%] flex flex-col gap-1 opacity-15">
        <div className="w-12 h-3 border border-[var(--accent-admin)] rounded-sm" />
        <div className="w-12 h-3 border border-[var(--accent-admin)] rounded-sm" />
        <div className="w-12 h-3 border border-[var(--accent-admin)] rounded-sm" />
      </div>
      
      {/* Binary/Data Stream */}
      <div className="absolute top-[50%] left-8 flex flex-col gap-1 opacity-10 font-mono text-[8px] text-[var(--accent-admin)]">
        <span>01001</span>
        <span>10110</span>
        <span>01101</span>
      </div>
      
      <div className="absolute top-[30%] right-8 flex flex-col gap-1 opacity-10 font-mono text-[8px] text-[var(--accent-admin)]">
        <span>11010</span>
        <span>00101</span>
        <span>10011</span>
      </div>
    </div>
  );
};

export default AdminBackground;

