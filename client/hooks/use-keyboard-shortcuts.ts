import { useEffect } from "react";

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      const isTypingInInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      // Allow certain shortcuts even in input
      const allowedInInput = ["/", "Escape"];

      if (isTypingInInput && !allowedInInput.includes(event.key)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
};
