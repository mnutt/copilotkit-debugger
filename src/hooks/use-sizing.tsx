import { useState, useRef, useCallback, useMemo } from "react";

// Storage key for the debugger height
const HEIGHT_STORAGE_KEY = "copilotkit-debugger-height";
const DEFAULT_HEIGHT = 400;
const MIN_HEIGHT = 100;
const MAX_HEIGHT = 800;

/**
 * Loads the saved height from localStorage
 */
function loadSavedHeight(): number | null {
  try {
    const savedHeight = localStorage.getItem(HEIGHT_STORAGE_KEY);
    if (!savedHeight) return null;

    const height = parseInt(savedHeight, 10);
    if (!isNaN(height)) {
      return height;
    }
  } catch (error) {
    console.warn("Failed to load debugger height from localStorage", error);
  }

  return null;
}

function saveHeight(height: number): void {
  try {
    localStorage.setItem(HEIGHT_STORAGE_KEY, height.toString());
  } catch (error) {
    console.warn("Failed to save debugger height to localStorage", error);
  }
}

/**
 * Hook for managing resizable height
 */
const useSizing = () => {
  const [height, setHeight] = useState(() => loadSavedHeight() || DEFAULT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();

    // Set up initial state
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;

    e.currentTarget.setPointerCapture(e.pointerId);
  }, [height]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;

    const deltaY = e.clientY - startYRef.current;
    setHeight(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeightRef.current + deltaY)));
  }, [isResizing]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;

    const finalDeltaY = e.clientY - startYRef.current;
    saveHeight(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeightRef.current + finalDeltaY)));

    e.currentTarget.releasePointerCapture(e.pointerId);

    setIsResizing(false);
  }, [isResizing]);

  // Create stable prop objects with useMemo
  const resizeHandleProps = useMemo(() => ({
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    style: {
      touchAction: "none", // Prevents browser handling of touch events
    },
  }), [handlePointerDown, handlePointerMove, handlePointerUp]);

  const bottomOffset = DEFAULT_HEIGHT - height;

  const resizeContainerProps = useMemo(() => ({
    style: {
      height: `${height}px`,
      bottom: `${10 + bottomOffset}px`,
      ...(isResizing ? { willChange: "transform", transition: "none" } : {}),
    }
  }), [height, bottomOffset, isResizing]);

  return {
    height,
    setHeight,
    isResizing,
    resizeHandleProps,
    resizeContainerProps
  };
};

export default useSizing;