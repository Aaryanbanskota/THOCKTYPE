'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { generateRandomWords, generateTextByDifficulty } from '@/lib/word-banks';
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
  const [words, setWords] = useState<string[]>([]);
  const fullText = useMemo(() => words.join(' '), [words]);

  const [input, setInput] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Results
  const [finalWpm, setFinalWpm] = useState<number>(0);
  const [finalAccuracy, setFinalAccuracy] = useState<number>(100);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());

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

  // Finish test
  const finishTest = useCallback((finalInput: string, seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsFinished(true);

    const safeSecs = Math.max(1, seconds);
    const minutes = safeSecs / 60;
    let correctChars = 0;
    for (let i = 0; i < finalInput.length; i++) {
      if (finalInput[i] === fullText[i]) correctChars++;
    }

    const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes)) || 0;
    const acc = finalInput.length > 0 ? Math.round((correctChars / finalInput.length) * 100) : 100;

    setFinalWpm(netWpm);
    setFinalAccuracy(acc);
  }, [fullText]);

  // Handle Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const val = e.target.value;

    if (!isStarted && val.length > 0) {
      setIsStarted(true);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (isUnlimited) {
            return prev + 1;
          } else {
            const next = prev - 1;
            if (next <= 0) {
              finishTest(inputRef.current?.value || '', selectedDuration);
              return 0;
            }
            return next;
          }
        });
      }, 1000);
    }

    setInput(val);

    // Continuous word streaming for unlimited mode
    if (isUnlimited && val.length > fullText.length - 80) {
      setWords((prev) => [...prev, ...generateTextByDifficulty(difficulty, 50)]);
    }

    // Words mode completion
    if (selectedMode === 'words' && val.length >= fullText.length) {
      finishTest(val, timeLeft);
    }

    // Time mode completion handled by timer
  };

  // Keyboard sounds
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      resetTest();
      return;
    }
    pressedKeysRef.current.add(e.code);
    playKey(e.code);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    pressedKeysRef.current.delete(e.code);
    releaseKey(e.code);
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
      if (e.key === 'Enter' && tabDown) {
        e.preventDefault();
        resetTest();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isUnlimited && isStarted && !isFinished && input.length > 0) {
          finishTest(inputRef.current?.value || input, timeLeft);
        } else {
          resetTest();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') tabDown = false;
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [resetTest, isConfigured, isUnlimited, isStarted, isFinished, input, timeLeft, finishTest]);

  // Auto-scroll smooth
  useEffect(() => {
    if (activeCharRef.current && textContainerRef.current) {
      const container = textContainerRef.current;
      const charEl = activeCharRef.current;
      const offsetTop = charEl.offsetTop - container.offsetTop;
      if (offsetTop > 90) {
        container.scrollTo({ top: offsetTop - 45, behavior: 'smooth' });
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
      <div className="fixed inset-0 w-full h-full bg-[#121314] text-zinc-100 flex flex-col items-center justify-center p-6 select-none overflow-y-auto">
        <div className="w-full max-w-lg p-7 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          
          <div className="flex items-center justify-between pb-5 border-b border-zinc-800">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Zen Focus Setup
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight mt-0.5">
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
              onClick={() => setIsConfigured(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all active:scale-98"
            >
              <Flame className="w-4 h-4 fill-zinc-950" />
              <span>Enter Zen Focus Mode (Press Enter)</span>
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
      onClick={() => inputRef.current?.focus()}
      className="fixed inset-0 w-full h-full bg-[#121314] text-zinc-100 flex flex-col items-center justify-between p-6 sm:p-12 select-none overflow-hidden cursor-text"
    >
      {/* Hidden input capturing typing */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        autoFocus
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="absolute inset-0 opacity-0 pointer-events-none"
        aria-label="Zen typing input"
      />

      {/* Top Floating Controls: Minimal Timer & Discreet controls */}
      <div className="w-full flex items-center justify-between text-zinc-500 text-xs">
        {/* Subtle Back link */}
        <Link
          href="/test"
          className="flex items-center gap-1.5 opacity-40 hover:opacity-100 text-zinc-400 hover:text-zinc-100 transition-opacity"
          title="Exit Zen Mode to standard test"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-xs hidden sm:inline">Exit Zen</span>
        </Link>

        {/* Minimal Timer strictly centered at top */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-3xl sm:text-4xl font-bold text-amber-400 tracking-tight">
            {timeLeft}s
          </span>
          {isUnlimited && isStarted && !isFinished && (
            <button
              type="button"
              onClick={() => finishTest(inputRef.current?.value || input, timeLeft)}
              className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-[11px] font-bold shadow-md transition-all active:scale-95 animate-pulse hover:animate-none cursor-pointer"
            >
              <Square className="w-3 h-3 fill-zinc-950" />
              <span>Finish ({timeLeft}s) & See Score</span>
            </button>
          )}
        </div>

        {/* Right tools (Fullscreen + Mute) */}
        <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
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
            className="h-44 sm:h-56 overflow-hidden font-mono text-2xl sm:text-3xl lg:text-4xl leading-relaxed tracking-wide select-none text-zinc-500 transition-all text-left"
          >
            {fullText.split('').map((char, index) => {
              const typedChar = input[index];
              const isTyped = index < input.length;
              const isCurrent = index === input.length;
              const isCorrect = isTyped && typedChar === char;
              const isIncorrect = isTyped && typedChar !== char;

              let charClass = 'text-zinc-600';
              if (isCorrect) {
                charClass = 'text-zinc-100';
              } else if (isIncorrect) {
                charClass = 'text-rose-400 underline decoration-rose-500';
              }

              return (
                <span
                  key={index}
                  ref={isCurrent ? activeCharRef : null}
                  className={`relative ${charClass} transition-colors duration-75`}
                >
                  {isCurrent && (
                    <span className="absolute -left-[1.5px] top-1 bottom-1 w-[3px] rounded-full animate-pulse bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
                  )}
                  {char}
                </span>
              );
            })}
          </div>
        ) : (
          /* Finished State: Minimal results */
          <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide shadow-lg transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Type Again (Tab + Enter)</span>
              </button>

              <Link
                href="/test"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-wide border border-zinc-700/60 transition-all"
              >
                <span>Full Test Mode</span>
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

export default function FocusModePage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#121314] flex items-center justify-center text-zinc-500 font-mono text-sm">Loading Zen Mode...</div>}>
      <FocusModeContent />
    </Suspense>
  );
}
