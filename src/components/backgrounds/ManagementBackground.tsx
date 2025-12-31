import React from 'react';

/**
 * Management Department Background
 * Clean minimal dot grid with subtle organizational elements
 */
const ManagementBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Minimal Dot Grid Pattern */}
      <div className="absolute inset-0 bg-management-dots opacity-30 transition-all duration-700" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_80%)] opacity-50" />
      
      {/* Org Chart Lines - Vertical */}
      <div className="absolute top-[15%] left-1/2 w-px h-16 bg-[var(--accent-mgmt)] opacity-15 -translate-x-1/2" />
      
      {/* Org Chart Lines - Horizontal */}
      <div className="absolute top-[28%] left-[30%] right-[30%] h-px bg-[var(--accent-mgmt)] opacity-15" />
      
      {/* Org Chart Branches */}
      <div className="absolute top-[28%] left-[30%] w-px h-8 bg-[var(--accent-mgmt)] opacity-15" />
      <div className="absolute top-[28%] left-1/2 w-px h-8 bg-[var(--accent-mgmt)] opacity-15 -translate-x-1/2" />
      <div className="absolute top-[28%] right-[30%] w-px h-8 bg-[var(--accent-mgmt)] opacity-15" />
      
      {/* Org Nodes */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-10 h-6 border border-[var(--accent-mgmt)] opacity-20 rounded" />
      <div className="absolute top-[36%] left-[30%] -translate-x-1/2 w-8 h-5 border border-[var(--accent-mgmt)] opacity-15 rounded" />
      <div className="absolute top-[36%] left-1/2 -translate-x-1/2 w-8 h-5 border border-[var(--accent-mgmt)] opacity-15 rounded" />
      <div className="absolute top-[36%] right-[30%] translate-x-1/2 w-8 h-5 border border-[var(--accent-mgmt)] opacity-15 rounded" />
      
      {/* KPI Bars */}
      <div className="absolute bottom-[25%] left-[15%] flex items-end gap-2 opacity-15">
        <div className="w-3 h-8 bg-[var(--accent-mgmt)] rounded-t" />
        <div className="w-3 h-12 bg-[var(--accent-mgmt)] rounded-t" />
        <div className="w-3 h-6 bg-[var(--accent-mgmt)] rounded-t" />
        <div className="w-3 h-14 bg-[var(--accent-mgmt)] rounded-t" />
        <div className="w-3 h-10 bg-[var(--accent-mgmt)] rounded-t" />
      </div>
      
      {/* Pie Chart */}
      <div className="absolute bottom-[20%] right-[15%] w-16 h-16 opacity-15">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--accent-mgmt)"
            strokeWidth="2"
          />
          <path
            d="M50,50 L50,10 A40,40 0 0,1 90,50 Z"
            fill="var(--accent-mgmt)"
            opacity="0.3"
          />
          <path
            d="M50,50 L90,50 A40,40 0 0,1 50,90 Z"
            fill="var(--accent-mgmt)"
            opacity="0.2"
          />
        </svg>
      </div>
      
      {/* Trend Line */}
      <svg className="absolute top-[55%] left-[25%] w-[50%] h-20 opacity-12" preserveAspectRatio="none">
        <path
          d="M0,60 L50,50 L100,55 L150,30 L200,35 L250,20 L300,25 L350,10"
          fill="none"
          stroke="var(--accent-mgmt)"
          strokeWidth="2"
        />
        <circle cx="0" cy="60" r="3" fill="var(--accent-mgmt)" />
        <circle cx="150" cy="30" r="3" fill="var(--accent-mgmt)" />
        <circle cx="350" cy="10" r="3" fill="var(--accent-mgmt)" />
      </svg>
      
      {/* Checkbox/Task Elements */}
      <div className="absolute top-[65%] right-[25%] flex flex-col gap-2 opacity-15">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-[var(--accent-mgmt)] rounded-sm" />
          <div className="w-12 h-1 bg-[var(--accent-mgmt)] rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-[var(--accent-mgmt)] rounded-sm bg-[var(--accent-mgmt)] opacity-50" />
          <div className="w-16 h-1 bg-[var(--accent-mgmt)] rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-[var(--accent-mgmt)] rounded-sm" />
          <div className="w-10 h-1 bg-[var(--accent-mgmt)] rounded" />
        </div>
      </div>
      
      {/* Corner Accents */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-[var(--accent-mgmt)] opacity-10" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-[var(--accent-mgmt)] opacity-10" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-[var(--accent-mgmt)] opacity-10" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-[var(--accent-mgmt)] opacity-10" />
    </div>
  );
};

export default ManagementBackground;

