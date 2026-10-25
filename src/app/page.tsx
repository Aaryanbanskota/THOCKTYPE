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
  ChevronDown,
  Infinity as InfinityIcon
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
    <div className="w-full max-w-full flex flex-col items-center overflow-x-hidden">
      
      {/* 1. Tactical Industrial Masthead & Live Workbench */}
      <section className="relative w-full pt-8 sm:pt-14 pb-10 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Unified Product Context Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-mono text-neutral-300 mb-6 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Acoustic Mechanical Sound Lab</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400">8 Studio Profiles</span>
          <span className="text-neutral-600">•</span>
          <span className="text-amber-400/90 font-semibold">Zero Signup</span>
        </div>

        {/* Main Rhythmic Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] max-w-3xl px-2">
          Feel every keystroke. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
            Master your typing speed.
          </span>
        </h1>

        <p className="mt-4 sm:mt-5 text-xs sm:text-sm md:text-base text-neutral-400 max-w-xl leading-relaxed px-4 font-normal">
          Authentic mechanical switch soundscapes with sub-millisecond physical key tracking. Audition switch acoustics below or jump straight into a speed benchmark.
        </p>

        {/* Direct Action Hub: Strictly TWO buttons (Launch Test & Learn More) */}
        <div className="mt-7 sm:mt-8 flex items-center justify-center gap-3.5">
          <Link
            href="/test"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-zinc-950" />
            <span>Launch Test</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-zinc-950/15 text-zinc-950 text-[10px] font-mono font-bold">Alt+T</kbd>
          </Link>

          <Link
            href="/learn-more"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 font-semibold text-xs sm:text-sm tracking-wide shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Learn More</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>

        {/* 2. Interactive Mechanical Workbench */}
        <div className="mt-12 w-full flex flex-col items-center">
          
          {/* Active Switch Status Bar */}
          <div className="w-full flex items-center justify-between pb-3 px-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block animate-pulse shrink-0"
                style={{ backgroundColor: currentProfile?.color }}
              />
              <span className="text-zinc-500 font-medium">ACTIVE ACOUSTICS:</span>
              <span className="text-zinc-100 font-bold">{currentProfile?.name}</span>
              <span className="text-[11px] text-zinc-500">
                ({currentProfile?.category} • {currentProfile?.pitch} Pitch)
              </span>
            </div>

            <div className="text-[11px] text-zinc-500 hidden sm:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">Alt + 1..8</kbd>
              <span>Hot-swap switch</span>
            </div>
          </div>

          {/* Hot-Swap Switch Selector Deck */}
          <div className="w-full grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 mb-4 shadow-xl">
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
                  className={`relative flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 text-zinc-100 shadow-md ring-1 ring-zinc-700 translate-y-[1px]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                  style={{
                    borderColor: isSelected ? pack.color : undefined,
                    boxShadow: isSelected ? `0 0 14px ${pack.color}30` : undefined
                  }}
                  title={`${pack.name} (${pack.category}) — Alt + ${index + 1}`}
                >
                  <span className="absolute top-1 right-1.5 text-[9px] font-mono text-zinc-500 opacity-60">
                    {index + 1}
                  </span>
                  <SwitchIcon
                    id={id}
                    className="w-4 h-4 mb-1 shrink-0"
                    style={{ color: pack.color }}
                  />
                  <span className="truncate max-w-full text-center text-[10px] font-mono leading-tight font-semibold">
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

    </div>
  );
}
