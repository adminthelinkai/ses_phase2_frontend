import React from 'react';

/**
 * Mechanical Department Background
 * Gear/cog mechanical pattern with technical drawings
 */
const MechanicalBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Mechanical Grid Pattern */}
      <div className="absolute inset-0 bg-mechanical-grid opacity-25 transition-all duration-700" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_85%)] opacity-60" />
      
      {/* Large Gear - Top Right */}
      <div className="absolute top-[10%] right-[10%] w-32 h-32 opacity-15">
        <div className="absolute inset-4 rounded-full border-2 border-[var(--accent-mech)]" />
        <div className="absolute inset-8 rounded-full border border-[var(--accent-mech)]" />
        <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-[var(--accent-mech)] -translate-x-1/2 -translate-y-1/2" />
        {/* Gear teeth */}
        <div className="absolute top-0 left-1/2 w-3 h-4 bg-[var(--accent-mech)] -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-3 h-4 bg-[var(--accent-mech)] -translate-x-1/2" />
        <div className="absolute left-0 top-1/2 w-4 h-3 bg-[var(--accent-mech)] -translate-y-1/2" />
        <div className="absolute right-0 top-1/2 w-4 h-3 bg-[var(--accent-mech)] -translate-y-1/2" />
        <div className="absolute top-[15%] left-[15%] w-3 h-3 bg-[var(--accent-mech)] rotate-45" />
        <div className="absolute top-[15%] right-[15%] w-3 h-3 bg-[var(--accent-mech)] rotate-45" />
        <div className="absolute bottom-[15%] left-[15%] w-3 h-3 bg-[var(--accent-mech)] rotate-45" />
        <div className="absolute bottom-[15%] right-[15%] w-3 h-3 bg-[var(--accent-mech)] rotate-45" />
      </div>
      
      {/* Medium Gear - Bottom Left */}
      <div className="absolute bottom-[20%] left-[8%] w-24 h-24 opacity-12">
        <div className="absolute inset-3 rounded-full border-2 border-[var(--accent-mech)]" />
        <div className="absolute inset-6 rounded-full border border-[var(--accent-mech)]" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-[var(--accent-mech)] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 left-1/2 w-2 h-3 bg-[var(--accent-mech)] -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-2 h-3 bg-[var(--accent-mech)] -translate-x-1/2" />
        <div className="absolute left-0 top-1/2 w-3 h-2 bg-[var(--accent-mech)] -translate-y-1/2" />
        <div className="absolute right-0 top-1/2 w-3 h-2 bg-[var(--accent-mech)] -translate-y-1/2" />
      </div>
      
      {/* Small Gear - Center Left */}
      <div className="absolute top-[45%] left-[25%] w-16 h-16 opacity-10">
        <div className="absolute inset-2 rounded-full border-2 border-[var(--accent-mech)]" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[var(--accent-mech)] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-[var(--accent-mech)] -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-[var(--accent-mech)] -translate-x-1/2" />
        <div className="absolute left-0 top-1/2 w-2 h-2 bg-[var(--accent-mech)] -translate-y-1/2" />
        <div className="absolute right-0 top-1/2 w-2 h-2 bg-[var(--accent-mech)] -translate-y-1/2" />
      </div>
      
      {/* Piston/Cylinder Outline */}
      <div className="absolute top-[60%] right-[20%] w-8 h-20 border border-[var(--accent-mech)] opacity-15 rounded-t-full">
        <div className="absolute top-4 left-1/2 w-6 h-12 border border-[var(--accent-mech)] -translate-x-1/2" />
      </div>
      
      {/* Dimension Lines */}
      <div className="absolute top-[30%] left-[40%] flex items-center opacity-15">
        <div className="w-px h-3 bg-[var(--accent-mech)]" />
        <div className="w-20 h-px bg-[var(--accent-mech)]" />
        <div className="w-px h-3 bg-[var(--accent-mech)]" />
      </div>
      
      <div className="absolute bottom-[40%] right-[40%] flex flex-col items-center opacity-15">
        <div className="h-px w-3 bg-[var(--accent-mech)]" />
        <div className="h-16 w-px bg-[var(--accent-mech)]" />
        <div className="h-px w-3 bg-[var(--accent-mech)]" />
      </div>
      
      {/* Bearing Symbol */}
      <div className="absolute top-[75%] right-[35%] w-8 h-8 rounded-full border-2 border-[var(--accent-mech)] opacity-15">
        <div className="absolute inset-2 rounded-full border border-dashed border-[var(--accent-mech)]" />
      </div>
      
      {/* Center Lines */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--accent-mech)] opacity-5 border-dashed" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--accent-mech)] opacity-5 border-dashed" />
    </div>
  );
};

export default MechanicalBackground;

