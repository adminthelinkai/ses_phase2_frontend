import React, { memo } from 'react';

interface LoadingIndicatorProps {
  className?: string;
}

/**
 * Pure CSS loading indicator with typing animation.
 * Optimized for performance with GPU-accelerated CSS animations.
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = memo(({ className = '' }) => {
  return (
    <div className={`flex justify-start ${className}`}>
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          <div className="typing-dot" style={{ animationDelay: '0s' }}></div>
          <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
          <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
});

LoadingIndicator.displayName = 'LoadingIndicator';

export default LoadingIndicator;

