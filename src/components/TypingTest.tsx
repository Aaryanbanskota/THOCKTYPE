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
  VolumeX,
  Zap,
  TrendingUp,
  Target,
  Clock,
  Activity,
  Layers,
  Command,
  SignalLow,
  SignalMedium,
  SignalHigh,
  FileText,
  Eye,
  EyeOff,
  Type,
  ChevronDown,
  X,
  Play,
  Sliders
} from 'lucide-react';
import { SwitchIcon } from '@/components/SwitchIcon';
import Link from 'next/link';
import { PRESET_PASSAGES, sanitizeCustomText, PresetPassage } from '@/lib/word-banks';

export type TestMode = 'time' | 'words' | 'unlimited' | 'custom';

export interface TypingTestProps {
  initialMode?: TestMode;
}

interface SplinePoint {
  x: number;
  y: number;
}

/**
 * Computes a smooth cubic bezier SVG path across an array of coordinate points.
 * Creates continuous curved wave splines matching high-end acoustic benchmarking graphs.
 */
function getCubicBezierPath(points: SplinePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function TypingTest({ initialMode = 'time' }: TypingTestProps) {
  const {
    activePack,
    setActivePack,
    playKey,
    releaseKey,
    volume,
    setVolume,
    isMuted,
    toggleMute
  } = useSound();

  // Test Settings
  const [mode, setMode] = useState<TestMode>(initialMode);
  const [duration, setDuration] = useState<number>(60); // 15, 30, 60, 90
  const [wordTarget, setWordTarget] = useState<number>(50); // 25, 50, 100
  const [difficulty, setDifficulty] = useState<DifficultyMode>('easy'); // easy, medium, hard
  const [competitive, setCompetitive] = useState<boolean>(false);

  // Custom Text Mode State
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [customRawInput, setCustomRawInput] = useState<string>('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  // User Experience Settings
  const [hideLiveWpm, setHideLiveWpm] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isSwitchPickerOpen, setIsSwitchPickerOpen] = useState<boolean>(false);
  const [isVolumePickerOpen, setIsVolumePickerOpen] = useState<boolean>(false);

  // Benchmark Settings & Visual Controls (Matching screenshot layout)
  const [highlightStyle, setHighlightStyle] = useState<'character' | 'word' | 'caret'>('character');
  const [highlightInputOnError, setHighlightInputOnError] = useState<boolean>(true);
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [hasPunctuation, setHasPunctuation] = useState<boolean>(false);
  const [hasNumbers, setHasNumbers] = useState<boolean>(false);
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [showDiagnosticsDetail, setShowDiagnosticsDetail] = useState<boolean>(true);

  // Exact Error Timestamps
  const errorTimestampsRef = useRef<number[]>([]);

  const switchPickerRef = useRef<HTMLDivElement | null>(null);
  const volumePickerRef = useRef<HTMLDivElement | null>(null);

  // Words & Text State
  const [words, setWords] = useState<string[]>(() => COMMON_WORDS.slice(0, 70));
  const fullText = useMemo(() => words.join(' '), [words]);

  // Typing Input State
  const [input, setInput] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  // Timer & Metrics State
  const [timeLeft, setTimeLeft] = useState<number>(initialMode === 'unlimited' ? 0 : 60);
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

  // Keep live refs for hotkeys and custom event handlers
  const durationRef = useRef<number>(duration);
  durationRef.current = duration;
  const modeRef = useRef<TestMode>(mode);
  modeRef.current = mode;
  const difficultyRef = useRef<DifficultyMode>(difficulty);
  difficultyRef.current = difficulty;
  const wordTargetRef = useRef<number>(wordTarget);
  wordTargetRef.current = wordTarget;

  // Initialize word list with optional overrides for immediate synchronous changes
  const initWords = useCallback((
    overrideMode?: TestMode,
    overrideDuration?: number,
    overrideWordTarget?: number,
    overrideDiff?: DifficultyMode
  ) => {
    const activeM = overrideMode ?? mode;
    const activeD = overrideDuration ?? duration;
    const activeWT = overrideWordTarget ?? wordTarget;
    const activeDifficulty = overrideDiff ?? difficulty;

    if (activeM === 'custom') {
      if (customWords.length > 0) {
        setWords(customWords);
        return;
      } else {
        const defaultPreset = sanitizeCustomText(PRESET_PASSAGES[0].text);
        setCustomWords(defaultPreset);
        setWords(defaultPreset);
        return;
      }
    }

    let wordCount = 70;
    if (activeM === 'words') {
      wordCount = activeWT;
    } else if (activeM === 'time') {
      wordCount = Math.max(80, Math.floor(activeD * 2.5));
    } else if (activeM === 'unlimited') {
      wordCount = 120;
    }

    let activeDiff = activeDifficulty;
    if (hasNumbers) {
      activeDiff = 'hard';
    } else if (hasPunctuation) {
      activeDiff = 'medium';
    }

    const newWords = generateTextByDifficulty(activeDiff, wordCount);
    setWords(newWords);
  }, [mode, duration, wordTarget, difficulty, customWords, hasNumbers, hasPunctuation]);

  // Close toolbar menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switchPickerRef.current && !switchPickerRef.current.contains(event.target as Node)) {
        setIsSwitchPickerOpen(false);
      }
      if (volumePickerRef.current && !volumePickerRef.current.contains(event.target as Node)) {
        setIsVolumePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset test to clean initial state with optional immediate parameter overrides
  const resetTest = useCallback((
    overrideDuration?: number,
    overrideMode?: TestMode,
    overrideDiff?: DifficultyMode,
    overrideWordTarget?: number
  ) => {
    const activeD = overrideDuration ?? duration;
    const activeM = overrideMode ?? mode;
    const activeDiff = overrideDiff ?? difficulty;
    const activeWT = overrideWordTarget ?? wordTarget;

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
    errorTimestampsRef.current = [];
    setHoveredChartIndex(null);
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
    setTimeLeft(activeM === 'time' ? activeD : 0);

    initWords(activeM, activeD, activeWT, activeDiff);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
  }, [mode, duration, difficulty, wordTarget, initWords]);

  // Initial focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      errorTimestamps: [...errorTimestampsRef.current],
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
          const currentSec = startTimeRef.current
            ? Math.max(0.5, (performance.now() - startTimeRef.current) / 1000)
            : elapsedSeconds;
          errorTimestampsRef.current.push(Math.round(currentSec * 10) / 10);
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

    // In words or custom mode: finish when target reached
    if ((mode === 'words' || mode === 'custom') && val.length >= fullText.length) {
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

  // Keyboard Shortcuts & Event Listeners
  useEffect(() => {
    let tabPressed = false;

    const onGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. Tab + Enter: Instant Restart
      if (e.key === 'Tab') {
        tabPressed = true;
      }
      if (e.key === 'Enter' && (tabPressed || isFinished)) {
        e.preventDefault();
        resetTest();
        return;
      }

      // 2. Alt + S: Cycle Duration (15s -> 30s -> 60s -> 90s)
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const DURATIONS = [15, 30, 60, 90];
        const curDur = durationRef.current;
        const curIdx = DURATIONS.indexOf(curDur);
        const nextDur = DURATIONS[(curIdx + 1) % DURATIONS.length];
        durationRef.current = nextDur;
        modeRef.current = 'time';
        setDuration(nextDur);
        setMode('time');
        resetTest(nextDur, 'time');
        window.dispatchEvent(new CustomEvent('thocktype:hud', {
          detail: { message: `Duration: ${nextDur}s`, subtext: 'Alt + S / Quick Cycle' }
        }));
        return;
      }

      // 3. Alt + T: Switch to Time Mode
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        modeRef.current = 'time';
        setMode('time');
        resetTest(durationRef.current, 'time');
        window.dispatchEvent(new CustomEvent('thocktype:hud', {
          detail: { message: `Mode: Time (${durationRef.current}s)`, subtext: 'Alt + T' }
        }));
        return;
      }

      // 4. Alt + W: Switch to Words Mode
      if (e.altKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        modeRef.current = 'words';
        setMode('words');
        resetTest(durationRef.current, 'words');
        window.dispatchEvent(new CustomEvent('thocktype:hud', {
          detail: { message: `Mode: Word Target (${wordTargetRef.current}w)`, subtext: 'Alt + W' }
        }));
        return;
      }

      // 5. Alt + U: Switch to Unlimited Mode
      if (e.altKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        modeRef.current = 'unlimited';
        setMode('unlimited');
        resetTest(durationRef.current, 'unlimited');
        window.dispatchEvent(new CustomEvent('thocktype:hud', {
          detail: { message: 'Mode: Unlimited Stream', subtext: 'Alt + U' }
        }));
        return;
      }

      // 6. Alt + C: Switch to Custom Passage Mode
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        modeRef.current = 'custom';
        setMode('custom');
        setIsCustomModalOpen(true);
        window.dispatchEvent(new CustomEvent('thocktype:hud', {
          detail: { message: 'Mode: Custom Passage', subtext: 'Alt + C' }
        }));
        return;
      }

      // 7. Alt + F: Open Zen Focus Mode in new tab with the exact current duration and settings
      if ((e.altKey || (e.ctrlKey && e.shiftKey)) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        const activeDur = modeRef.current === 'time' ? durationRef.current : 0;
        window.open(
          `/focus?duration=${activeDur}&pack=${activePack}&diff=${difficultyRef.current}&mode=${modeRef.current}`,
          '_blank'
        );
        window.dispatchEvent(new CustomEvent('thocktype:hud', {
          detail: {
            message: `Zen Focus Mode (${activeDur > 0 ? activeDur + 's' : 'Endless'})`,
            subtext: 'Alt + F / New Window',
            packId: activePack
          }
        }));
        return;
      }

      // 8. Alt + E: Easy Difficulty (Clean lowercase prose)
      if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        difficultyRef.current = 'easy';
        setDifficulty('easy');
        resetTest(durationRef.current, modeRef.current, 'easy');
        window.dispatchEvent(new CustomEvent('thocktype:hud', {
          detail: { message: 'Difficulty: Easy', subtext: 'Alt + E / Clean lowercase prose' }
        }));
        return;
      }

      // 9. Alt + M: Medium Difficulty (Punctuated prose)
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        difficultyRef.current = 'medium';
        setDifficulty('medium');
        resetTest(durationRef.current, modeRef.current, 'medium');
        window.dispatchEvent(new CustomEvent('thocktype:hud', {
          detail: { message: 'Difficulty: Medium', subtext: 'Alt + M / Punctuated prose' }
        }));
        return;
      }

      // 10. Alt + H: Hard Difficulty (Numbers & symbol keys)
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        difficultyRef.current = 'hard';
        setDifficulty('hard');
        resetTest(durationRef.current, modeRef.current, 'hard');
        window.dispatchEvent(new CustomEvent('thocktype:hud', {
          detail: { message: 'Difficulty: Hard', subtext: 'Alt + H / Numbers & symbol keys' }
        }));
        return;
      }

      // 11. Alt + 1-8: Switch sound pack
      if (e.altKey && e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key, 10) - 1;
        if (PACK_IDS[index]) {
          e.preventDefault();
          setActivePack(PACK_IDS[index]);
          playKey('KeyF', PACK_IDS[index]);
        }
      }

      // 12. Esc: Finish session if typing, or reset
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

    const onCycleDurationEvent = () => {
      const DURATIONS = [15, 30, 60, 90];
      const curDur = durationRef.current;
      const curIdx = DURATIONS.indexOf(curDur);
      const nextDur = DURATIONS[(curIdx + 1) % DURATIONS.length];
      durationRef.current = nextDur;
      modeRef.current = 'time';
      setDuration(nextDur);
      setMode('time');
      resetTest(nextDur, 'time');
    };

    const onSetModeEvent = (e: Event) => {
      const custom = e as CustomEvent<{ mode: TestMode }>;
      if (custom.detail?.mode) {
        modeRef.current = custom.detail.mode;
        setMode(custom.detail.mode);
        resetTest(durationRef.current, custom.detail.mode);
      }
    };

    const onSetDifficultyEvent = (e: Event) => {
      const custom = e as CustomEvent<{ difficulty: DifficultyMode }>;
      if (custom.detail?.difficulty) {
        difficultyRef.current = custom.detail.difficulty;
        setDifficulty(custom.detail.difficulty);
        resetTest(durationRef.current, modeRef.current, custom.detail.difficulty);
      }
    };

    const onOpenCustomEvent = () => {
      modeRef.current = 'custom';
      setMode('custom');
      setIsCustomModalOpen(true);
    };

    window.addEventListener('keydown', onGlobalKeyDown);
    window.addEventListener('keyup', onGlobalKeyUp);
    window.addEventListener('thocktype:restart-test', onRestartEvent);
    window.addEventListener('thocktype:cycle-duration', onCycleDurationEvent);
    window.addEventListener('thocktype:set-mode', onSetModeEvent);
    window.addEventListener('thocktype:set-difficulty', onSetDifficultyEvent);
    window.addEventListener('thocktype:open-custom', onOpenCustomEvent);

    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
      window.removeEventListener('keyup', onGlobalKeyUp);
      window.removeEventListener('thocktype:restart-test', onRestartEvent);
      window.removeEventListener('thocktype:cycle-duration', onCycleDurationEvent);
      window.removeEventListener('thocktype:set-mode', onSetModeEvent);
      window.removeEventListener('thocktype:set-difficulty', onSetDifficultyEvent);
      window.removeEventListener('thocktype:open-custom', onOpenCustomEvent);
    };
  }, [resetTest, isStarted, isFinished, input, elapsedSeconds, activePack, setActivePack, playKey, finishTest]);

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
Benchmark verified: ${typeof window !== 'undefined' ? window.location.origin : 'https://thocktype.vercel.app'}`;
    
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTest = () => {
    if (!results) return;
    const profile = SWITCH_PROFILES[results.soundPack];
    const shareText = `⌨️ THOCKTYPE Benchmark Result:
Speed: ${results.wpm} WPM | Raw: ${results.rawWpm} WPM
Accuracy: ${typeof results.accuracy === 'number' ? results.accuracy.toFixed(1) : results.accuracy}% | Consistency: ${results.consistency}%
Switch Sound: ${profile?.name || 'Mechanical Switch'} (${profile?.category || 'Mechanical'})
Test Duration: ${results.exactSeconds ? results.exactSeconds.toFixed(1) : results.timeSpent}s | Efficiency: ${results.efficiency || 100}%
Verified at THOCKTYPE: https://thocktype.vercel.app/test`;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }).catch(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      });
    } else {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Spline Chart Data Calculations for Benchmark Graph (Matching visual reference)
  const chartData = useMemo(() => {
    if (!results?.history || results.history.length === 0) return null;
    const hist = results.history;

    let maxVal = 60;
    hist.forEach((pt) => {
      if (pt.wpm > maxVal) maxVal = pt.wpm;
      if (pt.rawWpm > maxVal) maxVal = pt.rawWpm;
    });
    const maxY = Math.max(100, Math.ceil((maxVal + 20) / 20) * 20);

    const svgWidth = 1000;
    const svgHeight = 220;
    const padL = 35;
    const padR = 60;
    const padT = 25;
    const padB = 30;
    const plotW = svgWidth - padL - padR;
    const plotH = svgHeight - padT - padB;

    const pts = hist.map((pt, i) => {
      const frac = hist.length > 1 ? i / (hist.length - 1) : 0.5;
      const x = padL + frac * plotW;
      const y = padT + plotH - (Math.min(pt.wpm, maxY) / maxY) * plotH;
      return { x, y, pt, i };
    });

    const rawPts = hist.map((pt, i) => {
      const frac = hist.length > 1 ? i / (hist.length - 1) : 0.5;
      const x = padL + frac * plotW;
      const y = padT + plotH - (Math.min(pt.rawWpm, maxY) / maxY) * plotH;
      return { x, y, pt, i };
    });

    const netSpline = getCubicBezierPath(pts);
    const rawSpline = getCubicBezierPath(rawPts);

    const testDuration = Math.max(1, results.exactSeconds || results.timeSpent || hist.length);
    const errorPoints = (results.errorTimestamps || []).map((errSec, idx) => {
      const frac = Math.min(1, Math.max(0, errSec / testDuration));
      const errX = padL + frac * plotW;
      const matchedIdx = Math.min(pts.length - 1, Math.floor(frac * (pts.length - 1)));
      const curveY = pts[matchedIdx]?.y || (padT + plotH * 0.7);
      const errY = Math.min(padT + plotH - 6, Math.max(padT + 12, curveY + (idx % 2 === 0 ? -16 : 16)));
      return { x: errX, y: errY, sec: errSec, idx };
    });

    return {
      svgWidth,
      svgHeight,
      padL,
      padR,
      padT,
      padB,
      plotW,
      plotH,
      maxY,
      pts,
      rawPts,
      netSpline,
      rawSpline,
      errorPoints,
    };
  }, [results]);

  const currentProfile = SWITCH_PROFILES[activePack];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center overflow-x-hidden px-1 sm:px-0">
      
      {/* Test Config Toolbar (Mode, Time / Words / Unlimited / Custom, Settings, Switch Picker & Volume) */}
      <div className="w-full max-w-full flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 mb-6 sm:mb-8 bg-zinc-900/60 p-2 sm:p-2.5 rounded-2xl border border-zinc-800/80 backdrop-blur-sm">
        
        {/* Left Section: Mode Selector + Sub-options */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
          {/* Mode Selector (Time, Words, Unlimited, Custom) */}
          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
            <button
              type="button"
              onClick={() => { setMode('time'); resetTest(duration, 'time'); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'time'
                  ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Time Mode (Alt + T)"
            >
              time
            </button>
            <button
              type="button"
              onClick={() => { setMode('words'); resetTest(undefined, 'words'); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'words'
                  ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Word Target Mode (Alt + W)"
            >
              words
            </button>
            <button
              type="button"
              onClick={() => { setMode('unlimited'); resetTest(undefined, 'unlimited'); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                mode === 'unlimited'
                  ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Unlimited Stream (Alt + U)"
            >
              <span>unlimited</span>
              <span className="text-[10px] text-amber-400/80">∞</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('custom');
                if (customWords.length === 0) {
                  setIsCustomModalOpen(true);
                } else {
                  resetTest(undefined, 'custom');
                }
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'custom'
                  ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Custom Text (Alt + C)"
            >
              custom
            </button>
          </div>

          {/* Sub-options for Time / Words / Custom */}
          {mode === 'time' && (
            <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
              {[15, 30, 60, 90].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => { setDuration(sec); resetTest(sec, 'time'); }}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    duration === sec
                      ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={`Test duration: ${sec}s (Cycle with Alt + S)`}
                >
                  {sec}s
                </button>
              ))}
              <span className="hidden sm:inline text-[9px] text-zinc-500 font-mono px-1">Alt+S</span>
            </div>
          )}

          {mode === 'words' && (
            <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
              {[25, 50, 100].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => { setWordTarget(cnt); resetTest(undefined, 'words', undefined, cnt); }}
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

          {mode === 'unlimited' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] font-mono text-amber-300 font-bold">STREAM</span>
              <span>Endless Stream</span>
            </div>
          )}

          {mode === 'custom' && (
            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-mono cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Text / Presets</span>
            </button>
          )}
        </div>

        {/* Right Section: Difficulty, Live WPM Eye, Font Size, Switch Picker, Volume, Zen Focus */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 sm:gap-2">
          
          {/* Difficulty Mode Selector */}
          <div className="flex items-center bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
            {(['easy', 'medium', 'hard'] as DifficultyMode[]).map((d) => {
              const isSelected = difficulty === d;
              const shortcutKey = d === 'easy' ? 'E' : d === 'medium' ? 'M' : 'H';
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => { setDifficulty(d); resetTest(undefined, undefined, d); }}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? d === 'easy'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                        : d === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={`${d.toUpperCase()} mode (Alt + ${shortcutKey}): ${
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

          {/* User Preferences: Hide Live WPM & Font Size */}
          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60 text-xs font-mono">
            {/* Live WPM Toggle */}
            <button
              type="button"
              onClick={() => setHideLiveWpm(!hideLiveWpm)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                hideLiveWpm ? 'text-zinc-500 hover:text-zinc-300' : 'text-amber-400/90 hover:text-amber-300'
              }`}
              title={hideLiveWpm ? 'Live WPM is hidden (click to show)' : 'Hide Live WPM while typing (reduces anxiety)'}
            >
              {hideLiveWpm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            {/* Font Size Cycle */}
            <button
              type="button"
              onClick={() => setFontSize(f => f === 'sm' ? 'md' : f === 'md' ? 'lg' : 'sm')}
              className="px-1.5 py-0.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-0.5 text-[10px] font-mono font-bold"
              title={`Text Size: ${fontSize.toUpperCase()} (Click to toggle)`}
            >
              <Type className="w-3 h-3 text-zinc-500" />
              <span>{fontSize.toUpperCase()}</span>
            </button>
          </div>

          {/* Switch Sound Picker Popover */}
          <div className="relative" ref={switchPickerRef}>
            <button
              type="button"
              onClick={() => {
                setIsSwitchPickerOpen(!isSwitchPickerOpen);
                setIsVolumePickerOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/60 text-xs transition-all cursor-pointer group"
              title={`Switch sound: ${currentProfile?.name} (${currentProfile?.category})`}
            >
              <SwitchIcon
                id={activePack}
                className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
                style={{ color: currentProfile?.color }}
              />
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {isSwitchPickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 mb-1 border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                  <span>Switch Sound</span>
                  <span className="text-zinc-500">Alt+1..8</span>
                </div>
                <div className="space-y-1">
                  {PACK_IDS.map((id) => {
                    const p = SWITCH_PROFILES[id];
                    const isSelected = activePack === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setActivePack(id);
                          playKey('KeyF', id);
                          setIsSwitchPickerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-100 font-semibold ring-1 ring-zinc-700'
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <SwitchIcon id={id} className="w-3.5 h-3.5" style={{ color: p.color }} />
                          <span className="text-xs">{p.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{p.pitch}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Volume Button & Slider */}
          <div className="relative" ref={volumePickerRef}>
            <button
              type="button"
              onClick={() => {
                setIsVolumePickerOpen(!isVolumePickerOpen);
                setIsSwitchPickerOpen(false);
              }}
              className="w-8 h-8 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/60 flex items-center justify-center transition-all cursor-pointer"
              title={isMuted ? 'Muted (click to adjust volume)' : `Volume: ${Math.round(volume * 100)}%`}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
              )}
            </button>

            {isVolumePickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Volume</span>
                  <span className="text-amber-400 font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    setVolume(newVol);
                    if (isMuted && newVol > 0) toggleMute();
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={toggleMute}
                  className="w-full py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-300 cursor-pointer"
                >
                  {isMuted ? 'Unmute Sound' : 'Mute Sound'}
                </button>
              </div>
            )}
          </div>

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
            {hideLiveWpm && isStarted ? '•••' : wpm}
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

        {/* Time / Progress */}
        {showTimer && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 mb-1 flex items-center gap-1">
              {mode === 'unlimited' ? (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <span>Time (∞)</span>
                </span>
              ) : mode === 'custom' ? (
                <span>Progress</span>
              ) : (
                <span>Time</span>
              )}
            </span>
            <span className="text-2xl xs:text-3xl sm:text-4xl font-mono font-bold text-amber-400 tracking-tight">
              {mode === 'time'
                ? `${timeLeft}s`
                : mode === 'custom'
                ? `${Math.min(100, Math.round((input.length / (fullText.length || 1)) * 100))}%`
                : `${elapsedSeconds}s`}
            </span>
          </div>
        )}

        {/* Extra Counter for Unlimited Mode: Words Typed */}
        {mode === 'unlimited' && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 mb-1">
              Words
            </span>
            <span className="text-2xl xs:text-3xl sm:text-4xl font-mono font-bold text-emerald-400 tracking-tight">
              {input.trim() ? input.trim().split(/\s+/).filter(Boolean).length : 0}
            </span>
          </div>
        )}

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
            className={`h-32 xs:h-36 sm:h-44 overflow-hidden font-mono leading-relaxed tracking-wide select-none text-zinc-400 pointer-events-none relative z-0 transition-all ${
              fontSize === 'sm'
                ? 'text-base xs:text-lg sm:text-xl'
                : fontSize === 'lg'
                ? 'text-xl xs:text-2xl sm:text-3xl lg:text-[32px]'
                : 'text-lg xs:text-xl sm:text-2xl lg:text-[28px]'
            }`}
          >
            {fullText.split('').map((char, index) => {
              const typedChar = input[index];
              const isTyped = index < input.length;
              const isCurrent = index === input.length;
              const isCorrect = isTyped && typedChar === char;
              const isIncorrect = isTyped && typedChar !== char;

              let isWordActive = false;
              if (highlightStyle === 'word') {
                const currentInputLen = input.length;
                const prevSpace = fullText.lastIndexOf(' ', Math.max(0, currentInputLen - 1));
                const nextSpace = fullText.indexOf(' ', currentInputLen);
                const wordStart = prevSpace === -1 ? 0 : prevSpace + 1;
                const wordEnd = nextSpace === -1 ? fullText.length : nextSpace;
                isWordActive = index >= wordStart && index < wordEnd;
              }

              let charClass = 'text-zinc-500'; // Untouched future text
              if (highlightStyle === 'caret') {
                if (isCorrect) {
                  charClass = 'text-zinc-300';
                } else if (isIncorrect) {
                  charClass = highlightInputOnError
                    ? 'text-rose-400 underline decoration-rose-500'
                    : 'text-zinc-500 underline decoration-zinc-600';
                }
              } else {
                if (isCorrect) {
                  charClass = 'text-zinc-200';
                } else if (isIncorrect) {
                  charClass = highlightInputOnError
                    ? 'text-rose-400 bg-rose-500/20 underline decoration-rose-500'
                    : 'text-zinc-500 underline decoration-zinc-600';
                }
              }

              return (
                <span
                  key={index}
                  ref={isCurrent ? activeCharRef : null}
                  className={`relative ${charClass} ${isWordActive ? 'bg-amber-500/15 rounded-sm px-0.5' : ''}`}
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
                  onClick={() => resetTest()}
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
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-zinc-400 select-none">
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px]">Tab</kbd>
                <span>+</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px]">Enter</kbd>
                <span className="text-zinc-400">— Restart</span>
                <span className="text-zinc-600 px-1">/</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px]">Alt + S</kbd>
                <span className="text-zinc-400">— Cycle Time</span>
                <span className="text-zinc-600 px-1">/</span>
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
        /* =========================================================================
         * VISUAL BENCHMARK SCORECARD (Inspired by Visual Reference)
         * Clean dual-column parameters matrix + full-width spline graph with red × typos
         * ========================================================================= */
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Main Visual Benchmark Card */}
          <div className="w-full rounded-3xl bg-[#121316] border border-neutral-800 p-5 xs:p-7 sm:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Top Section: Dual-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
              
              {/* Left Column: Big WPM, Stat Pills, Share Button */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                
                {/* Large WPM Hero */}
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                    {results?.wpm}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-neutral-400">
                    WPM
                  </span>
                </div>

                {/* Stat Pill Rows */}
                <div className="space-y-2">
                  <div className="bg-[#1c1e22] hover:bg-[#23262c] border border-neutral-800/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm transition-all">
                    <span className="text-neutral-300 font-medium">Raw WPM</span>
                    <span className="font-mono font-bold text-neutral-100">{results?.rawWpm}</span>
                  </div>

                  <div className="bg-[#1c1e22] hover:bg-[#23262c] border border-neutral-800/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm transition-all">
                    <span className="text-neutral-300 font-medium">Accuracy</span>
                    <span className="font-mono font-bold text-neutral-100">
                      {typeof results?.accuracy === 'number' ? `${results.accuracy.toFixed(1)}%` : `${results?.accuracy}%`}
                    </span>
                  </div>

                  <div className="bg-[#1c1e22] hover:bg-[#23262c] border border-neutral-800/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm transition-all">
                    <span className="text-neutral-300 font-medium">Correct Characters</span>
                    <span className="font-mono font-bold text-neutral-100">{results?.correctChars}</span>
                  </div>

                  <div className="bg-[#1c1e22] hover:bg-[#23262c] border border-neutral-800/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm transition-all">
                    <span className="text-neutral-300 font-medium">Incorrect Characters</span>
                    <span className="font-mono font-bold text-neutral-100">{results?.incorrectChars}</span>
                  </div>

                  <div className="bg-[#1c1e22] hover:bg-[#23262c] border border-neutral-800/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm transition-all">
                    <span className="text-neutral-300 font-medium">Consistency</span>
                    <span className="font-mono font-bold text-neutral-100">{results?.consistency}%</span>
                  </div>
                </div>

                {/* Share Test Button (Featured prominently as in visual reference) */}
                <button
                  type="button"
                  onClick={handleShareTest}
                  className="w-full mt-4 py-3 px-5 rounded-xl bg-[#202227] hover:bg-[#2a2d34] text-neutral-100 border border-neutral-700/60 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shadow-md"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Report Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-neutral-400" />
                      <span>Share test</span>
                    </>
                  )}
                </button>

                {/* Quick Restart & Navigation Bar */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => resetTest()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart test (Tab+Enter)</span>
                  </button>

                  <a
                    href={`/focus?duration=${mode === 'time' ? duration : 0}&pack=${activePack}&diff=${difficulty}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition cursor-pointer"
                    title="Open Zen Focus Mode"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </a>

                  <Link
                    href="/profile"
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition cursor-pointer"
                    title="Profile Growth Analytics"
                  >
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </Link>
                </div>

              </div>

              {/* Right Column: Parameters Matrix (Every Button is 100% Functional) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5 pt-1 lg:pt-0">
                
                {/* 1. Test Duration */}
                <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-neutral-800/40">
                  <span className="text-neutral-300 font-medium">Test Duration</span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {[
                      { label: '0:10', sec: 10, mode: 'time' },
                      { label: '0:30', sec: 30, mode: 'time' },
                      { label: '1:00', sec: 60, mode: 'time' },
                      { label: '2:00', sec: 120, mode: 'time' },
                      { label: '5:00', sec: 300, mode: 'time' },
                      { label: '∞', sec: 0, mode: 'unlimited' },
                    ].map((opt) => {
                      const isActive =
                        opt.mode === 'unlimited'
                          ? mode === 'unlimited'
                          : mode === 'time' && duration === opt.sec;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => {
                            if (opt.mode === 'unlimited') {
                              setMode('unlimited');
                            } else {
                              setMode('time');
                              setDuration(opt.sec);
                            }
                            resetTest();
                          }}
                          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                            isActive
                              ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Highlight Style */}
                <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-neutral-800/40">
                  <span className="text-neutral-300 font-medium">Highlight Style</span>
                  <div className="flex items-center gap-1 text-xs">
                    {(['character', 'word', 'caret'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setHighlightStyle(style)}
                        className={`px-3 py-1 rounded-full capitalize transition-all cursor-pointer ${
                          highlightStyle === style
                            ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Highlight Input on Error */}
                <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-neutral-800/40">
                  <span className="text-neutral-300 font-medium">Highlight Input on Error</span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setHighlightInputOnError(true)}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        highlightInputOnError
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      onClick={() => setHighlightInputOnError(false)}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        !highlightInputOnError
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>

                {/* 4. Words List */}
                <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-neutral-800/40">
                  <span className="text-neutral-300 font-medium">Words List</span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setDifficulty('easy');
                        resetTest();
                      }}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        difficulty === 'easy'
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Simple
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDifficulty('hard');
                        resetTest();
                      }}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        difficulty === 'hard' || difficulty === 'medium'
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Advanced
                    </button>
                  </div>
                </div>

                {/* 5. Punctuation */}
                <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-neutral-800/40">
                  <span className="text-neutral-300 font-medium">Punctuation</span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setHasPunctuation(true);
                        resetTest();
                      }}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        hasPunctuation
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasPunctuation(false);
                        resetTest();
                      }}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        !hasPunctuation
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>

                {/* 6. Numbers */}
                <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-neutral-800/40">
                  <span className="text-neutral-300 font-medium">Numbers</span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setHasNumbers(true);
                        resetTest();
                      }}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        hasNumbers
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasNumbers(false);
                        resetTest();
                      }}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        !hasNumbers
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>

                {/* 7. Show WPM */}
                <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-neutral-800/40">
                  <span className="text-neutral-300 font-medium">Show WPM</span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setHideLiveWpm(false)}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        !hideLiveWpm
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Show
                    </button>
                    <button
                      type="button"
                      onClick={() => setHideLiveWpm(true)}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        hideLiveWpm
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Hide
                    </button>
                  </div>
                </div>

                {/* 8. Show Timer */}
                <div className="flex items-center justify-between text-xs sm:text-sm py-1">
                  <span className="text-neutral-300 font-medium">Show Timer</span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowTimer(true)}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        showTimer
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Show
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTimer(false)}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        !showTimer
                          ? 'bg-neutral-200 text-neutral-900 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Hide
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Full-Width Spline Graph with Red × Errors */}
            {chartData && (
              <div className="w-full pt-4 border-t border-neutral-800/80 relative">
                
                {/* Graph Legend & Live Inspection */}
                <div className="flex items-center justify-between mb-2 text-xs font-mono">
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                      <span className="w-3 h-0.5 bg-sky-400 inline-block rounded-full" /> Net WPM
                    </span>
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <span className="w-3 h-0.5 bg-neutral-500 inline-block rounded-full" /> Raw Velocity
                    </span>
                    {chartData.errorPoints.length > 0 && (
                      <span className="flex items-center gap-1 text-rose-400">
                        <span className="font-bold">×</span> {chartData.errorPoints.length} typos marked
                      </span>
                    )}
                  </div>
                  
                  {hoveredChartIndex !== null && chartData.pts[hoveredChartIndex] && (
                    <div className="text-[11px] text-neutral-300 bg-neutral-800/80 px-2.5 py-0.5 rounded-md border border-neutral-700/60">
                      t={chartData.pts[hoveredChartIndex].pt.second}s | Net: {chartData.pts[hoveredChartIndex].pt.wpm} | Raw: {chartData.pts[hoveredChartIndex].pt.rawWpm}
                    </div>
                  )}
                </div>

                {/* SVG Spline Canvas */}
                <div className="w-full h-44 sm:h-52 bg-[#0d0e11] rounded-2xl border border-neutral-800/70 p-2 relative overflow-hidden">
                  <svg
                    className="w-full h-full overflow-visible select-none"
                    viewBox={`0 0 ${chartData.svgWidth} ${chartData.svgHeight}`}
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mouseX = ((e.clientX - rect.left) / rect.width) * chartData.svgWidth;
                      let closestIdx = 0;
                      let minDist = Infinity;
                      chartData.pts.forEach((p, idx) => {
                        const dist = Math.abs(p.x - mouseX);
                        if (dist < minDist) {
                          minDist = dist;
                          closestIdx = idx;
                        }
                      });
                      setHoveredChartIndex(closestIdx);
                    }}
                    onMouseLeave={() => setHoveredChartIndex(null)}
                  >
                    <defs>
                      <linearGradient id="splineBlueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Vertical Subtle Grid Lines */}
                    {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((frac, idx) => {
                      const gx = chartData.padL + frac * chartData.plotW;
                      return (
                        <line
                          key={idx}
                          x1={gx}
                          y1={chartData.padT}
                          x2={gx}
                          y2={chartData.padT + chartData.plotH}
                          stroke="#202227"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      );
                    })}

                    {/* Horizontal Guideline Grids */}
                    {[0.25, 0.5, 0.75].map((frac, idx) => {
                      const gy = chartData.padT + chartData.plotH - frac * chartData.plotH;
                      return (
                        <line
                          key={idx}
                          x1={chartData.padL}
                          y1={gy}
                          x2={chartData.padL + chartData.plotW}
                          y2={gy}
                          stroke="#1c1e22"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Right-side Y-Axis Ticks (as seen in visual reference) */}
                    {[1, 0.75, 0.5, 0.25].map((frac, idx) => {
                      const gy = chartData.padT + chartData.plotH - frac * chartData.plotH;
                      return (
                        <text
                          key={idx}
                          x={chartData.svgWidth - 45}
                          y={gy + 4}
                          fill="#52525b"
                          fontSize="11"
                          fontFamily="monospace"
                        >
                          {Math.round(chartData.maxY * frac)}
                        </text>
                      );
                    })}

                    {/* Area fill under Net WPM curve */}
                    {chartData.pts.length > 1 && (
                      <path
                        d={`${chartData.netSpline} L ${chartData.pts[chartData.pts.length - 1].x} ${chartData.padT + chartData.plotH} L ${chartData.pts[0].x} ${chartData.padT + chartData.plotH} Z`}
                        fill="url(#splineBlueGradient)"
                      />
                    )}

                    {/* Raw Velocity Spline Curve (Dark Gray, undulating) */}
                    <path
                      d={chartData.rawSpline}
                      fill="none"
                      stroke="#4b5563"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    {/* Net WPM Spline Curve (Vibrant Sky Blue) */}
                    <path
                      d={chartData.netSpline}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Net WPM Data Point Dots */}
                    {chartData.pts.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredChartIndex === idx ? 4.5 : 2}
                        fill="#38bdf8"
                      />
                    ))}

                    {/* RED × ERROR MARKERS at exact typo timestamps (Matching screenshot reference) */}
                    {chartData.errorPoints.map((ep, idx) => (
                      <g key={idx} className="cursor-pointer">
                        <title>Misstroke at {ep.sec}s</title>
                        <text
                          x={ep.x}
                          y={ep.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#ef4444"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          ×
                        </text>
                      </g>
                    ))}

                    {/* Hover Vertical Guide Indicator */}
                    {hoveredChartIndex !== null && chartData.pts[hoveredChartIndex] && (
                      <>
                        <line
                          x1={chartData.pts[hoveredChartIndex].x}
                          y1={chartData.padT}
                          x2={chartData.pts[hoveredChartIndex].x}
                          y2={chartData.padT + chartData.plotH}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                        <circle
                          cx={chartData.pts[hoveredChartIndex].x}
                          cy={chartData.pts[hoveredChartIndex].y}
                          r="5"
                          fill="#38bdf8"
                        />
                        {chartData.rawPts[hoveredChartIndex] && (
                          <circle
                            cx={chartData.rawPts[hoveredChartIndex].x}
                            cy={chartData.rawPts[hoveredChartIndex].y}
                            r="4"
                            fill="#9ca3af"
                          />
                        )}
                      </>
                    )}
                  </svg>
                </div>
              </div>
            )}

          </div>

          {/* Collapsible / Expandable Detailed Acoustic & Diagnostics Tray */}
          <div className="w-full rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 backdrop-blur-md">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
                  Acoustic & Friction Diagnostics
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}
                className="text-xs font-mono text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {showDiagnosticsDetail ? 'Hide Details ▲' : 'Show Details ▼'}
              </button>
            </div>

            {showDiagnosticsDetail && (
              <div className="pt-4 space-y-5 animate-in fade-in duration-150">
                
                {/* Active Switch Personality Card & Projection */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
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
                        {currentProfile?.pitch} Pitch / {currentProfile?.loudness}
                      </div>
                    </div>
                  </div>

                  {results?.report && (
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] font-mono text-amber-400 font-bold">
                        Target Capacity: {results.report.projectedWpmMin} – {results.report.projectedWpmMax} WPM
                      </div>
                      <div className="text-xs text-zinc-300 mt-0.5">
                        {results.report.potentialHeadline}
                      </div>
                    </div>
                  )}
                </div>

                {/* Problem Keys */}
                {results?.troubleKeys && results.troubleKeys.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono p-3 rounded-xl bg-rose-950/20 border border-rose-900/30">
                    <span className="font-semibold text-rose-300">High-Friction Misstrokes:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {results.troubleKeys.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center gap-1"
                        >
                          <kbd className="px-1 rounded bg-zinc-900 border border-rose-500/40 text-zinc-100">
                            {item.char === ' ' ? '␣ Space' : item.char}
                          </kbd>
                          <span className="text-[10px] text-rose-400">({item.count}×)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Harsh Diagnostic Audit Cards */}
                {results?.report?.harshDiagnostics && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.report.harshDiagnostics.map((diag, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs ${
                          diag.severity === 'critical'
                            ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                            : diag.severity === 'warning'
                            ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                            : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        }`}
                      >
                        <div className="font-bold font-mono mb-1 flex items-center gap-1.5">
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
                )}

                {/* Sub-Millisecond Physics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-400 block text-[10px] mb-0.5">Sub-ms Time</span>
                    <span className="text-zinc-200 font-bold">
                      {results?.exactSeconds ? results.exactSeconds.toFixed(2) : results?.timeSpent}s
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-400 block text-[10px] mb-0.5">Actuation Speed</span>
                    <span className="text-amber-400 font-bold">{results?.kps || 0} KPS</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-400 block text-[10px] mb-0.5">Latency per Key</span>
                    <span className="text-zinc-200 font-bold">{results?.msPerKey || 0}ms</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-400 block text-[10px] mb-0.5">Backspaces</span>
                    <span className="text-zinc-200 font-bold">{results?.backspaceCount || 0}</span>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* Custom Text & Presets Practice Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-zinc-100">Custom Text & Presets</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste your own article, essay, code, or select from curated literature drills to practice with mechanical keyboard acoustics.
            </p>

            {/* Presets Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PASSAGES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setCustomRawInput(preset.text)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-mono text-zinc-300 hover:text-amber-400 cursor-pointer transition-all"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-1.5">
              <textarea
                value={customRawInput}
                onChange={(e) => setCustomRawInput(e.target.value)}
                placeholder="Paste your custom text, code, or paragraphs here..."
                rows={5}
                className="w-full p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 text-zinc-200 font-mono text-xs leading-relaxed resize-none outline-none"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>
                  {customRawInput.trim() ? customRawInput.trim().split(/\s+/).filter(Boolean).length : 0} words / {customRawInput.length} chars
                </span>
                <span>Auto-cleans formatting</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const textToUse = customRawInput.trim() || PRESET_PASSAGES[0].text;
                  const sanitized = sanitizeCustomText(textToUse);
                  setCustomWords(sanitized);
                  setWords(sanitized);
                  setMode('custom');
                  setIsCustomModalOpen(false);
                  resetTest();
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Start Custom Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
