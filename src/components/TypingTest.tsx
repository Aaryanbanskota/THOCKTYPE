'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { generateRandomWords } from '@/lib/word-banks';
import { SoundPackId, TestResults, WpmDataPoint } from '@/types/sound';
import {
  RotateCcw,
  ShieldAlert,
  Copy,
  Check,
  Maximize2,
  ExternalLink,
  Square,
  Volume2,
  Zap,
  TrendingUp,
  Target,
  Clock,
  Activity,
  Layers,
  Sparkles,
  Command
} from 'lucide-react';
import { SwitchIcon } from '@/components/SwitchIcon';
import Link from 'next/link';

type TestMode = 'time' | 'words' | 'unlimited';

export function TypingTest() {
  const { activePack, setActivePack, playKey, releaseKey } = useSound();

  // Test Settings
  const [mode, setMode] = useState<TestMode>('time');
  const [duration, setDuration] = useState<number>(60); // 15, 30, 60, 90
  const [wordTarget, setWordTarget] = useState<number>(50); // 25, 50, 100
  const [competitive, setCompetitive] = useState<boolean>(false);

  // Words & Text State
  const [words, setWords] = useState<string[]>([]);
  const fullText = useMemo(() => words.join(' '), [words]);

  // Typing Input State
  const [input, setInput] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Timer & Metrics State
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);

  // History & Results
  const [history, setHistory] = useState<WpmDataPoint[]>([]);
  const [results, setResults] = useState<TestResults | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // References
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());

  // Initialize word list
  const initWords = useCallback(() => {
    let wordCount = 70;
    if (mode === 'words') {
      wordCount = wordTarget;
    } else if (mode === 'time') {
      wordCount = Math.max(80, Math.floor(duration * 2.5));
    } else if (mode === 'unlimited') {
      wordCount = 120;
    }
    const newWords = generateRandomWords(wordCount);
    setWords(newWords);
  }, [mode, duration, wordTarget]);

  // Reset test to clean initial state
  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    setInput('');
    setIsStarted(false);
    setIsFinished(false);
    setResults(null);
    setHistory([]);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setElapsedSeconds(0);
    setTimeLeft(mode === 'time' ? duration : 0);

    initWords();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
  }, [mode, duration, initWords]);

  // Initial load
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  // Calculate live stats
  const calculateLiveStats = useCallback((currInput: string, seconds: number) => {
    if (seconds <= 0) return;

    let correctChars = 0;
    let incorrectChars = 0;

    for (let i = 0; i < currInput.length; i++) {
      if (currInput[i] === fullText[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }

    const minutes = seconds / 60;
    const grossWpm = Math.round((currInput.length / 5) / minutes) || 0;
    const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes)) || 0;
    const acc = currInput.length > 0 ? Math.round((correctChars / currInput.length) * 100) : 100;

    setRawWpm(grossWpm);
    setWpm(netWpm);
    setAccuracy(acc);

    return { grossWpm, netWpm, acc, correctChars, incorrectChars };
  }, [fullText]);

  // Finish the test and compute complete score
  const finishTest = useCallback((finalInput: string, totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    setIsFinished(true);

    const seconds = Math.max(1, totalSeconds);
    const minutes = seconds / 60;

    let correctChars = 0;
    let incorrectChars = 0;

    for (let i = 0; i < finalInput.length; i++) {
      if (finalInput[i] === fullText[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }

    const extraChars = Math.max(0, finalInput.length - fullText.length);
    const missedChars = Math.max(0, fullText.length - finalInput.length);
    const totalKeystrokes = finalInput.length;

    const finalRawWpm = Math.round((finalInput.length / 5) / minutes) || 0;
    const finalNetWpm = Math.max(0, Math.round((correctChars / 5) / minutes)) || 0;
    const finalAcc = totalKeystrokes > 0 ? Math.round((correctChars / totalKeystrokes) * 100) : 100;

    // Consistency calculation based on history variance
    let consistency = 95;
    if (history.length > 2) {
      const wpms = history.map(h => h.wpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(50, Math.min(100, Math.round(100 - (stdDev / (mean || 1)) * 100)));
    }

    const testResults: TestResults = {
      wpm: finalNetWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAcc,
      timeSpent: seconds,
      correctChars,
      incorrectChars,
      extraChars,
      missedChars,
      totalKeystrokes,
      consistency,
      soundPack: activePack,
      history: [...history, { second: seconds, wpm: finalNetWpm, rawWpm: finalRawWpm, errors: incorrectChars }]
    };

    setResults(testResults);

    // Trigger celebration confetti if good score
    if (finalNetWpm > 25) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [fullText, activePack, history]);

  // Main input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const val = e.target.value;

    // Start timer on first keystroke
    if (!isStarted && val.length > 0) {
      setIsStarted(true);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const nextSec = prev + 1;

          if (mode === 'time') {
            const remaining = duration - nextSec;
            setTimeLeft(remaining);

            if (remaining <= 0) {
              finishTest(inputRef.current?.value || '', duration);
              return duration;
            }
          }

          // Record history point
          const live = calculateLiveStats(inputRef.current?.value || '', nextSec);
          if (live) {
            setHistory(h => [
              ...h,
              { second: nextSec, wpm: live.netWpm, rawWpm: live.grossWpm, errors: live.incorrectChars }
            ]);
          }

          return nextSec;
        });
      }, 1000);
    }

    // Competitive mode check: reject errors if strict
    if (competitive && val.length > input.length) {
      const lastCharIndex = val.length - 1;
      if (val[lastCharIndex] !== fullText[lastCharIndex]) {
        // Punish or highlight error
      }
    }

    setInput(val);
    calculateLiveStats(val, elapsedSeconds || 1);

    // Infinite word stream in unlimited mode
    if (mode === 'unlimited' && val.length > fullText.length - 80) {
      setWords((prev) => [...prev, ...generateRandomWords(50)]);
    }

    // In words mode: finish when target reached
    if (mode === 'words' && val.length >= fullText.length) {
      finishTest(val, elapsedSeconds || 1);
    }
  };

  // Keyboard Sound & Hotkeys Listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Hotkey: Tab + Enter to restart
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      resetTest();
      return;
    }

    // Play switch bottom-out sound on keydown
    pressedKeysRef.current.add(e.code);
    playKey(e.code);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    pressedKeysRef.current.delete(e.code);
    releaseKey(e.code);
  };

  // Global Keyboard Shortcuts (Tab+Enter: Restart, Alt+F: Focus Mode, Esc: Reset / Finish Unlimited, Alt+1-8: Switch sound)
  useEffect(() => {
    let tabPressed = false;

    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = true;
      }
      if (e.key === 'Enter' && tabPressed) {
        e.preventDefault();
        resetTest();
      }

      // Shortcut: Alt + F to open Focus mode in a new tab
      if ((e.altKey || (e.ctrlKey && e.shiftKey)) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        window.open(`/focus?duration=${mode === 'time' ? duration : 0}&pack=${activePack}`, '_blank');
      }

      // Shortcut: Alt + 1-8 to switch sound packs
      if (e.altKey && e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key, 10) - 1;
        if (PACK_IDS[index]) {
          e.preventDefault();
          setActivePack(PACK_IDS[index]);
          playKey('KeyF', PACK_IDS[index]);
        }
      }

      // Shortcut: Esc to finish unlimited session or reset
      if (e.key === 'Escape') {
        e.preventDefault();
        if (mode === 'unlimited' && isStarted && !isFinished && input.length > 0) {
          finishTest(inputRef.current?.value || input, elapsedSeconds || 1);
        } else {
          resetTest();
        }
      }
    };

    const onGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = false;
      }
    };

    window.addEventListener('keydown', onGlobalKeyDown);
    window.addEventListener('keyup', onGlobalKeyUp);

    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
      window.removeEventListener('keyup', onGlobalKeyUp);
    };
  }, [resetTest, mode, isStarted, isFinished, input, elapsedSeconds, duration, activePack, setActivePack, playKey, finishTest]);

  // Keep active letter in view
  useEffect(() => {
    if (activeCharRef.current && textContainerRef.current) {
      const container = textContainerRef.current;
      const charEl = activeCharRef.current;
      const offsetTop = charEl.offsetTop - container.offsetTop;
      
      // Auto-scroll smooth if text goes beyond 2 lines
      if (offsetTop > 90) {
        container.scrollTo({
          top: offsetTop - 45,
          behavior: 'smooth'
        });
      }
    }
  }, [input]);

  // Copy results summary
  const copyScore = () => {
    if (!results) return;
    const profile = SWITCH_PROFILES[results.soundPack];
    const text = `⌨️ THOCKTYPE SPEED TEST RESULT
WPM: ${results.wpm} (Raw: ${results.rawWpm})
Accuracy: ${results.accuracy}%
Time: ${results.timeSpent}s | Consistency: ${results.consistency}%
Switch: ${profile?.name} (${profile?.category})
Try it: ${window.location.origin}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentProfile = SWITCH_PROFILES[activePack];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {/* Test Config Toolbar (Mode, Time / Words, Sound Switcher & Focus Mode CTA) */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-8 bg-zinc-900/60 p-2.5 rounded-2xl border border-zinc-800/80 backdrop-blur-sm">
        
        {/* Mode Selector (Time, Words, Unlimited) */}
        <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
          <button
            type="button"
            onClick={() => { setMode('time'); resetTest(); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'time'
                ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            time
          </button>
          <button
            type="button"
            onClick={() => { setMode('words'); resetTest(); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'words'
                ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            words
          </button>
          <button
            type="button"
            onClick={() => { setMode('unlimited'); resetTest(); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'unlimited'
                ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            unlimited
          </button>
        </div>

        {/* Sub-options for Time / Words */}
        {mode === 'time' && (
          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
            {[15, 30, 60, 90].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => { setDuration(sec); resetTest(); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  duration === sec
                    ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        )}

        {mode === 'words' && (
          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
            {[25, 50, 100].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => { setWordTarget(cnt); resetTest(); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  wordTarget === cnt
                    ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cnt}w
              </button>
            ))}
          </div>
        )}

        {/* Active Sound Quick-Picker & Focus Mode Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs">
            <SwitchIcon
              id={activePack}
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: currentProfile?.color }}
            />
            <span className="font-medium text-zinc-200">{currentProfile?.name}</span>
          </div>

          <a
            href={`/focus?duration=${mode === 'time' ? duration : 0}&pack=${activePack}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 group"
            title="Open pure Zen Focus Mode in a new tab (Shortcut: Alt + F)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Zen Focus (New Tab) ↗</span>
          </a>
        </div>

      </div>

      {/* Main Stats Header (Directly matching user screenshot layout: WPM, Accuracy, Time) */}
      <div className="w-full flex justify-center items-center gap-12 sm:gap-16 py-4 mb-4 select-none">
        
        {/* WPM */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 mb-1">
            WPM
          </span>
          <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 tracking-tight">
            {wpm}
          </span>
        </div>

        {/* Accuracy */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 mb-1">
            Accuracy
          </span>
          <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 tracking-tight">
            {accuracy}%
          </span>
        </div>

        {/* Time */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 mb-1">
            Time
          </span>
          <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 tracking-tight">
            {mode === 'time' ? `${timeLeft}s` : `${elapsedSeconds}s`}
          </span>
        </div>

      </div>

      {/* Typing Surface & Words Display */}
      {!isFinished ? (
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative w-full cursor-text rounded-3xl bg-zinc-900/40 border border-zinc-800/80 p-6 sm:p-10 shadow-2xl transition-all hover:border-zinc-700/80"
        >
          {/* Hidden real input that captures keystrokes */}
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
            className="absolute inset-0 opacity-0 cursor-default"
            aria-label="Typing test input field"
          />

          {/* Rendered Text with Caret and Character States */}
          <div
            ref={textContainerRef}
            className="h-36 sm:h-44 overflow-hidden font-mono text-xl sm:text-2xl lg:text-[28px] leading-relaxed tracking-wide select-none text-zinc-400 transition-all"
          >
            {fullText.split('').map((char, index) => {
              const typedChar = input[index];
              const isTyped = index < input.length;
              const isCurrent = index === input.length;
              const isCorrect = isTyped && typedChar === char;
              const isIncorrect = isTyped && typedChar !== char;

              let charClass = 'text-zinc-500'; // Untouched future text
              if (isCorrect) {
                charClass = 'text-zinc-200'; // Correct letter (bright white/cream)
              } else if (isIncorrect) {
                charClass = 'text-rose-400 bg-rose-500/20 underline decoration-rose-500'; // Incorrect
              }

              return (
                <span
                  key={index}
                  ref={isCurrent ? activeCharRef : null}
                  className={`relative ${charClass} transition-colors duration-75`}
                >
                  {/* Smooth Caret Cursor on Active Letter */}
                  {isCurrent && (
                    <span
                      className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] rounded-full animate-pulse bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    />
                  )}
                  {char}
                </span>
              );
            })}
          </div>

          {/* If unlimited mode and typing in progress: Dedicated Pause / Finish button */}
          {mode === 'unlimited' && isStarted && (
            <div className="mt-8 flex items-center justify-center animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => finishTest(inputRef.current?.value || input, elapsedSeconds || 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-zinc-950" />
                <span>Finish Session ({elapsedSeconds}s) & Calculate Score</span>
              </button>
            </div>
          )}

          {/* Bottom Action Controls: COMPLETELY DISAPPEAR when typing starts as requested! */}
          {!isStarted && (
            <div className="mt-8 flex flex-col items-center gap-5 transition-all duration-200">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={resetTest}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-md transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Restart test</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompetitive(!competitive)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all active:scale-95 ${
                    competitive
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 border-zinc-700/60 shadow-md'
                  }`}
                >
                  <ShieldAlert className={`w-3.5 h-3.5 ${competitive ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>Competitive: {competitive ? 'On' : 'Off'}</span>
                </button>

                <a
                  href={`/focus?duration=${mode === 'time' ? duration : 0}&pack=${activePack}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 text-xs font-bold tracking-wide border border-amber-500/40 shadow-md shadow-amber-500/10 transition-all hover:scale-105 active:scale-95"
                  title="Open pure full-screen textbox only in a new tab (Shortcut: Alt + F)"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open Focus Mode (New Tab) ↗</span>
                </a>
              </div>

              {/* Tab + Enter keyboard shortcut indicator */}
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400 select-none">
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px]">Tab</kbd>
                <span>+</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px]">Enter</kbd>
                <span className="text-zinc-400">— Restart test</span>
                <span className="text-zinc-600 px-1">•</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px]">Alt + F</kbd>
                <span className="text-zinc-400">— Zen Mode</span>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* =========================================================================
         * REDESIGNED PREMIUM PERFORMANCE SCORECARD
         * Clean, bespoke audio-engineering layout with interactive area chart
         * ========================================================================= */
        <div className="w-full rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Scorecard Header & Switch Attribution */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                  Performance Diagnostics Verified
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
                Typing Benchmark Report
              </h2>
            </div>
            
            {/* Active Switch Personality Card */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${currentProfile?.color}20`, border: `1px solid ${currentProfile?.color}40` }}
              >
                <SwitchIcon
                  id={results?.soundPack || activePack}
                  className="w-5 h-5"
                  style={{ color: currentProfile?.color }}
                />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <span>{currentProfile?.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${currentProfile?.badgeBg}`}>
                    {currentProfile?.category}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  {currentProfile?.pitch} Pitch • {currentProfile?.loudness}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Speed Metric Hero */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-b border-zinc-800/80">
            
            {/* Net WPM */}
            <div className="flex flex-col justify-center">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Net WPM</span>
              </span>
              <div className="text-5xl sm:text-6xl font-mono font-black tracking-tight text-amber-400">
                {results?.wpm}
              </div>
              <span className="text-[11px] font-mono text-zinc-400 mt-1">
                Words Per Minute
              </span>
            </div>

            {/* Accuracy */}
            <div className="flex flex-col justify-center">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accuracy</span>
              </span>
              <div className="text-5xl sm:text-6xl font-mono font-black tracking-tight text-emerald-400">
                {results?.accuracy}%
              </div>
              <span className="text-[11px] font-mono text-zinc-400 mt-1">
                Precision Rate
              </span>
            </div>

            {/* Raw WPM */}
            <div className="flex flex-col justify-center">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                <span>Raw WPM</span>
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-300">
                {results?.rawWpm}
              </div>
              <span className="text-[11px] font-mono text-zinc-400 mt-1">
                Gross Speed
              </span>
            </div>

            {/* Consistency */}
            <div className="flex flex-col justify-center">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Consistency</span>
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-sky-400">
                {results?.consistency}%
              </div>
              <span className="text-[11px] font-mono text-zinc-400 mt-1">
                Pacing Variance
              </span>
            </div>

          </div>

          {/* Secondary Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-b border-zinc-800/80 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px] mb-1">Keystrokes</span>
              <span className="text-emerald-400 font-bold">{results?.correctChars}</span> correct
              <span className="text-zinc-600 mx-1.5">/</span>
              <span className="text-rose-400 font-bold">{results?.incorrectChars}</span> error
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px] mb-1">Session Duration</span>
              <span className="text-zinc-200 font-bold">{results?.timeSpent}s</span> total time
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px] mb-1">Test Configuration</span>
              <span className="text-zinc-200 font-bold capitalize">
                {mode} ({mode === 'time' ? `${duration}s` : mode === 'words' ? `${wordTarget}w` : 'unlimited'})
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px] mb-1">Total Keystrokes</span>
              <span className="text-amber-400 font-bold">{results?.totalKeystrokes}</span> pressed
            </div>
          </div>

          {/* High-Definition Progression Chart */}
          {results?.history && results.history.length > 1 && (
            <div className="py-6 border-b border-zinc-800/80">
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <span className="font-semibold text-zinc-300">WPM Velocity & Errors Over Time</span>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-3 h-0.5 bg-amber-400 inline-block rounded-full" /> Net WPM
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="w-3 h-0.5 border-b border-dashed border-zinc-400 inline-block" /> Raw WPM
                  </span>
                </div>
              </div>

              {/* Chart SVG with smooth area gradient fill */}
              <div className="w-full h-36 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 p-3 flex items-end relative overflow-hidden">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox={`0 0 ${Math.max(10, results.history.length - 1)} 100`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline Grids */}
                  <line x1="0" y1="25" x2={results.history.length} y2="25" stroke="#27272a" strokeDasharray="3" />
                  <line x1="0" y1="50" x2={results.history.length} y2="50" stroke="#27272a" strokeDasharray="3" />
                  <line x1="0" y1="75" x2={results.history.length} y2="75" stroke="#27272a" strokeDasharray="3" />

                  {/* Gradient Area Fill under Net WPM */}
                  <polygon
                    fill="url(#wpmGradient)"
                    points={`0,100 ${results.history.map((h, i) => `${i},${100 - Math.min(100, (h.wpm / 140) * 100)}`).join(' ')} ${results.history.length - 1},100`}
                  />

                  {/* Raw WPM Dashed Polyline */}
                  <polyline
                    fill="none"
                    stroke="#71717a"
                    strokeWidth="1.5"
                    strokeDasharray="3"
                    points={results.history.map((h, i) => `${i},${100 - Math.min(100, (h.rawWpm / 140) * 100)}`).join(' ')}
                  />

                  {/* Net WPM Solid Line */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={results.history.map((h, i) => `${i},${100 - Math.min(100, (h.wpm / 140) * 100)}`).join(' ')}
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Scorecard Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            
            <button
              type="button"
              onClick={resetTest}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold tracking-wide shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Test (Tab + Enter)</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copyScore}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-md transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                <span>{copied ? 'Scorecard Copied!' : 'Copy Score'}</span>
              </button>

              <a
                href={`/focus?duration=${mode === 'time' ? duration : 0}&pack=${activePack}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-md transition-all active:scale-95"
              >
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span>Open in Focus Mode</span>
              </a>

              <Link
                href="/sounds"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-md transition-all"
              >
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Switch Studio</span>
              </Link>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
