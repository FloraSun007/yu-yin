import { useState, useRef, useCallback, useEffect } from 'react';
import type { PresetSource } from '../env';
import { PRESET_SOURCES } from './sources';
import { loadJson, saveJson } from '../../shared/storage';
import type { VideoPlayerHandle } from './VideoPlayer';

export type VideoState = ReturnType<typeof useVideoState>;

export function useVideoState() {
  const [sourceUrl, setSourceUrl] = useState('');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [customSources, setCustomSources] = useState<string[]>(() =>
    loadJson<string[]>('yuyin-sources', [])
  );

  const playerRef = useRef<VideoPlayerHandle>(null);
  const currentSourceRef = useRef<PresetSource | null>(null);
  const urlIndexRef = useRef(0);

  // Persist custom sources
  useEffect(() => { saveJson('yuyin-sources', customSources); }, [customSources]);

  const handleSelectSource = useCallback((url: string) => {
    if (!url) return;
    const preset = PRESET_SOURCES.find(s => s.urls.includes(url));
    if (preset) {
      currentSourceRef.current = preset;
      urlIndexRef.current = preset.urls.indexOf(url);
    } else {
      currentSourceRef.current = null;
      urlIndexRef.current = 0;
    }
    setSourceUrl(url);
    setPlaying(true);
    setSwitching(false);
  }, []);

  const handleAddCustom = useCallback((url: string) => {
    setCustomSources((prev) => prev.includes(url) ? prev : [...prev, url]);
  }, []);

  const handleRemoveCustom = useCallback((url: string) => {
    setCustomSources((prev) => prev.filter((u) => u !== url));
  }, []);

  const handleFatalError = useCallback(() => {
    const preset = currentSourceRef.current;
    if (!preset || preset.urls.length <= 1) return;
    const nextIndex = urlIndexRef.current + 1;
    if (nextIndex >= preset.urls.length) return;
    setSwitching(true);
    urlIndexRef.current = nextIndex;
    setSourceUrl(preset.urls[nextIndex]);
    setTimeout(() => setSwitching(false), 3000);
  }, []);

  const handleSeek = useCallback((time: number) => {
    playerRef.current?.seek(time);
    setCurrentTime(time);
  }, []);

  const handleSetSize = useCallback((w: number, h: number) => {
    window.api.setSize(w, h);
  }, []);

  const handleBack = useCallback(() => {
    setSourceUrl('');
    setPlaying(false);
    window.api.setSize(600, 450);
  }, []);

  return {
    sourceUrl, playing, volume, currentTime, duration, switching, customSources,
    playerRef,
    handleSelectSource, handleAddCustom, handleRemoveCustom, handleFatalError,
    handleSeek, handleSetSize, handleBack,
    setCurrentTime, setDuration, setPlaying, setVolume,
  };
}
