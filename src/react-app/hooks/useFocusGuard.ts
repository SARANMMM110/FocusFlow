import { useEffect, useRef, useState } from "react";

interface FocusGuardOptions {
  isActive: boolean; // Is a focus session running?
  onDistraction?: (type: string, duration: number) => void;
  onReturn?: () => void;
}

export function useFocusGuard({ isActive, onDistraction, onReturn }: FocusGuardOptions) {
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [isTabSwitched, setIsTabSwitched] = useState(false);
  const distractionStartTime = useRef<number | null>(null);
  const totalDistractions = useRef(0);
  const totalDistractionTime = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);

      if (!isVisible && isActive) {
        // User left the tab/window during focus session
        distractionStartTime.current = Date.now();
        setIsTabSwitched(true);
        totalDistractions.current++;
      } else if (isVisible && distractionStartTime.current) {
        // User returned to the tab
        const duration = Math.round((Date.now() - distractionStartTime.current) / 1000);
        totalDistractionTime.current += duration;
        
        if (onDistraction) {
          onDistraction("tab_switch", duration);
        }
        if (onReturn) {
          onReturn();
        }

        distractionStartTime.current = null;
        setIsTabSwitched(false);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive) {
        // Show browser confirmation dialog
        e.preventDefault();
        e.returnValue = "You have an active focus session. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    const handleBlur = () => {
      if (isActive && !document.hidden) {
        // Window lost focus but page is still visible (e.g., clicked on another window)
        distractionStartTime.current = Date.now();
        totalDistractions.current++;
      }
    };

    const handleFocus = () => {
      if (isActive && distractionStartTime.current) {
        const duration = Math.round((Date.now() - distractionStartTime.current) / 1000);
        totalDistractionTime.current += duration;
        
        if (onDistraction) {
          onDistraction("window_blur", duration);
        }
        if (onReturn) {
          onReturn();
        }

        distractionStartTime.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isActive, onDistraction, onReturn]);

  // Update browser tab title during focus
  useEffect(() => {
    const originalTitle = document.title;

    if (isActive) {
      document.title = "🎯 Focus Mode Active - Stay on Task!";
      
      // Blink title when user switches tabs
      if (isTabSwitched) {
        const blinkInterval = setInterval(() => {
          document.title = document.title === "🎯 Focus Mode Active - Stay on Task!" 
            ? "⚠️ Come Back to Focus!" 
            : "🎯 Focus Mode Active - Stay on Task!";
        }, 1000);

        return () => {
          clearInterval(blinkInterval);
          document.title = originalTitle;
        };
      }
    } else {
      document.title = originalTitle;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [isActive, isTabSwitched]);

  return {
    isPageVisible,
    isTabSwitched,
    totalDistractions: totalDistractions.current,
    totalDistractionTime: totalDistractionTime.current,
  };
}
