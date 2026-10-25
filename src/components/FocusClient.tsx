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
  SignalHigh
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
      <div className="fixed inset-0 w-full h-[100dvh] bg-[#121314] text-zinc-100 flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 select-none overflow-y-auto">
        <div className="w-full max-w-lg p-5 xs:p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 my-auto">
          
          <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-zinc-800">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Zen Focus Setup
              </span>
              <h2 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight mt-0.5">
                Configure Your Session
              </h2>
            </div>
            <Link
              href="/test"
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300"
            >
              Exit to Standard
            </Link>
          </div>

          {/* 1. Mode Selection (Time, Words, Unlimited) */}
          <div className="mt-6 space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
              1. Choose Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['time', 'words', 'unlimited'] as FocusModeType[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMode(m)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold capitalize transition-all ${
                    selectedMode === m
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Sub-options for Time / Words */}
            {selectedMode === 'time' && (
              <div className="grid grid-cols-4 gap-2 pt-1.5">
                {[15, 30, 60, 90].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedDuration(s)}
                    className={`py-1.5 rounded-lg text-xs font-mono transition-all ${
                      selectedDuration === s
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}

            {selectedMode === 'words' && (
              <div className="grid grid-cols-3 gap-2 pt-1.5">
                {[25, 50, 100].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWords(w)}
                    className={`py-1.5 rounded-lg text-xs font-mono transition-all ${
                      selectedWords === w
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {w}w
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Difficulty Mode Selection */}
          <div className="mt-6 space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
              2. Choose Practice Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as DifficultyMode[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    difficulty === d
                      ? d === 'easy'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm font-bold'
                        : d === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm font-bold'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm font-bold'
                      : 'bg-zinc-950/60 hover:bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {d === 'easy' && <SignalLow className="w-3.5 h-3.5 text-emerald-400" />}
                    {d === 'medium' && <SignalMedium className="w-3.5 h-3.5 text-amber-400" />}
                    {d === 'hard' && <SignalHigh className="w-3.5 h-3.5 text-rose-400" />}
                    <span className="text-xs font-mono capitalize">{d}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 leading-tight">
                    {d === 'easy' ? 'Plain words' : d === 'medium' ? 'Commas & text' : 'Full key workout'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Switch Personality Selection */}
          <div className="mt-6 space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
              3. Select Mechanical Switch Sound
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-100 border-amber-500/50 ring-1 ring-amber-500/40 shadow-sm'
                        : 'bg-zinc-950/60 hover:bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <SwitchIcon
                      id={id}
                      className="w-3.5 h-3.5 mb-1 shrink-0"
                      style={{ color: pack.color }}
                    />
                    <span className="text-[11px] font-semibold truncate w-full">
                      {pack.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      {pack.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Launch Zen Session Action Button */}
          <div className="mt-8 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsConfigured(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all active:scale-98 cursor-pointer"
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
