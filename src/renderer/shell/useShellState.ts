import { useState, useRef, useCallback, useEffect } from 'react';
import type { ThemeId } from '../env';
import { loadUnlocked, UNLOCK_CODE } from '../modules/livevideo/sources';
import { loadJson, saveJson } from '../shared/storage';
import { THEME_LIST } from './ThemeManager';

export function useShellState() {
  const [workMode, setWorkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('vscode');
  const [unlockedThemes, setUnlockedThemes] = useState<ThemeId[]>(loadUnlocked);
  const [showUnlockDialog, setShowUnlockDialog] = useState<ThemeId | null>(null);
  const [unlockInput, setUnlockInput] = useState('');
  const opacityRef = useRef(1);
  const savedOpacityRef = useRef(1);

  // Global shortcut listeners
  useEffect(() => {
    const c1 = window.api.onToggleMode(() => setWorkMode((p) => !p));
    const c2 = window.api.onOpacityChanged((o) => { opacityRef.current = o; });
    return () => { c1(); c2(); };
  }, []);

  // Global mouseup to stop window drag
  useEffect(() => {
    const up = () => window.api.stopDrag();
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  // Persist unlocked themes
  useEffect(() => { saveJson('yuyin-unlocked', unlockedThemes); }, [unlockedThemes]);

  // Theme unlock
  const handleUnlockRequest = useCallback((theme: ThemeId) => {
    setShowUnlockDialog(theme);
    setUnlockInput('');
  }, []);

  const handleUnlockSubmit = useCallback(() => {
    if (unlockInput.trim() === UNLOCK_CODE && showUnlockDialog) {
      setUnlockedThemes((prev) => [...new Set([...prev, showUnlockDialog])]);
      setCurrentTheme(showUnlockDialog);
      setShowUnlockDialog(null);
    }
  }, [unlockInput, showUnlockDialog]);

  // Hover zone — uses ref to avoid re-renders on opacity change
  const handleHoverStart = useCallback(() => {
    savedOpacityRef.current = opacityRef.current;
    window.api.setOpacity(Math.min(1, opacityRef.current + 0.3));
  }, []);

  const handleHoverEnd = useCallback(() => {
    window.api.setOpacity(savedOpacityRef.current);
  }, []);

  return {
    workMode, setWorkMode,
    currentTheme, setCurrentTheme,
    unlockedThemes,
    showUnlockDialog, setShowUnlockDialog,
    unlockInput, setUnlockInput,
    handleUnlockRequest, handleUnlockSubmit,
    handleHoverStart, handleHoverEnd,
    themeList: THEME_LIST,
  };
}
