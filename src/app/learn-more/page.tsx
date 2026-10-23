'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Keyboard,
  Flame,
  Radio,
  Maximize2,
  Volume2,
  Volume1,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Terminal,
  Zap,
  Sliders,
  ShieldCheck,
  Layers,
  Clock,
  Activity,
  Cpu,
  Target,
  FileText,
  Play
} from 'lucide-react';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { SwitchIcon } from '@/components/SwitchIcon';

export default function LearnMorePage() {
  const { activePack, setActivePack, playKey } = useSound();
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('Press any key or shortcut...');

  // Live keystroke sniffer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const parts: string[] = [];
      if (e.altKey) parts.push('Alt');
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.metaKey) parts.push('Cmd');
      if (!['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) {
        parts.push(e.key === ' ' ? 'Space' : e.key.toUpperCase());
      }
      if (parts.length > 0) {
        setLastKeyPressed(parts.join(' + '));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center">
      
      {/* 1. Header & Hero */}
      <div className="text-center max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>THOCKTYPE Master Guide // Features & Shortcuts</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
          Every Feature & Keystroke Shortcut Explained
        </h1>
        <p className="mt-3 text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          THOCKTYPE integrates a distraction-free Zen Focus mode, authentic mechanical keyboard audio synthesis, strict non-AI typing diagnostics, and a home-row shortcut system.
        </p>

        {/* Quick Jump Anchors */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          <a href="#zen-focus" className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-zinc-700 transition-colors">
            #zen-focus
          </a>
          <a href="#sound-studio" className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-sky-400 hover:border-zinc-700 transition-colors">
            #sound-studio
          </a>
          <a href="#typing-benchmark" className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-zinc-700 transition-colors">
            #typing-benchmark
          </a>
          <a href="#shortcuts-deck" className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:border-zinc-700 transition-colors">
            #shortcuts-deck
          </a>
        </div>
      </div>

      {/* Live Keystroke Detector HUD */}
      <div className="w-full max-w-2xl p-4 mb-12 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Live Keystroke Detector
            </div>
            <div className="text-sm font-mono font-bold text-zinc-100">
              {lastKeyPressed}
            </div>
          </div>
        </div>
        <kbd className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-amber-400 shadow-inner">
          Active Listener
        </kbd>
      </div>

      {/* Feature 1: Zen Focus Mode */}
      <section id="zen-focus" className="w-full mb-16 pt-6 border-t border-zinc-800/80">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          <div className="lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-wider">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Sanctuary Mode</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              1. Zen Focus Mode
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Zen Focus is designed for peak flow state and tactile practice. It eliminates navigation headers, sidebars, score counters, and peripheral UI distractions, focusing 100% of your visual attention on the typing caret.
            </p>

            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Core Capabilities:
              </h3>
              <ul className="text-xs text-zinc-300 space-y-2 pl-4 list-disc marker:text-amber-400">
                <li>
                  <strong className="text-zinc-100">Edge-to-Edge Fullscreen:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-[11px]">F11</kbd> or tap the Fullscreen button for true browser-edge focus.
                </li>
                <li>
                  <strong className="text-zinc-100">Endurance Unlimited Typing:</strong> Practice without countdown pressure. Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-[11px]">Esc</kbd> whenever you want to conclude the session and generate your scorecard.
                </li>
                <li>
                  <strong className="text-zinc-100">Direct Visit Setup Card:</strong> Navigating directly to <code className="text-amber-400 font-mono">/focus</code> without URL parameters automatically opens an interactive setup card allowing you to choose switch sounds, duration, and difficulty.
                </li>
              </ul>
            </div>
          </div>

          {/* Trigger Card */}
          <div className="lg:w-1/2 w-full p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between space-y-5">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-3 flex items-center justify-between">
                <span>How to Trigger Zen Focus:</span>
                <span className="text-amber-400 text-[10px]">Instant</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-300">Global Shortcut (Any Page)</span>
                  <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">Alt + F</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-300">Direct URL</span>
                  <span className="text-zinc-400">https://domain/focus</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-300">End Session & Score</span>
                  <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Esc</kbd>
                </div>
              </div>
            </div>

            <Link
              href="/focus"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Maximize2 className="w-4 h-4 fill-zinc-950" />
              <span>Launch Zen Focus Mode Now (Alt + F)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature 2: Sound Studio & 8 Switches */}
      <section id="sound-studio" className="w-full mb-16 pt-6 border-t border-zinc-800/80">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          <div className="lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5" />
              <span>Acoustic Synthesis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              2. Sound Studio & Acoustic Scope
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Every switch sound is processed locally in real-time through the native Web Audio API without remote latency or network streaming.
            </p>

            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Acoustic Features:
              </h3>
              <ul className="text-xs text-zinc-300 space-y-2 pl-4 list-disc marker:text-sky-400">
                <li>
                  <strong className="text-zinc-100">8 Switch Personalities:</strong> Frost Click, Ruby Thock, Chestnut Bump, Midnight Thock, Alpine Pop, Onyx Glide, Glacier Glide, and Cream Clack.
                </li>
                <li>
                  <strong className="text-zinc-100">Spatial Stereo Key Panning:</strong> Left-hand keys pan to your left ear and right-hand keys pan right, recreating physical desk immersion.
                </li>
                <li>
                  <strong className="text-zinc-100">Key Release & Deskmat Resonance:</strong> Simulates keyup return spring tick and sub-frequency deskmat acoustic damping.
                </li>
              </ul>
            </div>
          </div>

          {/* Trigger Card */}
          <div className="lg:w-1/2 w-full p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between space-y-5">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-3 flex items-center justify-between">
                <span>How to Trigger & Control Sounds:</span>
                <span className="text-sky-400 text-[10px]">Real-Time</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-300">Hot-Swap Switches</span>
                  <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-sky-400 font-bold">Alt + 1..8</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-300">Volume Up / Down</span>
                  <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Alt + ↑ / ↓</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-300">Toggle Mute / Unmute</span>
                  <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Alt + M</kbd>
                </div>
              </div>
            </div>

            <Link
              href="/sounds"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs tracking-wide transition-all hover:scale-105"
            >
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Explore Sound Studio (Alt + S)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature 3: Non-AI Benchmark & Diagnostics */}
      <section id="typing-benchmark" className="w-full mb-16 pt-6 border-t border-zinc-800/80">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          <div className="lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>100% Deterministic Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              3. Strict Typing Benchmark & Heuristics
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              No black-box AI or remote APIs. The benchmark engine uses pure mathematical telemetry to calculate honest WPM, sub-millisecond consistency, and key accuracy.
            </p>

            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Key Metrics Measured:
              </h3>
              <ul className="text-xs text-zinc-300 space-y-2 pl-4 list-disc marker:text-rose-400">
                <li>
                  <strong className="text-zinc-100">Net WPM:</strong> Calculated via <code className="text-rose-400 font-mono text-[11px]">((correctChars / 5) - uncorrectedErrors) / minutes</code> with strict error penalty.
                </li>
                <li>
                  <strong className="text-zinc-100">Consistency %:</strong> Computed using sub-millisecond keystroke interval variance via <code className="text-rose-400 font-mono text-[11px]">performance.now()</code>.
                </li>
                <li>
                  <strong className="text-zinc-100">Top Trouble Keys:</strong> Flags exact letters committed with errors so you can target finger dexterity.
                </li>
              </ul>
            </div>
          </div>

          {/* Trigger Card */}
          <div className="lg:w-1/2 w-full p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between space-y-5">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-3 flex items-center justify-between">
                <span>How to Trigger & Control Test:</span>
                <span className="text-rose-400 text-[10px]">Zero Latency</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-300">Launch Typing Test</span>
                  <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">Alt + T</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-300">Instant Restart (Home Row)</span>
                  <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-emerald-400 font-bold">Tab + Enter</kbd>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-300">Cycle Difficulty</span>
                  <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Alt + M</kbd>
                </div>
              </div>
            </div>

            <Link
              href="/test"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Flame className="w-4 h-4 fill-zinc-950" />
              <span>Launch Typing Benchmark (Alt + T)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature 4: The Master Shortcut Deck */}
      <section id="shortcuts-deck" className="w-full mb-16 pt-6 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
              <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Command Reference</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              4. Complete Global Keystroke Shortcuts Deck
            </h2>
          </div>
          <kbd className="hidden sm:inline-block px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-amber-400">
            ? for instant HUD
          </kbd>
        </div>

        {/* Switch Hot-Swap Grid */}
        <div className="mb-8">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
            Acoustic Switch Hot-Swap (Alt + 1..8)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PACK_IDS.map((id, index) => {
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
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-600 ring-1 ring-zinc-700 shadow-md'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SwitchIcon
                      id={id}
                      className="w-4 h-4 shrink-0"
                      style={{ color: pack.color }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-zinc-100 truncate">
                        {pack.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {pack.category}
                      </div>
                    </div>
                  </div>

                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-amber-400 shrink-0 ml-2">
                    Alt + {index + 1}
                  </kbd>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comprehensive Shortcuts Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Test & Benchmark Controls */}
          <div className="space-y-3 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Typing Test Controls
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">Instant Test Restart</div>
                  <div className="text-[11px] text-zinc-500">Restarts without leaving home row</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-emerald-400 font-bold">Tab + Enter</kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">Toggle Zen Focus</div>
                  <div className="text-[11px] text-zinc-500">Opens distraction-free full-screen</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">Alt + F</kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">Finish Unlimited / Reset</div>
                  <div className="text-[11px] text-zinc-500">Concludes endurance session</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Esc</kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">Cycle Difficulty</div>
                  <div className="text-[11px] text-zinc-500">Easy → Medium → Hard</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Alt + M</kbd>
              </div>
            </div>
          </div>

          {/* Navigation & Audio Controls */}
          <div className="space-y-3 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
              Navigation & Audio
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">Volume Tuning (+/- 10%)</div>
                  <div className="text-[11px] text-zinc-500">Increases / lowers master audio</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Alt + ↑ / ↓</kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">Jump to Typing Test</div>
                  <div className="text-[11px] text-zinc-500">Direct global navigation</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">Alt + T</kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">Jump to Sound Lab</div>
                  <div className="text-[11px] text-zinc-500">Acoustic mixer & sound studio</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-sky-400 font-bold">Alt + S</kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">Quick Cheat Sheet Overlay</div>
                  <div className="text-[11px] text-zinc-500">Floating on-screen HUD</div>
                </div>
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">?</kbd>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Banner CTA */}
      <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-sky-500/10 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100">Ready to test your mechanical speed?</h2>
          <p className="text-xs text-zinc-400 mt-1">Jump directly into a 60-second test or open Zen Focus mode.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/test"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Flame className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Typing Test (Alt + T)</span>
          </Link>
          <Link
            href="/focus"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all hover:scale-105"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Zen Focus (Alt + F)</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
