import { useState, useRef, useCallback, useEffect } from "react";
import { useUserData } from "../contexts/UserDataProvider";

export const usePullToRefresh = () => {
  const { refreshAll, isRefreshing } = useUserData();

  // Pull to refresh state
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Check if we're at the very top of the page
    const isAtTop = window.scrollY === 0;
    if (isAtTop) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = 0; // Reset if not at top
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const isAtTop = window.scrollY === 0;

      // Only handle pull-to-refresh when at the very top AND we have a valid start position
      if (isAtTop && startY.current > 0) {
        currentY.current = e.touches[0].clientY;
        const distance = Math.max(0, currentY.current - startY.current);

        // Only set pull state, don't prevent default here to avoid intervention warnings
        setPullDistance(Math.min(distance, 100));
        setIsPulling(distance > 60);
      } else {
        // Reset pull state if we're not at the top
        if (pullDistance > 0) {
          setPullDistance(0);
          setIsPulling(false);
          startY.current = 0;
        }
      }
    },
    [pullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    // Only trigger refresh if we were actually pulling and at the top
    const isAtTop = window.scrollY === 0;
    if (isAtTop && isPulling && pullDistance > 60 && !isRefreshing) {
      await refreshAll();
    }

    // Always reset pull state on touch end
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  }, [isPulling, pullDistance, refreshAll, isRefreshing]);

  // Set up touch event listeners on document to avoid scroll container issues
  useEffect(() => {
    // Use passive listeners to avoid intervention warnings
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
  };
};
