import { useEffect, useCallback } from 'react';

type ShortcutHandlers = {
  onFocusInput?: () => void;
  onSubmit?: () => void;
  onOpenCommandPalette?: () => void;
};

export function useShortcuts(handlers: ShortcutHandlers) {
  const { onFocusInput, onSubmit, onOpenCommandPalette } = handlers;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Focus search: '/'
      if (e.key === '/' && e.target === document.body) {
        e.preventDefault();
        onFocusInput?.();
      }

      // Submit: Cmd/Ctrl + Enter
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSubmit?.();
      }

      // Command Palette: Cmd + K
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
    },
    [onFocusInput, onSubmit, onOpenCommandPalette],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
