import React from 'react';

/**
 * CSA (Civil/Structural) Department Background
 * Brick/structural pattern with rebar and dimension markers
 */
const CSABackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Brick Pattern */}
      <div className="absolute inset-0 bg-csa-bricks opacity-40 transition-all duration-700" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_90%)] opacity-50" />
      
      {/* Scattered Blueprint Accents */}
      <div className="absolute top-16 right-[22%] w-5 h-5">
        <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--accent-csa)] opacity-30" />
        <div className="absolute left-1/2 top-0 w-px h-full bg-[var(--accent-csa)] opacity-30" />
      </div>
      <div className="absolute bottom-36 left-[18%] w-5 h-5">
        <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--accent-csa)] opacity-30" />
        <div className="absolute left-1/2 top-0 w-px h-full bg-[var(--accent-csa)] opacity-30" />
      </div>
      <div className="absolute top-[55%] left-[6%] w-5 h-5">
        <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--accent-csa)] opacity-30" />
        <div className="absolute left-1/2 top-0 w-px h-full bg-[var(--accent-csa)] opacity-30" />
      </div>
      
      {/* Dimension Ticks */}
      <div className="absolute top-[180px] left-[80px] w-10 h-px bg-[var(--accent-csa)] opacity-25">
        <div className="absolute left-0 top-[-4px] w-px h-2 bg-[var(--accent-csa)]" />
        <div className="absolute right-0 top-[-4px] w-px h-2 bg-[var(--accent-csa)]" />
      </div>
      <div className="absolute bottom-[220px] right-[120px] w-10 h-px bg-[var(--accent-csa)] opacity-25 rotate-180">
        <div className="absolute left-0 top-[-4px] w-px h-2 bg-[var(--accent-csa)]" />
        <div className="absolute right-0 top-[-4px] w-px h-2 bg-[var(--accent-csa)]" />
      </div>
      
      {/* Blueprint Corner Mark */}
      <div className="absolute top-12 left-[42%] w-10 h-10 border-t-2 border-l-2 border-[var(--accent-csa)] opacity-20" />
      
      {/* Rebar Marks */}
      <div className="absolute top-[12%] right-[8%] w-3 h-3 rounded-full border-2 border-[var(--accent-csa)] opacity-20">
        <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-[var(--accent-csa)] -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="absolute bottom-[15%] left-[5%] w-3 h-3 rounded-full border-2 border-[var(--accent-csa)] opacity-20">
        <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-[var(--accent-csa)] -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="absolute top-[40%] right-[15%] w-3 h-3 rounded-full border-2 border-[var(--accent-csa)] opacity-20">
        <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-[var(--accent-csa)] -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Structural Grid Lines */}
      <div className="absolute top-[25%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-csa)] to-transparent opacity-10" />
      <div className="absolute top-[50%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-csa)] to-transparent opacity-10" />
      <div className="absolute top-[75%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-csa)] to-transparent opacity-10" />
      
      {/* Column Grid Indicators */}
      <div className="absolute top-0 bottom-0 left-[25%] w-px bg-[var(--accent-csa)] opacity-5" />
      <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[var(--accent-csa)] opacity-5" />
      <div className="absolute top-0 bottom-0 left-[75%] w-px bg-[var(--accent-csa)] opacity-5" />
    </div>
  );
};

export default CSABackground;

