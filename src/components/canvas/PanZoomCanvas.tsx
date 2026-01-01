import React, { memo, ReactNode } from 'react';
import usePanZoom from './usePanZoom';
import ZoomControls from './ZoomControls';

interface PanZoomCanvasProps {
  children: ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  showControls?: boolean;
}

const PanZoomCanvas: React.FC<PanZoomCanvasProps> = memo(({
  children,
  className = '',
  minScale = 0.5,
  maxScale = 2.0,
  initialScale = 1,
  showControls = true,
}) => {
  const {
    state,
    containerRef,
    contentRef,
    handlers,
    controls,
    isPanning,
  } = usePanZoom({ minScale, maxScale, initialScale });

  const transformStyle: React.CSSProperties = {
    transform: `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`,
    transformOrigin: '0 0',
    willChange: 'transform',
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseDown={handlers.onMouseDown}
      onTouchStart={handlers.onTouchStart}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Pannable/Zoomable Content */}
      <div
        ref={contentRef}
        className="inline-block min-w-full min-h-full"
        style={transformStyle}
      >
        {children}
      </div>

      {/* Zoom Controls */}
      {showControls && (
        <ZoomControls
          scale={state.scale}
          onZoomIn={controls.zoomIn}
          onZoomOut={controls.zoomOut}
          onReset={controls.resetView}
          onFitContent={controls.fitContent}
          minScale={minScale}
          maxScale={maxScale}
        />
      )}

      {/* Pan Hint - shows briefly on first load */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none opacity-0 animate-fade-hint">
        <div className="bg-[var(--bg-panel)]/80 backdrop-blur-sm border border-[var(--border-color)] rounded-full px-3 py-1 flex items-center gap-2">
          <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
          <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Drag to pan • Ctrl+Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
});

PanZoomCanvas.displayName = 'PanZoomCanvas';

export default PanZoomCanvas;

