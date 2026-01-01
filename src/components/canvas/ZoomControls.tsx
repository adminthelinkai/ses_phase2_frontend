import React, { memo } from 'react';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitContent: () => void;
  minScale?: number;
  maxScale?: number;
}

const ZoomControls: React.FC<ZoomControlsProps> = memo(({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitContent,
  minScale = 0.5,
  maxScale = 2.0,
}) => {
  const scalePercent = Math.round(scale * 100);
  const canZoomIn = scale < maxScale;
  const canZoomOut = scale > minScale;

  return (
    <div className="absolute bottom-4 right-4 z-50 flex items-center gap-1 bg-[var(--bg-panel)]/90 backdrop-blur-md border border-[var(--border-color)] rounded-lg p-1 shadow-lg">
      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--accent-blue)]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors group"
        title="Zoom Out"
        aria-label="Zoom out"
      >
        <svg className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-blue)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>

      {/* Scale Indicator */}
      <div className="w-12 text-center">
        <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] tracking-wide">
          {scalePercent}%
        </span>
      </div>

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--accent-blue)]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors group"
        title="Zoom In"
        aria-label="Zoom in"
      >
        <svg className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-blue)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Separator */}
      <div className="w-px h-5 bg-[var(--border-color)] mx-1" />

      {/* Reset View */}
      <button
        onClick={onReset}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--accent-blue)]/10 transition-colors group"
        title="Reset View"
        aria-label="Reset view to center"
      >
        <svg className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-blue)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M2 12h2m16 0h2" />
        </svg>
      </button>

      {/* Fit Content */}
      <button
        onClick={onFitContent}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--accent-blue)]/10 transition-colors group"
        title="Fit All Content"
        aria-label="Fit all content in view"
      >
        <svg className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-blue)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
        </svg>
      </button>
    </div>
  );
});

ZoomControls.displayName = 'ZoomControls';

export default ZoomControls;

