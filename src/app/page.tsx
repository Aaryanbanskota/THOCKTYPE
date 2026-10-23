'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { SwitchIcon } from '@/components/SwitchIcon';
import { SoundPackId } from '@/types/sound';
import {
  Flame,
  Radio,
  Play,
  Volume2,
  Maximize2,
  ArrowRight,
  Terminal,
  SlidersHorizontal,
  Keyboard as KeyboardIcon,
  BookOpen,
  ChevronDown
} from 'lucide-react';

export default function HomePage() {
  const { activePack, setActivePack, playKey } = useSound();
  const [playingPreview, setPlayingPreview] = useState<SoundPackId | null>(null);

  // Audition switch keystroke sequence
  const previewSwitch = (packId: SoundPackId) => {
    setActivePack(packId);
    setPlayingPreview(packId);

    const keys = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'Space', 'KeyJ', 'KeyK', 'KeyL', 'Enter'];
    keys.forEach((k, idx) => {
      setTimeout(() => {
        playKey(k, packId);
        if (idx === keys.length - 1) {
          setTimeout(() => setPlayingPreview(null), 240);
        }
      }, idx * 110);
    });
  };

  const currentProfile = SWITCH_PROFILES[activePack];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. Tactical Industrial Masthead & Live Workbench */}
      <section className="relative w-full pt-6 sm:pt-10 pb-8 sm:pb-12 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Terminal Header Info */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-3 sm:mb-4">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            TYPELOUDER // THOCKTYPE
          </span>
          <span className="hidden xs:inline">•</span>
          <span>Open Acoustic Lab</span>
          <span className="hidden xs:inline">•</span>
          <span className="text-zinc-400">Zero Signup</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight max-w-2xl leading-[1.18] sm:leading-[1.15]">
          Mechanical switch sound test & typing speed lab.
        </h1>

        <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed px-2">
          Eight switch recordings with dedicated spacebar stabilizers and spring return acoustics. Type on the keyboard below or jump into a benchmark.
        </p>

        {/* Direct Action Hub: Exactly Two Buttons (Launch & Learn More) */}
        <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/test"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-amber-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Flame className="w-4 h-4 fill-zinc-950" />
            <span>Launch Typing Test</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-amber-600/30 text-amber-950 text-[10px] font-mono font-bold">Alt+T</kbd>
          </Link>

          <a
            href="#learn-more"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 font-semibold text-xs sm:text-sm tracking-wide shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Learn More</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>

        {/* 2. Interactive Mechanical Workbench */}
        <div className="mt-10 w-full flex flex-col items-center">
          
          {/* Switch Dock Header */}
          <div className="w-full flex items-center justify-between pb-2.5 px-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              <SwitchIcon id={activePack} className="w-3.5 h-3.5" style={{ color: currentProfile?.color }} />
              <span className="text-zinc-500">ACTIVE:</span>
              <span className="text-zinc-200 font-bold">{currentProfile?.name}</span>
              <span className="text-[10px] text-zinc-500">({currentProfile?.category})</span>
            </div>
            <div className="text-[11px] text-zinc-500 hidden sm:flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">Alt + 1..8</kbd>
              <span>Hot-swap switch</span>
            </div>
          </div>

          {/* Hot-Swap Switch Selector Deck */}
          <div className="w-full grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 mb-3 shadow-md">
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
                  className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-zinc-800 text-zinc-100 shadow-md ring-1 ring-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                  style={{
                    borderColor: isSelected ? pack.color : undefined,
                    boxShadow: isSelected ? `0 0 12px ${pack.color}25` : undefined
                  }}
                  title={`${pack.name} (Alt + ${index + 1})`}
                >
                  <span className="absolute top-1 right-1.5 text-[9px] font-mono text-zinc-500 opacity-60">
                    {index + 1}
                  </span>
                  <SwitchIcon
                    id={id}
                    className="w-4 h-4 mb-1 shrink-0"
                    style={{ color: pack.color }}
                  />
                  <span className="truncate max-w-full text-center text-[10px] font-mono leading-tight">
                    {pack.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Virtual 65% Mechanical Keyboard */}
          <VirtualKeyboard interactiveGlobal={true} />

        </div>

      </section>

      {/* 3. The 8 Switch Sound Catalog (#lineup) */}
      <section id="lineup" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-zinc-800/70">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Eight sounds. Eight personalities.
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-400 max-w-xs text-left sm:text-right">
            Compare acoustic signatures. Press Audition to sample the typing cadence.
          </p>
        </div>

        {/* The 8 Clean Catalog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PACK_IDS.map((id) => {
            const pack = SWITCH_PROFILES[id];
            const isSelected = activePack === id;
            const isPlaying = playingPreview === id;

            return (
              <div
                key={id}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-150 ${
                  isSelected
                    ? 'bg-zinc-900/90 border-zinc-600 ring-1 ring-zinc-700 shadow-xl'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div>
                  {/* Category & Pitch Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <SwitchIcon
                        id={id}
                        className="w-4 h-4 shrink-0"
                        style={{ color: pack.color }}
                      />
                      <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                        {pack.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-950/80">
                      {pack.pitch}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-bold text-zinc-100 mb-0.5">
                    {pack.name}
                  </h3>
                  <p className="text-[11px] font-medium text-amber-400/90 mb-3 font-mono">
                    {pack.tagline}
                  </p>

                  {/* Prompt Text Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                {/* Specs and Audition Button */}
                <div className="mt-5 pt-3.5 border-t border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>{pack.actuation}</span>
                    <span>{pack.loudness}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => previewSwitch(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                        isPlaying
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      <Play className={`w-3 h-3 ${isPlaying ? 'fill-zinc-950' : 'fill-zinc-300'}`} />
                      <span>{isPlaying ? 'Playing...' : 'Audition'}</span>
                    </button>

                    <Link
                      href="/test"
                      onClick={() => setActivePack(id)}
                      className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
                      title="Type with this switch in test"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* 4. Deep-Dive Architecture & Feature Guide (#learn-more) */}
      <section id="learn-more" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-zinc-800/70">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Studio Architecture & Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            How THOCKTYPE Works: Features & Triggers
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Everything inside the platform is built for home-row speed, authentic acoustic immersion, and zero-distraction typing.
          </p>
        </div>

        {/* 3 Comprehensive Feature Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pillar 1: Zen Focus Mode */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-zinc-800 text-amber-400 font-semibold border border-zinc-700">
                  Distraction Free
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-100">Zen Focus Engine</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  A high-velocity typing sanctuary. Eliminates all headers, navigation elements, score counters, and peripheral animations so your eyes remain locked on the text caret.
                </p>
              </div>

              {/* What It Includes */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="text-[11px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                  Features Included:
                </div>
                <ul className="text-xs text-zinc-300 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span><strong>Full-Screen Lock:</strong> Press F11 or tap Fullscreen for pure edge-to-edge text.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span><strong>Flexible Modes:</strong> Choose 15s, 30s, 60s, or pure Unlimited endurance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span><strong>Direct Visit Setup:</strong> Visiting <code className="text-amber-400 font-mono">/focus</code> directly presents a tactile configuration card.</span>
                  </li>
                </ul>
              </div>

              {/* How to Trigger */}
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                  How to Trigger:
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">Global Shortcut</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">Alt + F</kbd>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">Direct Route</span>
                  <span className="text-zinc-400">/focus</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">Finish Session</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">Esc</kbd>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-zinc-800/80">
              <Link
                href="/focus"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Launch Zen Focus (Alt + F)</span>
              </Link>
            </div>
          </div>

          {/* Pillar 2: Sound Studio & Acoustic Scope */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Radio className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-zinc-800 text-sky-400 font-semibold border border-zinc-700">
                  Web Audio API
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-100">Sound Studio & Acoustics</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Real-time physical switch synthesis and acoustic sampling. Every press triggers dynamic stereo panning, spring release mechanics, and low-end deskmat resonance.
                </p>
              </div>

              {/* What It Includes */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="text-[11px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                  Features Included:
                </div>
                <ul className="text-xs text-zinc-300 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-0.5">•</span>
                    <span><strong>8 Switch Personalities:</strong> Linear, clicky, tactile, and muted sound signatures.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-0.5">•</span>
                    <span><strong>Spatial Stereo Panning:</strong> Left-hand keys pan subtly to left ear; right-hand keys pan right.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 mt-0.5">•</span>
                    <span><strong>Return Spring & Deskmat:</strong> Toggle key release tick and deskmat acoustic damping.</span>
                  </li>
                </ul>
              </div>

              {/* How to Trigger */}
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                  How to Trigger:
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">Hot-Swap Switches</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-sky-400 font-bold">Alt + 1..8</kbd>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">Volume Tuning</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">Alt + ↑ / ↓</kbd>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">Sound Lab Page</span>
                  <span className="text-zinc-400">/sounds</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-zinc-800/80">
              <Link
                href="/sounds"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>Explore Sound Studio (Alt + S)</span>
              </Link>
            </div>
          </div>

          {/* Pillar 3: Integrated Shortcut Engine */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <KeyboardIcon className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-zinc-800 text-emerald-400 font-semibold border border-zinc-700">
                  Global Hotkeys
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-100">Integrated Shortcuts</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Total home-row efficiency. Never lift your wrists to reach for a mouse. Every feature has a direct, globally intercepted keyboard shortcut.
                </p>
              </div>

              {/* What It Includes */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="text-[11px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                  Features Included:
                </div>
                <ul className="text-xs text-zinc-300 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong>Instant Test Restart:</strong> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono">Tab + Enter</kbd> restarts instantly without mouse.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong>HUD Toast Overlay:</strong> Visual feedback pops up in real time when any hotkey triggers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong>Quick Cheat Sheet:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono">?</kbd> anywhere to open instant overlay.</span>
                  </li>
                </ul>
              </div>

              {/* How to Trigger */}
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                  Key Command List:
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">Restart Benchmark</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-emerald-400 font-bold">Tab + Enter</kbd>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">Difficulty Mode</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">Alt + M</kbd>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">Cheat Sheet Modal</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">?</kbd>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-zinc-800/80">
              <Link
                href="/shortcuts"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <KeyboardIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Full Shortcuts Deck</span>
              </Link>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
