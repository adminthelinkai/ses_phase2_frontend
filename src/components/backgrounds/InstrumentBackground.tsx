import React from 'react';

/**
 * Instrument Department Background
 * Waveform/signal pattern with measurement indicators
 */
const InstrumentBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Instrument Grid Pattern */}
      <div className="absolute inset-0 bg-instrument-grid opacity-25 transition-all duration-700" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_85%)] opacity-60" />
      
      {/* Sine Wave - SVG */}
      <svg className="absolute top-[20%] left-0 w-full h-20 opacity-15" preserveAspectRatio="none">
        <path
          d="M0,40 Q50,0 100,40 T200,40 T300,40 T400,40 T500,40 T600,40 T700,40 T800,40 T900,40 T1000,40 T1100,40 T1200,40 T1300,40 T1400,40 T1500,40"
          fill="none"
          stroke="var(--accent-instrument)"
          strokeWidth="2"
        />
      </svg>
      
      {/* Square Wave */}
      <svg className="absolute top-[45%] left-[10%] w-[80%] h-16 opacity-12" preserveAspectRatio="none">
        <path
          d="M0,40 L0,10 L40,10 L40,40 L80,40 L80,10 L120,10 L120,40 L160,40 L160,10 L200,10 L200,40 L240,40 L240,10 L280,10 L280,40 L320,40 L320,10 L360,10 L360,40"
          fill="none"
          stroke="var(--accent-instrument)"
          strokeWidth="1.5"
        />
      </svg>
      
      {/* Pulse/Spike Wave */}
      <svg className="absolute top-[70%] left-[5%] w-[90%] h-16 opacity-10" preserveAspectRatio="none">
        <path
          d="M0,40 L50,40 L60,10 L70,50 L80,40 L150,40 L160,10 L170,50 L180,40 L250,40 L260,10 L270,50 L280,40 L350,40 L360,10 L370,50 L380,40 L450,40"
          fill="none"
          stroke="var(--accent-instrument)"
          strokeWidth="1.5"
        />
      </svg>
      
      {/* Gauge Circles */}
      <div className="absolute top-[15%] right-[15%] w-16 h-16 rounded-full border-2 border-[var(--accent-instrument)] opacity-20">
        <div className="absolute top-1/2 left-1/2 w-1 h-6 bg-[var(--accent-instrument)] origin-bottom -translate-x-1/2 rotate-45" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-px bg-[var(--accent-instrument)]" />
      </div>
      
      <div className="absolute bottom-[20%] left-[10%] w-12 h-12 rounded-full border-2 border-[var(--accent-instrument)] opacity-15">
        <div className="absolute top-1/2 left-1/2 w-1 h-4 bg-[var(--accent-instrument)] origin-bottom -translate-x-1/2 -rotate-30" />
      </div>
      
      {/* Digital Display */}
      <div className="absolute top-[35%] left-[8%] w-20 h-8 border border-[var(--accent-instrument)] opacity-15 rounded">
        <div className="absolute inset-1 flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-3 h-5 border border-[var(--accent-instrument)] opacity-50" />
            <div className="w-3 h-5 border border-[var(--accent-instrument)] opacity-50" />
            <div className="w-1 h-1 rounded-full bg-[var(--accent-instrument)] self-end mb-1" />
            <div className="w-3 h-5 border border-[var(--accent-instrument)] opacity-50" />
          </div>
        </div>
      </div>
      
      {/* Sensor Symbol */}
      <div className="absolute bottom-[35%] right-[20%] opacity-15">
        <div className="w-6 h-10 border-2 border-[var(--accent-instrument)] rounded-t-full" />
        <div className="w-10 h-2 border-2 border-[var(--accent-instrument)] -ml-2" />
      </div>
      
      {/* Signal Lines */}
      <div className="absolute top-[28%] left-[30%] flex items-center gap-2 opacity-15">
        <div className="w-2 h-2 rounded-full bg-[var(--accent-instrument)]" />
        <div className="w-16 h-px bg-[var(--accent-instrument)]" />
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-[var(--accent-instrument)]" />
          <div className="w-1 h-5 bg-[var(--accent-instrument)]" />
          <div className="w-1 h-2 bg-[var(--accent-instrument)]" />
          <div className="w-1 h-4 bg-[var(--accent-instrument)]" />
        </div>
      </div>
      
      {/* Measurement Scale */}
      <div className="absolute left-8 top-[30%] bottom-[30%] w-px bg-[var(--accent-instrument)] opacity-10">
        <div className="absolute top-0 -left-1 w-2 h-px bg-[var(--accent-instrument)]" />
        <div className="absolute top-[25%] -left-0.5 w-1 h-px bg-[var(--accent-instrument)]" />
        <div className="absolute top-[50%] -left-1 w-2 h-px bg-[var(--accent-instrument)]" />
        <div className="absolute top-[75%] -left-0.5 w-1 h-px bg-[var(--accent-instrument)]" />
        <div className="absolute bottom-0 -left-1 w-2 h-px bg-[var(--accent-instrument)]" />
      </div>
    </div>
  );
};

export default InstrumentBackground;

