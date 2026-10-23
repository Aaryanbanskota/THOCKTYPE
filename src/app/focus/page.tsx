'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES } from '@/lib/sound-profiles';
import { generateRandomWords } from '@/lib/word-banks';
import { SoundPackId } from '@/types/sound';
import { Maximize2, Minimize2, RotateCcw, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

function FocusModeContent() {
  const searchParams = useSearchParams();
  const { activePack, setActivePack, playKey, releaseKey, isMuted, toggleMute, volume } = useSound();

  // Settings from query params or defaults
  const paramDuration = searchParams.get('duration');
  const paramPack = searchParams.get('pack') as SoundPackId | null;

  const initialDuration = paramDuration ? parseInt(paramDuration, 10) : 60;
  const isUnlimited = initialDuration === 0;

  const [timeLeft, setTimeLeft] = useState<number>(isUnlimited ? 0 : initialDuration);
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
    const count = isUnlimited ? 200 : Math.max(100, Math.floor(initialDuration * 3));
    setWords(generateRandomWords(count));
  }, [isUnlimited, initialDuration]);

  // Reset test
  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    setInput('');
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(isUnlimited ? 0 : initialDuration);
    setFinalWpm(0);
    setFinalAccuracy(100);
    initWords();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [isUnlimited, initialDuration, initWords]);

  useEffect(() => {
    resetTest();
  }, [resetTest]);

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
              finishTest(inputRef.current?.value || '', initialDuration);
              return 0;
            }
            return next;
          }
        });
      }, 1000);
    }

    setInput(val);

    if (val.length >= fullText.length) {
      finishTest(val, isUnlimited ? timeLeft : initialDuration - timeLeft);
    }
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

  // Global key bindings (Tab + Enter, Esc)
  useEffect(() => {
    let tabDown = false;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') tabDown = true;
      if (e.key === 'Enter' && tabDown) {
        e.preventDefault();
        resetTest();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        resetTest();
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
  }, [resetTest]);

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
            <div className="flex items-center gap-12 font-mono">
              <div>
                <div className="text-xs uppercase text-zinc-500">WPM</div>
                <div className="text-5xl sm:text-6xl font-bold text-amber-400 mt-1">{finalWpm}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-zinc-500">Accuracy</div>
                <div className="text-5xl sm:text-6xl font-bold text-emerald-400 mt-1">{finalAccuracy}%</div>
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
      <div className="text-xs font-mono text-zinc-600">
        <span className="opacity-40">Tab + Enter to restart • Switch: {currentProfile?.name}</span>
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
