import { useRef, useMemo, useEffect, useState } from "react";

// Store debugger position in localStorage
const EXPANDED_POSITION_STORAGE_KEY = "copilotkit-debugger-expanded-position";
const COLLAPSED_POSITION_STORAGE_KEY = "copilotkit-debugger-collapsed-position";

type Coordinates = {
  x: number;
  y: number;
};

function loadSavedPosition(isExpanded: boolean): Coordinates | null {
  try {
    const savedPosition = localStorage.getItem(isExpanded ? EXPANDED_POSITION_STORAGE_KEY : COLLAPSED_POSITION_STORAGE_KEY);
    if (!savedPosition) return null;

    const [x, y] = savedPosition.split(",").map(parseFloat);
    if (!isNaN(x) && !isNaN(y)) {
      return { x, y };
    }
  } catch (error) {
    console.warn("Failed to load debugger position from localStorage", error);
  }

  return null;
}

// Save position to localStorage when it changes
function savePosition(x: number, y: number, isExpanded: boolean) {
  try {
    localStorage.setItem(isExpanded ? EXPANDED_POSITION_STORAGE_KEY : COLLAPSED_POSITION_STORAGE_KEY, `${x},${y}`);
  } catch (error) {
    console.warn("Failed to save debugger position to localStorage", error);
  }
};

function translate3d(coords: Coordinates) {
  return `translate3d(${coords.x}px, ${coords.y}px, 0)`;
}

function debounceTimer(func: () => void, delay: number) {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(func, delay);
  };
}

const usePositioning = ({ onHandleClick, isExpanded }: { onHandleClick: (e: React.MouseEvent) => void, isExpanded: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMoving, setIsMoving] = useState(false);
  const dragStartRef = useRef<Coordinates>({ x: 0, y: 0 });
  const translateRef = useRef<Coordinates>({ x: 0, y: 0 });
  const movedRef = useRef(false);

  function clampToViewport() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let deltaX = 0;
    let deltaY = 0;

    if (rect.left < 0) {
      deltaX = -rect.left;
    }
    if (rect.top < 0) {
      deltaY = -rect.top;
    }

    if (rect.right > window.innerWidth) {
      deltaX = window.innerWidth - rect.right;
    }
    if (rect.bottom > window.innerHeight) {
      deltaY = window.innerHeight - rect.bottom;
    }

    if (deltaX !== 0 || deltaY !== 0) {
      translateRef.current.x += deltaX;
      translateRef.current.y += deltaY;
      containerRef.current.style.transform = translate3d(translateRef.current);
    }
  }

  useEffect(() => {
    const savedPosition = loadSavedPosition(isExpanded);
    if (!savedPosition) return;

    translateRef.current = savedPosition;
    if (containerRef.current) {
      containerRef.current.style.transform = translate3d(savedPosition);
    }
  }, [isExpanded]);

  useEffect(() => {
    const debouncedClampToViewport = debounceTimer(clampToViewport, 500);
    window.addEventListener("resize", debouncedClampToViewport);

    return () => {
      window.removeEventListener("resize", debouncedClampToViewport);
    };
  }, []);

  const moveContainerProps = useMemo(() => ({
    ref: containerRef,
    style: {
      transform: translate3d(translateRef.current),
      ...(isMoving ? { willChange: "transform", transition: "none" } : {}),
    },
  }), [isMoving]);

  const moveHandleProps = useMemo(() => {
    const handlePointerDown = (e: React.PointerEvent) => {
      if (!containerRef.current) return;

      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      // Save initial pointer position
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      // Parse current transform to get starting position
      const containerElement = containerRef.current;
      const computedTransform = window.getComputedStyle(containerElement).transform;
      if (computedTransform && computedTransform !== "none") {
        const matrix = new DOMMatrix(computedTransform);
        translateRef.current = { x: matrix.e, y: matrix.f };
      }

      setIsMoving(true);

      // Track if the user has moved the debugger
      movedRef.current = false;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isMoving || !containerRef.current) return;

      e.preventDefault();
      const containerElement = containerRef.current;

      movedRef.current = true;

      // movement delta
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const newTranslateX = translateRef.current.x + deltaX;
      const newTranslateY = translateRef.current.y + deltaY;

      containerElement.style.transform = translate3d({ x: newTranslateX, y: newTranslateY });

      // Update start point for next movement calculation
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      translateRef.current = { x: newTranslateX, y: newTranslateY };
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (!containerRef.current) return;

      // If there was no movement, toggle the expanded state
      if (movedRef.current === false) {
        onHandleClick(e);
      }
      movedRef.current = false;

      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsMoving(false);

      savePosition(translateRef.current.x, translateRef.current.y, isExpanded);
    };

    return {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    };
  }, [onHandleClick, isExpanded, isMoving]);

  return {
    moveContainerProps,
    moveHandleProps,
    isMoving,
    hasMoved: movedRef.current,
  }
}

export default usePositioning;
