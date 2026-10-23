'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Keyboard,
  Flame,
  Volume2,
  Volume1,
  Maximize2,
  Sliders,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Terminal,
  Layers,
  Radio,
  Play
} from 'lucide-react';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { SwitchIcon } from '@/components/SwitchIcon';

interface ShortcutItem {
  keys: string[];
  action: string;
  description: string;
  scope: 'Global' | 'Typing Test' | 'Audio Engine';
  tag?: string;
}

export default function ShortcutsPage() {
  const { activePack, setActivePack, playKey } = useSound();
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('Press any key...');

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

  const testControls: ShortcutItem[] = [
    {
      keys: ['Tab', 'Enter'],
      action: 'Instant Test Restart',
      description: 'Restarts the current benchmark instantly without moving your hands from home row.',
      scope: 'Typing Test',
      tag: 'Core'
    },
    {
      keys: ['Shift', 'Enter'],
      action: 'Secondary Restart',
      description: 'Alternative instant reset shortcut if your OS intercepts Tab.',
      scope: 'Typing Test'
    },
    {
      keys: ['Alt', 'F'],
      action: 'Toggle Zen Focus Mode',
      description: 'Switches directly into full-screen, minimalist, distraction-free typing.',
      scope: 'Global',
      tag: 'Popular'
    },
    {
      keys: ['Esc'],
      action: 'Finish Unlimited / Exit Focus',
      description: 'Ends an ongoing unlimited typing session to generate the performance scorecard, or returns from Zen mode.',
      scope: 'Typing Test'
    },
    {
      keys: ['Alt', 'M'],
      action: 'Cycle Difficulty Mode',
      description: 'Cycles test text between Easy (clean lowercase words), Medium (punctuated prose), and Hard (numbers, symbols, and camelCase).',
      scope: 'Global'
    }
  ];

  const navigationControls: ShortcutItem[] = [
    {
      keys: ['Alt', 'T'],
      action: 'Navigate to Typing Test',
      description: 'Directly jumps to the standard typing benchmark page from anywhere.',
      scope: 'Global'
    },
    {
      keys: ['Alt', 'S'],
      action: 'Navigate to Sound Studio',
      description: 'Opens the 8-switch acoustic laboratory and audio mixer.',
      scope: 'Global'
    },
    {
      keys: ['Alt', 'H'],
      action: 'Return Home',
      description: 'Navigates back to the landing page and virtual 65% keyboard.',
      scope: 'Global'
    },
    {
      keys: ['?'],
      action: 'Toggle Shortcut HUD Overlay',
      description: 'Brings up a lightweight quick-glance cheat sheet overlay anywhere in the app.',
      scope: 'Global',
      tag: 'Cheat Sheet'
    }
  ];

  const audioControls: ShortcutItem[] = [
    {
      keys: ['Alt', '↑'],
      action: 'Volume Up (+10%)',
      description: 'Increases the master Web Audio acoustic volume by 10%.',
      scope: 'Audio Engine'
    },
    {
      keys: ['Alt', '↓'],
      action: 'Volume Down (-10%)',
      description: 'Lowers the master Web Audio acoustic volume by 10%.',
      scope: 'Audio Engine'
    },
    {
      keys: ['Alt', 'M'],
      action: 'Mute / Unmute',
      description: 'Toggles silent mode if audio is muted or unmuted.',
      scope: 'Audio Engine'
    },
    {
      keys: ['Alt', 'K'],
      action: 'Toggle Keyup Spring Release',
      description: 'Enables or disables mechanical switch keyup return click acoustics.',
      scope: 'Audio Engine'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center max-w-2xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Keystroke Command Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
          Keyboard Shortcuts Overview
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Master ThockType without reaching for your mouse. Switch mechanical switches, restart tests, enter Zen Focus, and tune acoustics entirely from your home row.
        </p>
      </div>

      {/* Live Keystroke Sniffer HUD */}
      <div className="w-full max-w-xl p-4 mb-10 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Live Keystroke Detector
            </div>
            <div className="text-sm font-mono font-bold text-zinc-200">
              {lastKeyPressed}
            </div>
          </div>
        </div>
        <kbd className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-amber-400 shadow-inner">
          Listening
        </kbd>
      </div>

      {/* Section 1: Switch Hot-Swap Grid (Alt + 1..8) */}
      <div className="w-full mb-10">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Switch Hot-Swap Shortcuts</span>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Alt + 1 through 8
          </span>
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

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-amber-400">
                    Alt + {index + 1}
                  </kbd>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Core Test Controls */}
      <div className="w-full mb-10">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800/80 text-sm font-bold text-zinc-200">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Typing Test Controls</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {testControls.map((sc, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200">{sc.action}</span>
                  {sc.tag && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono text-amber-400">
                      {sc.tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {sc.keys.map((k, ki) => (
                  <React.Fragment key={ki}>
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold text-zinc-200 shadow-sm">
                      {k}
                    </kbd>
                    {ki < sc.keys.length - 1 && <span className="text-zinc-600 text-xs">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Navigation & Audio Controls */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        
        {/* Navigation */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800/80 text-sm font-bold text-zinc-200">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Global Navigation</span>
          </div>
          <div className="space-y-3">
            {navigationControls.map((sc, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-zinc-200">{sc.action}</div>
                  <div className="text-[11px] text-zinc-400">{sc.description}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {sc.keys.map((k, ki) => (
                    <React.Fragment key={ki}>
                      <kbd className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold text-zinc-200 shadow-sm">
                        {k}
                      </kbd>
                      {ki < sc.keys.length - 1 && <span className="text-zinc-600 text-xs">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800/80 text-sm font-bold text-zinc-200">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Acoustics & Volume</span>
          </div>
          <div className="space-y-3">
            {audioControls.map((sc, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-zinc-200">{sc.action}</div>
                  <div className="text-[11px] text-zinc-400">{sc.description}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {sc.keys.map((k, ki) => (
                    <React.Fragment key={ki}>
                      <kbd className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold text-zinc-200 shadow-sm">
                        {k}
                      </kbd>
                      {ki < sc.keys.length - 1 && <span className="text-zinc-600 text-xs">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CTA Footer Banner */}
      <div className="w-full p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-100">Ready to put your shortcuts to the test?</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Jump straight into the benchmark or open Zen Focus mode.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/test"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Flame className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Typing Test (Alt + T)</span>
          </Link>
          <Link
            href="/focus"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all hover:scale-105"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Zen Focus (Alt + F)</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
