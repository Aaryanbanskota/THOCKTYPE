'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { generateRandomWords, generateTextByDifficulty, COMMON_WORDS } from '@/lib/word-banks';
import { analyzeBenchmark } from '@/lib/benchmark-analyzer';
import { saveTestToProfile } from '@/lib/profile-storage';
import { SoundPackId, TestResults, WpmDataPoint, DifficultyMode } from '@/types/sound';
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
  Command,
  SignalLow,
  SignalMedium,
  SignalHigh
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
  const [difficulty, setDifficulty] = useState<DifficultyMode>('easy'); // easy, medium, hard
  const [competitive, setCompetitive] = useState<boolean>(false);

  // Words & Text State
  const [words, setWords] = useState<string[]>(() => COMMON_WORDS.slice(0, 70));
  const fullText = useMemo(() => words.join(' '), [words]);

  // Typing Input State
  const [input, setInput] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

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
  const lastLineTopRef = useRef<number>(0);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const keydownSoundPlayedRef = useRef<boolean>(false);

  // High-Precision Benchmark & Hardware Physics References (performance.now())
  const startTimeRef = useRef<number | null>(null);
  const lastKeystrokeTimeRef = useRef<number | null>(null);
  const keystrokeIntervalsRef = useRef<number[]>([]);
  const totalKeypressesRef = useRef<number>(0);
  const backspaceCountRef = useRef<number>(0);
  const correctedErrorsRef = useRef<number>(0);
  const totalErrorsCommittedRef = useRef<number>(0);
  const missedKeysRef = useRef<Record<string, number>>({});

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
    const newWords = generateTextByDifficulty(difficulty, wordCount);
    setWords(newWords);
  }, [mode, duration, wordTarget, difficulty]);

  // Reset test to clean initial state
  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    startTimeRef.current = null;
    lastKeystrokeTimeRef.current = null;
    keystrokeIntervalsRef.current = [];
    totalKeypressesRef.current = 0;
    backspaceCountRef.current = 0;
    correctedErrorsRef.current = 0;
    totalErrorsCommittedRef.current = 0;
    missedKeysRef.current = {};
    lastLineTopRef.current = 0;

    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = 0;
    }

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

  // Global restart event listener from shortcuts manager (Tab+Enter, Shift+Enter)
  useEffect(() => {
    const handleRestartEvent = () => {
      resetTest();
    };
    window.addEventListener('thocktype:restart-test', handleRestartEvent);
    return () => window.removeEventListener('thocktype:restart-test', handleRestartEvent);
  }, [resetTest]);

  // Calculate live stats with high precision
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

    const minutes = Math.max(0.016, seconds / 60);
    const totalKeys = Math.max(currInput.length, totalKeypressesRef.current);
    const grossWpm = Math.round((totalKeys / 5) / minutes) || 0;
    // Standard Net WPM with uncorrected error deduction
    const netWpm = Math.max(0, Math.round(((correctChars / 5) - incorrectChars) / minutes)) || 0;
    // Real strict accuracy factoring total keystrokes pressed
    const acc = totalKeys > 0
      ? Math.max(0, Math.min(100, Math.round((correctChars / totalKeys) * 1000) / 10))
      : 100;

    setRawWpm(grossWpm);
    setWpm(netWpm);
    setAccuracy(Math.round(acc));

    return { grossWpm, netWpm, acc, correctChars, incorrectChars };
  }, [fullText]);

  // Finish the test and compute complete score
  const finishTest = useCallback((finalInput: string, fallbackSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    setIsFinished(true);

    // Exact high-precision duration using performance.now()
    const now = performance.now();
    const exactSeconds = startTimeRef.current
      ? Math.max(0.5, (now - startTimeRef.current) / 1000)
      : Math.max(1, fallbackSeconds);
    const minutes = exactSeconds / 60;

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
    const totalKeystrokes = Math.max(finalInput.length, totalKeypressesRef.current);
    const backspaceCount = backspaceCountRef.current;
    const correctedErrors = correctedErrorsRef.current;
    const totalErrorsCommitted = totalErrorsCommittedRef.current;

    // Net WPM (Monkeytype / TypeRacer standard with error penalty)
    const finalNetWpm = Math.max(0, Math.round(((correctChars / 5) - incorrectChars) / minutes)) || 0;
    // Raw WPM (Gross hand velocity)
    const finalRawWpm = Math.round((totalKeystrokes / 5) / minutes) || 0;
    // Strict Real Accuracy (to 1 decimal place)
    const finalAcc = totalKeystrokes > 0
      ? Math.max(0, Math.min(100, Math.round((correctChars / totalKeystrokes) * 1000) / 10))
      : 100;

    // Consistency calculation based on sub-millisecond keystroke intervals variance
    let consistency = 88;
    const intervals = keystrokeIntervalsRef.current;
    if (intervals.length > 5) {
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / (mean || 1);
      consistency = Math.max(35, Math.min(99, Math.round((1 - Math.min(0.85, cv / 1.5)) * 100)));
    } else if (history.length > 2) {
      const wpms = history.map(h => h.wpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(50, Math.min(100, Math.round(100 - (stdDev / (mean || 1)) * 100)));
    }

    // Top Trouble Keys (most frequently missed)
    const troubleKeys = Object.entries(missedKeysRef.current)
      .map(([char, count]) => ({ char, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Run Pure Mathematical Benchmark Analyzer (0% AI, 0% API)
    const report = analyzeBenchmark({
      netWpm: finalNetWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAcc,
      exactSeconds,
      correctChars,
      incorrectChars,
      correctedErrors,
      totalErrorsCommitted,
      backspaceCount,
      totalKeystrokes,
      consistency,
      difficulty,
      troubleKeys
    });

    const testResults: TestResults = {
      wpm: finalNetWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAcc,
      timeSpent: Math.round(exactSeconds),
      exactSeconds: Math.round(exactSeconds * 100) / 100,
      difficulty,
      correctChars,
      incorrectChars,
      extraChars,
      missedChars,
      totalKeystrokes,
      backspaceCount,
      correctedErrors,
      totalErrorsCommitted,
      consistency,
      efficiency: report.efficiency,
      kps: report.kps,
      msPerKey: report.msPerKey,
      troubleKeys,
      soundPack: activePack,
      history: [...history, { second: Math.round(exactSeconds), wpm: finalNetWpm, rawWpm: finalRawWpm, errors: incorrectChars }],
      report
    };

    setResults(testResults);

    // Save benchmark session to user's private local account (Zero Signup)
    saveTestToProfile(testResults);

    // Trigger celebration confetti if good score
    if (finalNetWpm > 25) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [fullText, activePack, history, difficulty]);

  // Main input handler with sub-millisecond precision
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    let val = e.target.value;

    // Mobile keyboard normalization: undo auto-inserted period on double space
    if (val.endsWith('. ') && !fullText.slice(0, val.length).endsWith('. ')) {
      val = val.slice(0, -2) + '  ';
    }

    // Mobile auto-capitalization normalization for easy mode
    if (val.length === 1 && difficulty === 'easy' && fullText.length > 0) {
      if (val[0].toLowerCase() === fullText[0].toLowerCase()) {
        val = val.toLowerCase();
      }
    }

    // Start timer on first keystroke
    if (!isStarted && val.length > 0) {
      setIsStarted(true);
      const start = performance.now();
      startTimeRef.current = start;
      lastKeystrokeTimeRef.current = start;

      // 100ms high-frequency timer ticker for zero drift
      timerRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const exactElapsed = (performance.now() - startTimeRef.current) / 1000;
        const roundedSec = Math.floor(exactElapsed);
        setElapsedSeconds(roundedSec);

        if (mode === 'time') {
          const remaining = Math.max(0, duration - roundedSec);
          setTimeLeft(remaining);

          if (exactElapsed >= duration) {
            finishTest(inputRef.current?.value || '', duration);
            return;
          }
        }

        // Record history snapshot every second
        const currentSec = Math.floor(exactElapsed);
        if (currentSec > 0 && currentSec !== elapsedSeconds) {
          const live = calculateLiveStats(inputRef.current?.value || '', exactElapsed);
          if (live) {
            setHistory(h => [
              ...h,
              { second: currentSec, wpm: live.netWpm, rawWpm: live.grossWpm, errors: live.incorrectChars }
            ]);
          }
        }
      }, 100);
    }

    // Keystroke analysis on character addition
    if (val.length > input.length) {
      const addedCount = val.length - input.length;
      totalKeypressesRef.current += addedCount;

      for (let i = input.length; i < val.length; i++) {
        if (val[i] !== fullText[i]) {
          totalErrorsCommittedRef.current++;
          const targetChar = fullText[i] || ' ';
          missedKeysRef.current[targetChar] = (missedKeysRef.current[targetChar] || 0) + 1;
        }
      }
    }

    // Competitive mode check: reject errors if strict
    if (competitive && val.length > input.length) {
      const lastCharIndex = val.length - 1;
      if (val[lastCharIndex] !== fullText[lastCharIndex]) {
        // Punish or highlight error
      }
    }

    // Fallback switch audio for mobile virtual keyboards where keydown doesn't pass standard key codes
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
        backspaceCountRef.current++;
        if (input.length > 0) {
          const lastCharIndex = input.length - 1;
          if (input[lastCharIndex] !== fullText[lastCharIndex]) {
            correctedErrorsRef.current++;
          }
        }
      }
    }
    keydownSoundPlayedRef.current = false;

    setInput(val);
    const currentExactElapsed = startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : 1;
    calculateLiveStats(val, currentExactElapsed);

    // Keep generating new words infinitely for time and unlimited modes:
    // When remaining untyped text drops below 140 characters, seamlessly append 60 more words!
    if ((mode === 'time' || mode === 'unlimited') && (fullText.length - val.length) < 140) {
      setWords((prev) => [...prev, ...generateTextByDifficulty(difficulty, 60)]);
    }

    // In words mode: finish when target reached
    if (mode === 'words' && val.length >= fullText.length) {
      finishTest(val, currentExactElapsed);
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

    // Keystroke Interval Physics Tracking
    const now = performance.now();
    if (lastKeystrokeTimeRef.current && isStarted) {
      const delta = now - lastKeystrokeTimeRef.current;
      if (delta > 20 && delta < 4000) {
        keystrokeIntervalsRef.current.push(delta);
      }
    }
    lastKeystrokeTimeRef.current = now;

    // Track Backspaces & Error Corrections
    if (e.key === 'Backspace') {
      backspaceCountRef.current++;
      if (input.length > 0) {
        const lastCharIndex = input.length - 1;
        if (input[lastCharIndex] !== fullText[lastCharIndex]) {
          correctedErrorsRef.current++;
        }
      }
    }

    // Play switch bottom-out sound on keydown
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

      // Global restart hotkey: Tab + Enter (or Enter directly when finished)
      if (e.key === 'Tab') {
        tabPressed = true;
      }
      if (e.key === 'Enter' && (tabPressed || isFinished)) {
        e.preventDefault();
        resetTest();
        return;
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

      // Shortcut: Esc to finish session or reset
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isStarted && !isFinished && input.length > 5) {
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

    const onRestartEvent = () => {
      resetTest();
    };

    window.addEventListener('keydown', onGlobalKeyDown);
    window.addEventListener('keyup', onGlobalKeyUp);
    window.addEventListener('thocktype:restart-test', onRestartEvent);

    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
      window.removeEventListener('keyup', onGlobalKeyUp);
      window.removeEventListener('thocktype:restart-test', onRestartEvent);
    };
  }, [resetTest, mode, isStarted, isFinished, input, elapsedSeconds, duration, activePack, setActivePack, playKey, finishTest]);

  // Line-by-line auto-scroll: smoothly rolls up finished lines so upcoming text is always visible
  useEffect(() => {
    if (!activeCharRef.current || !textContainerRef.current) return;
    const container = textContainerRef.current;
    const charEl = activeCharRef.current;

    const charTop = charEl.offsetTop;
    const charHeight = charEl.offsetHeight || 40;

    if (charTop !== lastLineTopRef.current) {
      lastLineTopRef.current = charTop;

      // Keep active line as line 2 of the viewport (or line 1 if at top)
      if (charTop > charHeight * 1.5) {
        const targetScroll = charTop - charHeight;
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      } else {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [input]);

  // Copy results summary with strict benchmark diagnostics
  const copyScore = () => {
    if (!results) return;
    const profile = SWITCH_PROFILES[results.soundPack];
    const text = `⌨️ THOCKTYPE SPEED BENCHMARK REPORT
WPM: ${results.wpm} (Raw: ${results.rawWpm})
Accuracy: ${results.accuracy}% (Strict Keystroke Audit)
Consistency: ${results.consistency}% | Time: ${results.exactSeconds.toFixed(2)}s
Difficulty: ${results.difficulty.toUpperCase()} | Tier: ${results.report?.tier || 'Verified'}
Actuation: ${results.kps} KPS (${results.msPerKey}ms/key)
Switch: ${profile?.name} (${profile?.category})
Capacity: ${results.report?.potentialHeadline || 'Practice & grow'}
Benchmark verified: ${window.location.origin}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentProfile = SWITCH_PROFILES[activePack];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center overflow-x-hidden px-1 sm:px-0">
      
      {/* Test Config Toolbar (Mode, Time / Words, Sound Switcher & Focus Mode CTA) */}
      <div className="w-full max-w-full flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 mb-6 sm:mb-8 bg-zinc-900/60 p-2 sm:p-2.5 rounded-2xl border border-zinc-800/80 backdrop-blur-sm">
        
        {/* Left Section: Mode Selector + Sub-options */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
          {/* Mode Selector (Time, Words, Unlimited) */}
          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
            <button
              type="button"
              onClick={() => { setMode('time'); resetTest(); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
        </div>

        {/* Right Section: Difficulty Mode, Switch Icon (compact, no text), Zen Focus */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 sm:gap-2">
          {/* Difficulty Mode Selector: Small icon buttons (easy, medium, hard) */}
          <div className="flex items-center bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
            {(['easy', 'medium', 'hard'] as DifficultyMode[]).map((d) => {
              const isSelected = difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? d === 'easy'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                        : d === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={`${d.toUpperCase()} mode: ${
                    d === 'easy' ? 'Clean lowercase text' : d === 'medium' ? 'Punctuation & commas' : 'Numbers, symbols & full key practice'
                  }`}
                >
                  {d === 'easy' && <SignalLow className="w-3 h-3 text-emerald-400" />}
                  {d === 'medium' && <SignalMedium className="w-3 h-3 text-amber-400" />}
                  {d === 'hard' && <SignalHigh className="w-3 h-3 text-rose-400" />}
                  <span className="text-[11px] capitalize">{d}</span>
                </button>
              );
            })}
          </div>

          {/* Active Sound Personality: Compact Icon Tile only (No text, as requested) */}
          <button
            type="button"
            onClick={() => {
              const currentIndex = PACK_IDS.indexOf(activePack);
              const nextIndex = (currentIndex + 1) % PACK_IDS.length;
              const nextPack = PACK_IDS[nextIndex];
              setActivePack(nextPack);
              playKey('KeyF', nextPack);
            }}
            className="w-8 h-8 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/60 flex items-center justify-center transition-all group cursor-pointer"
            title={`Active switch: ${currentProfile?.name} (${currentProfile?.category}) — Click to cycle sound`}
          >
            <SwitchIcon
              id={activePack}
              className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
              style={{ color: currentProfile?.color }}
            />
          </button>

          {/* Zen Focus Mode Button */}
          <a
            href={`/focus?duration=${mode === 'time' ? duration : 0}&pack=${activePack}&diff=${difficulty}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 group"
            title="Open pure Zen Focus Mode in a new tab (Shortcut: Alt + F)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden xs:inline">Zen Focus ↗</span>
          </a>
        </div>

      </div>

      {/* Main Stats Header (Directly matching user screenshot layout: WPM, Accuracy, Time) */}
      <div className="w-full flex justify-center items-center gap-6 xs:gap-10 sm:gap-16 py-3 sm:py-4 mb-3 sm:mb-4 select-none">
        
        {/* WPM */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 mb-1">
            WPM
          </span>
          <span className="text-2xl xs:text-3xl sm:text-4xl font-mono font-bold text-amber-400 tracking-tight">
            {wpm}
          </span>
        </div>

        {/* Accuracy */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 mb-1">
            Accuracy
          </span>
          <span className="text-2xl xs:text-3xl sm:text-4xl font-mono font-bold text-amber-400 tracking-tight">
            {accuracy}%
          </span>
        </div>

        {/* Time */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 mb-1">
            Time
          </span>
          <span className="text-2xl xs:text-3xl sm:text-4xl font-mono font-bold text-amber-400 tracking-tight">
            {mode === 'time' ? `${timeLeft}s` : `${elapsedSeconds}s`}
          </span>
        </div>

      </div>

      {/* Typing Surface & Words Display */}
      {!isFinished ? (
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative w-full cursor-text rounded-2xl sm:rounded-3xl bg-zinc-900/40 border border-zinc-800/80 p-4 xs:p-6 sm:p-10 shadow-2xl transition-all hover:border-zinc-700/80"
        >
          {/* Mobile Tap-To-Focus Indicator */}
          {!isStarted && !isInputFocused && (
            <div className="sm:hidden absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono text-amber-300 animate-pulse shadow-sm">
              <span>Tap to type</span>
            </div>
          )}

          {/* Real input that captures keystrokes on mobile virtual keyboard & desktop */}
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
            aria-label="Typing test input field"
          />

          {/* Rendered Text with Caret and Character States */}
          <div
            ref={textContainerRef}
            className="h-32 xs:h-36 sm:h-44 overflow-hidden font-mono text-lg xs:text-xl sm:text-2xl lg:text-[28px] leading-relaxed tracking-wide select-none text-zinc-400 pointer-events-none relative z-0"
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
                  className={`relative ${charClass}`}
                >
                  {/* Smooth Caret Cursor on Active Letter */}
                  {isCurrent && (
                    <span
                      className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] rounded-full animate-pulse bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] will-change-transform"
                    />
                  )}
                  {char}
                </span>
              );
            })}
          </div>

          {/* If unlimited mode and typing in progress: Dedicated Pause / Finish button */}
          {mode === 'unlimited' && isStarted && (
            <div className="relative z-20 mt-8 flex items-center justify-center animate-in fade-in duration-200 pointer-events-auto">
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

          {/* If time mode and typing in progress for at least 5s: Option to Finish Early */}
          {mode === 'time' && isStarted && elapsedSeconds >= 5 && (
            <div className="relative z-20 mt-8 flex items-center justify-center animate-in fade-in duration-200 pointer-events-auto">
              <button
                type="button"
                onClick={() => finishTest(inputRef.current?.value || input, elapsedSeconds || 1)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 font-mono text-xs font-semibold tracking-wide border border-zinc-700 shadow-md transition-all active:scale-95 cursor-pointer"
                title="Finish benchmark and calculate score (or press Esc)"
              >
                <Square className="w-3.5 h-3.5 text-amber-400" />
                <span>Finish Early ({elapsedSeconds}s) & Calculate Score</span>
              </button>
            </div>
          )}

          {/* Bottom Action Controls: COMPLETELY DISAPPEAR when typing starts as requested! */}
          {!isStarted && (
            <div className="relative z-20 mt-8 flex flex-col items-center gap-5 transition-all duration-200 pointer-events-auto">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={resetTest}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-md transition-all active:scale-95 cursor-pointer pointer-events-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Restart test</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompetitive(!competitive)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all active:scale-95 cursor-pointer pointer-events-auto ${
                    competitive
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 border-zinc-700/60 shadow-md'
                  }`}
                >
                  <ShieldAlert className={`w-3.5 h-3.5 ${competitive ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>Competitive: {competitive ? 'On' : 'Off'}</span>
                </button>

                <a
                  href={`/focus?duration=${mode === 'time' ? duration : 0}&pack=${activePack}&diff=${difficulty}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 text-xs font-bold tracking-wide border border-amber-500/40 shadow-md shadow-amber-500/10 transition-all hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
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
        <div className="w-full rounded-2xl sm:rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-4 xs:p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Scorecard Header & Switch Attribution */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                  Performance Diagnostics Verified
                </span>
                {results?.report?.tier && (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider border ${results.report.tierBadgeColor}`}>
                    {results.report.tier}
                  </span>
                )}
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

          {/* Target Capacity & Motivational Growth Engine */}
          {results?.report && (
            <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-950/60 to-zinc-900 border border-amber-500/30 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                    Target Capacity & Motivational Growth Projection
                  </span>
                </div>
                <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Target: {results.report.projectedWpmMin} – {results.report.projectedWpmMax} WPM
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                {results.report.potentialHeadline}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                {results.report.motivationMessage}
              </p>
            </div>
          )}

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
                Words Per Minute (Error Penalized)
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
                Strict Keystroke Audit
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
                Gross Hand Velocity
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
                Interval Variance Cadence
              </span>
            </div>

          </div>

          {/* High-Friction Target Problem Keys */}
          {results?.troubleKeys && results.troubleKeys.length > 0 && (
            <div className="py-4 border-b border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" />
                <span className="font-semibold text-zinc-300">High-Friction Problem Keys:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {results.troubleKeys.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-rose-500/40 text-zinc-100">
                      {item.char === ' ' ? '␣ Space' : item.char}
                    </kbd>
                    <span className="text-[10px] text-rose-400 font-normal">({item.count}× miss)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Harsh Technical Diagnostics Audits (Zero-Tolerance Keystroke Precision) */}
          {results?.report?.harshDiagnostics && (
            <div className="py-6 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  Harsh Diagnostic Audits (Zero-Tolerance Typing Benchmark)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.report.harshDiagnostics.map((diag, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs ${
                      diag.severity === 'critical'
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                        : diag.severity === 'warning'
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                        : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    <div className="font-bold font-mono mb-1.5 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        diag.severity === 'critical' ? 'bg-rose-400' : diag.severity === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span>{diag.title}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-300 font-sans">
                      {diag.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Stats Strip: High-Precision Physics */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 py-6 border-b border-zinc-800/80 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px] mb-1">Keystroke Accounting</span>
              <span className="text-emerald-400 font-bold">{results?.correctChars}</span> correct
              <span className="text-zinc-600 mx-1.5">/</span>
              <span className="text-rose-400 font-bold">{results?.incorrectChars}</span> uncorrected
              <div className="text-[10px] text-zinc-500 mt-1">
                +{results?.correctedErrors || 0} corrected via Backspace
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px] mb-1">High-Precision Time</span>
              <span className="text-zinc-200 font-bold text-sm">
                {results?.exactSeconds ? results.exactSeconds.toFixed(2) : results?.timeSpent}s
              </span>
              <div className="text-[10px] text-zinc-500 mt-1">
                sub-millisecond performance.now()
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px] mb-1">Actuation Dynamics</span>
              <span className="text-amber-400 font-bold">{results?.kps || 0} KPS</span>
              <span className="text-zinc-600 mx-1">•</span>
              <span className="text-zinc-300 font-bold">{results?.msPerKey || 0}ms</span>
              <div className="text-[10px] text-zinc-500 mt-1">
                Efficiency: {results?.efficiency || 100}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block text-[11px] mb-1">Correction Friction</span>
              <span className="text-zinc-200 font-bold">{results?.backspaceCount || 0}</span> backspaces
              <div className="text-[10px] text-zinc-500 mt-1">
                {results?.totalErrorsCommitted || 0} total misstrikes committed
              </div>
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
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            
            <button
              type="button"
              onClick={resetTest}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold tracking-wide shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Test (Tab + Enter)</span>
            </button>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={copyScore}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                <span>{copied ? 'Scorecard Copied!' : 'Copy Score'}</span>
              </button>

              <a
                href={`/focus?duration=${mode === 'time' ? duration : 0}&pack=${activePack}&diff=${difficulty}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span>Focus Mode</span>
              </a>

              <Link
                href="/profile"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold tracking-wide border border-amber-500/40 shadow-sm transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Profile & Growth →</span>
              </Link>

              <Link
                href="/sounds"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-md transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Sound Studio</span>
              </Link>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
