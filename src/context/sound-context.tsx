'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SoundPackId, SoundEngineOptions } from '@/types/sound';
import { getSoundEngine } from '@/lib/sound-engine';
import { SWITCH_PROFILES } from '@/lib/sound-profiles';

interface SoundContextType {
  activePack: SoundPackId;
  setActivePack: (pack: SoundPackId) => void;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  options: SoundEngineOptions;
  updateOptions: (opts: Partial<SoundEngineOptions>) => void;
  playKey: (code?: string, packId?: SoundPackId) => void;
  releaseKey: (code?: string, packId?: SoundPackId) => void;
  isAudioReady: boolean;
  initAudio: () => void;
  analyser: AnalyserNode | null;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [activePack, setActivePackState] = useState<SoundPackId>('s1');
  const [volume, setVolumeState] = useState<number>(0.75);
  const [prevVolume, setPrevVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [options, setOptionsState] = useState<SoundEngineOptions>({
    volume: 0.75,
    pitchShift: 1.0,
    stereoSpread: true,
    playKeyUp: true,
    deskmatResonance: true
  });
  const [isAudioReady, setIsAudioReady] = useState<boolean>(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const isInitialized = useRef<boolean>(false);

  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    const engine = getSoundEngine();
    const ctx = engine.getAudioContext();
    if (ctx) {
      setIsAudioReady(true);
      setAnalyser(engine.getAnalyser());
      engine.preloadPack(activePack);
    }
  }, [activePack]);

  useEffect(() => {
    // Attempt audio unlock on first global click or keydown
    const handleFirstGesture = () => {
      if (!isInitialized.current) {
        isInitialized.current = true;
        initAudio();
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [initAudio]);

  const setActivePack = useCallback((pack: SoundPackId) => {
    setActivePackState(pack);
    const engine = getSoundEngine();
    engine.setPack(pack);
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    const engine = getSoundEngine();
    engine.updateOptions({ volume: clamped });
    setOptionsState(prev => ({ ...prev, volume: clamped }));
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      const restored = prevVolume > 0 ? prevVolume : 0.75;
      setIsMuted(false);
      setVolume(restored);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  }, [isMuted, prevVolume, volume, setVolume]);

  const updateOptions = useCallback((newOpts: Partial<SoundEngineOptions>) => {
    const engine = getSoundEngine();
    engine.updateOptions(newOpts);
    setOptionsState(prev => ({ ...prev, ...newOpts }));
  }, []);

  const playKey = useCallback((code: string = 'KeyF', packId?: SoundPackId) => {
    initAudio();
    const engine = getSoundEngine();
    engine.triggerKeyDown(code, packId || activePack);
  }, [activePack, initAudio]);

  const releaseKey = useCallback((code: string = 'KeyF', packId?: SoundPackId) => {
    const engine = getSoundEngine();
    engine.triggerKeyUp(code, packId || activePack);
  }, [activePack]);

  return (
    <SoundContext.Provider
      value={{
        activePack,
        setActivePack,
        volume,
        setVolume,
        isMuted,
        toggleMute,
        options,
        updateOptions,
        playKey,
        releaseKey,
        isAudioReady,
        initAudio,
        analyser
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return ctx;
}
