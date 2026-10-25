'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { generateRandomWords, generateTextByDifficulty, COMMON_WORDS } from '@/lib/word-banks';
import { saveTestToProfile } from '@/lib/profile-storage';
import { SoundPackId, DifficultyMode } from '@/types/sound';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Square,
  Play,
  Flame,
  Check,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Clock,
  FileText,
  Infinity as InfinityIcon,
  X,
  Sparkles
} from 'lucide-react';
import { SwitchIcon } from '@/components/SwitchIcon';
import Link from 'next/link';

type FocusModeType = 'time' | 'words' | 'unlimited';

function FocusModeContent() {
  const searchParams = useSearchParams();
  const { activePack, setActivePack, playKey, releaseKey, isMuted, toggleMute, volume } = useSound();

  // Settings from query params or defaults
  const paramDuration = searchParams.get('duration');
  const paramPack = searchParams.get('pack') as SoundPackId | null;
  const paramDiff = searchParams.get('diff') as DifficultyMode | null;

  // If user came with explicit query params from another page, skip setup
  const hasDirectParams = paramDuration !== null || paramPack !== null;

  // Setup modal state for users visiting /focus directly
  const [isConfigured, setIsConfigured] = useState<boolean>(hasDirectParams);

  // Focus mode configuration state
  const [selectedMode, setSelectedMode] = useState<FocusModeType>(
    paramDuration === '0' ? 'unlimited' : 'time'
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(
    paramDuration ? parseInt(paramDuration, 10) : 60
  );
  const [selectedWords, setSelectedWords] = useState<number>(50);
  const [difficulty, setDifficulty] = useState<DifficultyMode>(paramDiff || 'easy');

  const isUnlimited = selectedMode === 'unlimited';
  const initialDuration = isUnlimited ? 0 : selectedDuration;

  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);
  const [words, setWords] = useState<string[]>(() => COMMON_WORDS.slice(0, 70));
  const fullText = useMemo(() => words.join(' '), [words]);

  const [input, setInput] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  // Results
  const [finalWpm, setFinalWpm] = useState<number>(0);
  const [finalAccuracy, setFinalAccuracy] = useState<number>(100);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const lastLineTopRef = useRef<number>(0);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const keydownSoundPlayedRef = useRef<boolean>(false);

  // Apply pack if specified in query
  useEffect(() => {
    if (paramPack && SWITCH_PROFILES[paramPack]) {
      setActivePack(paramPack);
    }
  }, [paramPack, setActivePack]);

  // Generate words
  const initWords = useCallback(() => {
    let count = 100;
    if (selectedMode === 'words') {
      count = selectedWords;
    } else if (selectedMode === 'unlimited') {
      count = 200;
    } else {
      count = Math.max(80, Math.floor(selectedDuration * 2.5));
    }
    setWords(generateTextByDifficulty(difficulty, count));
  }, [selectedMode, selectedWords, selectedDuration, difficulty]);

  // Reset test
  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    startTimeRef.current = null;
    lastLineTopRef.current = 0;

    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = 0;
    }

    setInput('');
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(isUnlimited ? 0 : selectedDuration);
    setFinalWpm(0);
    setFinalAccuracy(100);
    initWords();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
  }, [isUnlimited, selectedDuration, initWords]);

  useEffect(() => {
    if (isConfigured) {
      resetTest();
    }
  }, [isConfigured, resetTest]);

  // Global restart event listener from shortcuts manager (Tab+Enter, Shift+Enter)
  useEffect(() => {
    const handleRestartEvent = () => {
      resetTest();
    };
    window.addEventListener('thocktype:restart-test', handleRestartEvent);
    return () => window.removeEventListener('thocktype:restart-test', handleRestartEvent);
  }, [resetTest]);

  // Finish test with exact timing and error penalty
  const finishTest = useCallback((finalInput: string, seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsFinished(true);

    const exactSeconds = startTimeRef.current
      ? Math.max(0.5, (performance.now() - startTimeRef.current) / 1000)
      : Math.max(1, seconds);
    const minutes = exactSeconds / 60;
    let correctChars = 0;
    let incorrectChars = 0;
    for (let i = 0; i < finalInput.length; i++) {
      if (finalInput[i] === fullText[i]) correctChars++;
      else incorrectChars++;
    }

    const netWpm = Math.max(0, Math.round(((correctChars / 5) - incorrectChars) / minutes)) || 0;
    const acc = finalInput.length > 0 ? Math.round((correctChars / finalInput.length) * 1000) / 10 : 100;
    const rawWpm = Math.round((finalInput.length / 5) / minutes) || 0;

    setFinalWpm(netWpm);
    setFinalAccuracy(acc);

    // Save session to local account
    saveTestToProfile({
      wpm: netWpm,
      rawWpm,
      accuracy: acc,
      timeSpent: Math.round(exactSeconds),
      exactSeconds: Math.round(exactSeconds * 100) / 100,
      difficulty,
      correctChars,
      incorrectChars,
      extraChars: Math.max(0, finalInput.length - fullText.length),
      missedChars: Math.max(0, fullText.length - finalInput.length),
      totalKeystrokes: finalInput.length,
      backspaceCount: 0,
      correctedErrors: 0,
      totalErrorsCommitted: incorrectChars,
      consistency: 90,
      efficiency: 92,
      kps: Math.round((finalInput.length / exactSeconds) * 10) / 10,
      msPerKey: Math.round((exactSeconds / (finalInput.length || 1)) * 1000),
      troubleKeys: [],
      soundPack: activePack,
      history: [],
      report: {
        tier: 'Zen Verified',
        tierBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        projectedWpmMin: netWpm,
        projectedWpmMax: netWpm + 15,
        potentialHeadline: 'Zen Flow Complete',
        motivationMessage: 'Pure focus achieved.',
        harshDiagnostics: [],
        keyTrainingRecommendation: 'Continue mindful typing.',
        kps: Math.round((finalInput.length / exactSeconds) * 10) / 10,
        msPerKey: Math.round((exactSeconds / (finalInput.length || 1)) * 1000),
        efficiency: 92
      }
    });
  }, [fullText, activePack, difficulty]);

  // Handle Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    let val = e.target.value;

    // Mobile keyboard normalization
    if (val.endsWith('. ') && !fullText.slice(0, val.length).endsWith('. ')) {
      val = val.slice(0, -2) + '  ';
    }
    if (val.length === 1 && difficulty === 'easy' && fullText.length > 0) {
      if (val[0].toLowerCase() === fullText[0].toLowerCase()) {
        val = val.toLowerCase();
      }
    }

    if (!isStarted && val.length > 0) {
      setIsStarted(true);
      startTimeRef.current = performance.now();

      timerRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const exactElapsed = (performance.now() - startTimeRef.current) / 1000;
        const roundedSec = Math.floor(exactElapsed);

        if (isUnlimited) {
          setTimeLeft(roundedSec);
        } else {
          const remaining = Math.max(0, selectedDuration - roundedSec);
          setTimeLeft(remaining);
          if (exactElapsed >= selectedDuration) {
            finishTest(inputRef.current?.value || '', selectedDuration);
          }
        }
      }, 100);
    }

    // Mobile virtual keyboard audio fallback (when onKeyDown doesn't report key code)
    if (!keydownSoundPlayedRef.current) {
      if (val.length > input.length) {
        const lastChar = val[val.length - 1];
        let soundCode = 'KeyF';
        if (lastChar === ' ') {
          soundCode = 'Space';
        } else if (lastChar >= '0' && lastChar <= '9') {
          soundCode = `Digit${lastChar}`;
        } else if (lastChar.toLowerCase() >= 'a' && lastChar.toLowerCase() <= 'z') {
          soundCode = `Key${lastChar.toUpperCase()}`;
        }
        playKey(soundCode);
      } else if (val.length < input.length) {
        playKey('Backspace');
      }
    }
    keydownSoundPlayedRef.current = false;

    setInput(val);

    // Continuous word streaming for time and unlimited modes:
    // When remaining untyped text drops below 140 characters, seamlessly append 60 more words!
    if ((isUnlimited || selectedMode === 'time') && (fullText.length - val.length) < 140) {
      setWords((prev) => [...prev, ...generateTextByDifficulty(difficulty, 60)]);
    }

    // Words mode completion
    if (selectedMode === 'words' && val.length >= fullText.length) {
      const currentExactElapsed = startTimeRef.current
        ? (performance.now() - startTimeRef.current) / 1000
        : timeLeft;
      finishTest(val, currentExactElapsed);
    }
  };

  // Keyboard sounds
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      resetTest();
      return;
    }
    if (e.code && e.code !== 'Unidentified') {
      pressedKeysRef.current.add(e.code);
      playKey(e.code);
      keydownSoundPlayedRef.current = true;
    } else {
      keydownSoundPlayedRef.current = false;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code && e.code !== 'Unidentified') {
      pressedKeysRef.current.delete(e.code);
      releaseKey(e.code);
    }
  };

  // Global key bindings (Tab + Enter, Esc, Enter to start setup)
  useEffect(() => {
    let tabDown = false;
    const onKey = (e: KeyboardEvent) => {
      if (!isConfigured) {
        if (e.key === 'Enter') {
          e.preventDefault();
          setIsConfigured(true);
        }
        return;
      }

      if (e.key === 'Tab') tabDown = true;
      if (e.key === 'Enter' && (tabDown || isFinished)) {
        e.preventDefault();
        resetTest();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isStarted && !isFinished && input.length > 5) {
          const exactElapsed = startTimeRef.current
            ? (performance.now() - startTimeRef.current) / 1000
            : (isUnlimited ? timeLeft : selectedDuration - timeLeft);
          finishTest(inputRef.current?.value || input, Math.max(1, exactElapsed));
        } else {
          resetTest();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') tabDown = false;
    };

    const onRestartEvent = () => {
      resetTest();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('thocktype:restart-test', onRestartEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('thocktype:restart-test', onRestartEvent);
    };
  }, [resetTest, isConfigured, isUnlimited, isStarted, isFinished, input, timeLeft, selectedDuration, finishTest]);

  // Line-by-line auto-scroll: smoothly rolls up finished lines so upcoming text is always visible
  useEffect(() => {
    if (!activeCharRef.current || !textContainerRef.current) return;
    const container = textContainerRef.current;
    const charEl = activeCharRef.current;

    const charTop = charEl.offsetTop;
    const charHeight = charEl.offsetHeight || 44;

    if (charTop !== lastLineTopRef.current) {
      lastLineTopRef.current = charTop;

      // Keep active line as line 2 of the viewport (or line 1 if at top)
      if (charTop > charHeight * 1.5) {
        const targetScroll = charTop - charHeight;
        container.scrollTo({ top: targetScroll, behavior: 'smooth' });
      } else {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [input]);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentProfile = SWITCH_PROFILES[activePack];

  /* =========================================================================
   * DIRECT VISIT SETUP CARD
   * Rendered when a user navigates directly to /focus without URL params
   * ========================================================================= */
  if (!isConfigured) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] bg-[#0c0d10] text-zinc-100 flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 select-none overflow-y-auto relative">
        
        {/* Subtle Ambient Radial Backlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-xl p-5 xs:p-7 sm:p-8 rounded-3xl bg-[#141519]/95 border border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 my-auto relative z-10">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] font-mono font-semibold text-amber-300 tracking-wider uppercase mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Zen Focus Session</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Configure Your Session
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Full-screen typing flow with authentic mechanical switch audio.
              </p>
            </div>
            
            <Link
              href="/test"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Exit to standard typing test"
            >
              <X className="w-4 h-4" />
            </Link>
          </div>

          {/* 1. Mode & Duration Selection */}
          <div className="mt-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="uppercase tracking-wider text-neutral-400 font-medium">Session Goal</span>
              <span className="text-neutral-500 text-[11px]">
                {selectedMode === 'time' ? `${selectedDuration}s duration` : selectedMode === 'words' ? `${selectedWords} words` : 'Infinite stream'}
              </span>
            </div>

            {/* Mode Segmented Bar */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/[0.06]">
              {(['time', 'words', 'unlimited'] as FocusModeType[]).map((m) => {
                const isSelected = selectedMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMode(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium capitalize flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {m === 'time' && <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-zinc-950' : 'text-neutral-400'}`} />}
                    {m === 'words' && <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-zinc-950' : 'text-neutral-400'}`} />}
                    {m === 'unlimited' && <InfinityIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-zinc-950' : 'text-neutral-400'}`} />}
                    <span>{m === 'unlimited' ? 'Endless' : m}</span>
                  </button>
                );
              })}
            </div>

            {/* Presets Sub-Row */}
            {selectedMode === 'time' && (
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[15, 30, 60, 120].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedDuration(s)}
                    className={`py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                      selectedDuration === s
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35 font-bold shadow-sm'
                        : 'bg-black/30 text-neutral-400 hover:text-white border border-white/[0.04]'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}

            {selectedMode === 'words' && (
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[25, 50, 100, 200].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWords(w)}
                    className={`py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                      selectedWords === w
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35 font-bold shadow-sm'
                        : 'bg-black/30 text-neutral-400 hover:text-white border border-white/[0.04]'
                    }`}
                  >
                    {w}w
                  </button>
                ))}
              </div>
            )}

            {selectedMode === 'unlimited' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-xs font-mono text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Continuous stream with no time limit. Finish whenever ready with Esc.</span>
              </div>
            )}
          </div>

          {/* 2. Difficulty Mode Selection */}
          <div className="mt-5 space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-medium block">
              Vocabulary & Punctuation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as DifficultyMode[]).map((d) => {
                const isSelected = difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white/[0.08] border-amber-500/60 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-black/30 hover:bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {d === 'easy' && <SignalLow className="w-3.5 h-3.5 text-emerald-400" />}
                      {d === 'medium' && <SignalMedium className="w-3.5 h-3.5 text-amber-400" />}
                      {d === 'hard' && <SignalHigh className="w-3.5 h-3.5 text-rose-400" />}
                      <span className={`text-xs font-semibold capitalize ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                        {d}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 leading-tight">
                      {d === 'easy' ? 'Clean lowercase prose' : d === 'medium' ? 'Commas & punctuation' : 'Numbers & full symbol keys'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Switch Personality Selection */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="uppercase tracking-wider text-neutral-400 font-medium">Mechanical Switch Audio</span>
              <span className="text-neutral-300 text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: SWITCH_PROFILES[activePack]?.color }} />
                <span>{SWITCH_PROFILES[activePack]?.name}</span>
                <span className="text-neutral-500 font-normal">({SWITCH_PROFILES[activePack]?.category})</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {PACK_IDS.map((id) => {
                const pack = SWITCH_PROFILES[id];
                const isSelected = activePack === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActivePack(id);
                      playKey('KeyF', id);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.08] text-white shadow-md'
                        : 'bg-black/30 hover:bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white'
                    }`}
                    style={{
                      borderColor: isSelected ? pack.color : undefined,
                      boxShadow: isSelected ? `0 0 14px ${pack.color}25` : undefined
                    }}
                  >
                    <SwitchIcon
                      id={id}
                      className="w-4 h-4 mb-1 shrink-0"
                      style={{ color: pack.color }}
                    />
                    <span className="text-[11px] font-semibold truncate w-full">
                      {pack.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">
                      {pack.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Launch Action Button */}
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                setIsConfigured(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-zinc-950" />
              <span>Enter Zen Focus Mode</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  /* =========================================================================
   * PURE DISTRACTION-FREE TYPING CANVAS
   * ========================================================================= */
  return (
    <div
      onClick={() => {
        if (!isFinished) inputRef.current?.focus();
      }}
      className={`fixed inset-0 w-full h-[100dvh] bg-[#121314] text-zinc-100 flex flex-col items-center justify-between p-4 xs:p-6 sm:p-12 select-none overflow-hidden ${
        isFinished ? 'cursor-default' : 'cursor-text'
      }`}
    >
      {/* Mobile Tap-To-Focus Indicator */}
      {!isStarted && !isInputFocused && !isFinished && (
        <div className="sm:hidden absolute top-14 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-mono text-amber-300 animate-pulse shadow-md">
          <span>Tap screen to open keyboard & type</span>
        </div>
      )}

      {/* Real input capturing typing on desktop & mobile soft keyboards (Only rendered when not finished) */}
      {!isFinished && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          autoFocus
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="done"
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text select-none text-base"
          style={{ fontSize: '16px' }}
          aria-label="Zen typing input"
        />
      )}

      {/* Top Floating Controls: Minimal Timer & Discreet controls */}
      <div className="w-full flex items-center justify-between text-zinc-500 text-xs relative z-20">
        {/* Subtle Back link */}
        <Link
          href="/test"
          className="flex items-center gap-1.5 opacity-40 hover:opacity-100 text-zinc-400 hover:text-zinc-100 transition-opacity cursor-pointer"
          title="Exit Zen Mode to standard test"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-xs hidden sm:inline">Exit Zen</span>
        </Link>

        {/* Minimal Timer strictly centered at top */}
        <div className="flex flex-col items-center relative z-30">
          <div className="flex items-center gap-1.5 text-amber-400">
            {isUnlimited && <span className="font-mono text-xl sm:text-2xl font-bold text-amber-400/80">∞</span>}
            <span className="font-mono text-2xl xs:text-3xl sm:text-4xl font-bold tracking-tight">
              {timeLeft}s
            </span>
          </div>
          {isStarted && !isFinished && (
            <button
              type="button"
              onClick={() => {
                const exactElapsed = startTimeRef.current
                  ? (performance.now() - startTimeRef.current) / 1000
                  : (isUnlimited ? timeLeft : selectedDuration - timeLeft);
                finishTest(inputRef.current?.value || input, Math.max(1, exactElapsed));
              }}
              className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 font-mono text-[11px] font-bold shadow-md transition-all active:scale-95 cursor-pointer pointer-events-auto"
              title="Finish session and calculate score (or press Esc)"
            >
              <Square className="w-3 h-3 text-amber-400" />
              <span>Finish ({isUnlimited ? `${timeLeft}s` : `${Math.max(1, Math.round(selectedDuration - timeLeft))}s`})</span>
            </button>
          )}
        </div>

        {/* Right tools (Fullscreen + Mute) */}
        <div className="flex items-center gap-2 sm:gap-3 opacity-40 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer hidden xs:inline-block"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Center Area: ONLY the typing text */}
      <div className="w-full max-w-4xl my-auto">
        {!isFinished ? (
          <div
            ref={textContainerRef}
            className="h-36 sm:h-56 overflow-hidden font-mono text-xl xs:text-2xl sm:text-3xl lg:text-4xl leading-relaxed tracking-wide select-none text-left pointer-events-none relative z-0"
          >
            {fullText.split('').map((char, index) => {
              const typedChar = input[index];
              const isTyped = index < input.length;
              const isCurrent = index === input.length;
              const isCorrect = isTyped && typedChar === char;
              const isIncorrect = isTyped && typedChar !== char;

              let charClass = 'text-zinc-400';
              if (isCurrent) {
                charClass = 'text-amber-300 font-bold';
              } else if (isCorrect) {
                charClass = 'text-zinc-100 font-medium';
              } else if (isIncorrect) {
                charClass = 'text-rose-400 bg-rose-500/20 underline decoration-rose-500 font-medium';
              }

              return (
                <span
                  key={index}
                  ref={isCurrent ? activeCharRef : null}
                  className={`relative ${charClass}`}
                >
                  {isCurrent && (
                    <span className="absolute -left-[1.5px] top-1 bottom-1 w-[3px] rounded-full animate-pulse bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.9)] will-change-transform" />
                  )}
                  {char}
                </span>
              );
            })}
          </div>
        ) : (
          /* Finished State: Minimal results */
          <div className="relative z-30 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200 cursor-default pointer-events-auto">
            <div className="flex items-center gap-8 sm:gap-12 font-mono">
              <div>
                <div className="text-xs uppercase text-zinc-500">WPM</div>
                <div className="text-5xl sm:text-6xl font-bold text-amber-400 mt-1">{finalWpm}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-zinc-500">Accuracy</div>
                <div className="text-5xl sm:text-6xl font-bold text-emerald-400 mt-1">{finalAccuracy}%</div>
              </div>
              <div>
                <div className="text-xs uppercase text-zinc-500">Difficulty</div>
                <div className="text-base sm:text-lg font-bold text-zinc-300 mt-4 capitalize flex items-center gap-1.5 justify-center">
                  {difficulty === 'easy' && <SignalLow className="w-4 h-4 text-emerald-400" />}
                  {difficulty === 'medium' && <SignalMedium className="w-4 h-4 text-amber-400" />}
                  {difficulty === 'hard' && <SignalHigh className="w-4 h-4 text-rose-400" />}
                  <span>{difficulty}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={resetTest}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Type Again (Tab + Enter)</span>
              </button>

              <Link
                href="/test"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-wide border border-zinc-700/60 transition-all hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
              >
                <span>Full Test Mode</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold tracking-wide border border-amber-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
              >
                <span>View Profile →</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Bottom Hint */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-600">
        <SwitchIcon
          id={activePack}
          className="w-3.5 h-3.5 opacity-60"
          style={{ color: currentProfile?.color }}
        />
        <span className="opacity-50">Tab + Enter to restart • {currentProfile?.name}</span>
      </div>

    </div>
  );
}

export default function FocusClient() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#121314] flex items-center justify-center text-zinc-500 font-mono text-sm">Loading Zen Mode...</div>}>
      <FocusModeContent />
    </Suspense>
  );
}
