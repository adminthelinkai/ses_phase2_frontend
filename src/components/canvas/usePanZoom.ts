import { useState, useCallback, useRef, useEffect } from 'react';

interface PanZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

interface UsePanZoomOptions {
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  initialScale?: number;
}

interface UsePanZoomReturn {
  state: PanZoomState;
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  controls: {
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    fitContent: () => void;
  };
  isPanning: boolean;
}

const usePanZoom = (options: UsePanZoomOptions = {}): UsePanZoomReturn => {
  const {
    minScale = 0.5,
    maxScale = 2.0,
    scaleStep = 0.1,
    initialScale = 1,
  } = options;

  const [state, setState] = useState<PanZoomState>({
    scale: initialScale,
    translateX: 0,
    translateY: 0,
  });

  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startTranslateRef = useRef({ x: 0, y: 0 });

  // Mouse pan handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan on left click and not on interactive elements
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, [role="button"]')) return;

    e.preventDefault();
    setIsPanning(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startTranslateRef.current = { x: state.translateX, y: state.translateY };
  }, [state.translateX, state.translateY]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      setState(prev => ({
        ...prev,
        translateX: startTranslateRef.current.x + deltaX,
        translateY: startTranslateRef.current.y + deltaY,
      }));
    };

    const onMouseUp = () => {
      setIsPanning(false);
    };

    if (isPanning) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isPanning]);

  // Native wheel event listener with { passive: false } to prevent browser zoom
  // This is required because React's synthetic events can't prevent Ctrl+Scroll browser zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only zoom when Ctrl key is pressed, otherwise allow normal scroll
      if (!e.ctrlKey && !e.metaKey) {
        return; // Let the event bubble for normal scrolling
      }
      
      // Prevent browser's native zoom
      e.preventDefault();
      e.stopPropagation();
      
      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setState(prev => {
        const direction = e.deltaY < 0 ? 1 : -1;
        const newScale = Math.min(maxScale, Math.max(minScale, prev.scale + direction * scaleStep));
        
        if (newScale === prev.scale) return prev;

        // Calculate new translate to zoom toward cursor
        const scaleRatio = newScale / prev.scale;
        const newTranslateX = cursorX - (cursorX - prev.translateX) * scaleRatio;
        const newTranslateY = cursorY - (cursorY - prev.translateY) * scaleRatio;

        return {
          scale: newScale,
          translateX: newTranslateX,
          translateY: newTranslateY,
        };
      });
    };

    // Use { passive: false } to allow preventDefault() on wheel events
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [minScale, maxScale, scaleStep]);

  // Touch handlers for mobile
  const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - pan
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      startTranslateRef.current = { x: state.translateX, y: state.translateY };
      setIsPanning(true);
    } else if (e.touches.length === 2) {
      // Two finger - pinch zoom (store initial distance)
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance: Math.hypot(dx, dy),
      };
    }
  }, [state.translateX, state.translateY]);

  // Control functions
  const zoomIn = useCallback(() => {
    setState(prev => {
      const newScale = Math.min(maxScale, prev.scale + scaleStep);
      return { ...prev, scale: newScale };
    });
  }, [maxScale, scaleStep]);

  const zoomOut = useCallback(() => {
    setState(prev => {
      const newScale = Math.max(minScale, prev.scale - scaleStep);
      return { ...prev, scale: newScale };
    });
  }, [minScale, scaleStep]);

  const resetView = useCallback(() => {
    setState({
      scale: initialScale,
      translateX: 0,
      translateY: 0,
    });
  }, [initialScale]);

  const fitContent = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const containerRect = container.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    // Calculate scale to fit content with some padding
    const padding = 40;
    const scaleX = (containerRect.width - padding * 2) / (contentRect.width / state.scale);
    const scaleY = (containerRect.height - padding * 2) / (contentRect.height / state.scale);
    const newScale = Math.min(maxScale, Math.max(minScale, Math.min(scaleX, scaleY)));

    // Center the content
    const scaledWidth = (contentRect.width / state.scale) * newScale;
    const scaledHeight = (contentRect.height / state.scale) * newScale;
    const newTranslateX = (containerRect.width - scaledWidth) / 2;
    const newTranslateY = (containerRect.height - scaledHeight) / 2;

    setState({
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY,
    });
  }, [state.scale, minScale, maxScale]);

  return {
    state,
    containerRef,
    contentRef,
    handlers: {
      onMouseDown,
      onTouchStart,
    },
    controls: {
      zoomIn,
      zoomOut,
      resetView,
      fitContent,
    },
    isPanning,
  };
};

export default usePanZoom;

