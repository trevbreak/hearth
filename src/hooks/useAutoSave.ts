import { useEffect, useRef, useState, useCallback } from 'react';
import { SaveStatusType } from '@/components/editor/SaveStatus';

interface UseAutoSaveOptions {
  content: string;
  filePath: string | null;
  frontmatter?: string | null;
  enabled: boolean;
  delay?: number;
  onSave: (path: string, content: string, frontmatter?: string | null) => Promise<void>;
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatusType;
  forceSave: () => void;
  errorMessage?: string;
}

export function useAutoSave({
  content,
  filePath,
  frontmatter,
  enabled,
  delay = 2000,
  onSave,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>('saved');
  const [errorMessage, setErrorMessage] = useState<string>();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedContentRef = useRef<string>(content);
  const isSavingRef = useRef(false);

  const performSave = useCallback(async () => {
    if (!filePath || !enabled || isSavingRef.current) {
      return;
    }

    // Check if content actually changed
    if (content === lastSavedContentRef.current) {
      setSaveStatus('saved');
      return;
    }

    try {
      isSavingRef.current = true;
      setSaveStatus('saving');
      setErrorMessage(undefined);

      console.log('[AutoSave] Saving file:', filePath);
      await onSave(filePath, content, frontmatter);

      lastSavedContentRef.current = content;
      setSaveStatus('saved');
      console.log('[AutoSave] File saved successfully');
    } catch (error) {
      console.error('[AutoSave] Failed to save:', error);
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      isSavingRef.current = false;
    }
  }, [content, filePath, frontmatter, enabled, onSave]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || !filePath) {
      setSaveStatus('saved');
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't set unsaved status if we're currently saving
    if (!isSavingRef.current && content !== lastSavedContentRef.current) {
      setSaveStatus('unsaved');
    }

    // Schedule save
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, filePath, enabled, delay, performSave]);

  // Force save function for manual saves (Cmd+S)
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSave();
  }, [performSave]);

  return {
    saveStatus,
    forceSave,
    errorMessage,
  };
}
