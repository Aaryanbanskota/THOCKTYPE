'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { SoundPackId } from '@/types/sound';
import {
  Flame,
  Radio,
  Play,
  Volume2,
  Sparkles,
  ArrowRight,
  Headphones,
  Zap,
  Gauge,
  SlidersHorizontal
} from 'lucide-react';

export default function HomePage() {
  const { activePack, setActivePack, playKey } = useSound();
  const [playingPreview, setPlayingPreview] = useState<SoundPackId | null>(null);

  // Play a natural keystroke sequence for a switch preview
  const previewSwitch = (packId: SoundPackId) => {
    setActivePack(packId);
    setPlayingPreview(packId);

    const keys = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'Space', 'KeyJ', 'KeyK', 'KeyL', 'Enter'];
    keys.forEach((k, idx) => {
      setTimeout(() => {
        playKey(k, packId);
        if (idx === keys.length - 1) {
          setTimeout(() => setPlayingPreview(null), 250);
        }
      }, idx * 115);
    });
  };

  const currentProfile = SWITCH_PROFILES[activePack];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. Hero Section */}
      <section className="relative w-full pt-14 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Ambient atmospheric glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] rounded-full blur-[150px] opacity-15 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: currentProfile?.color }}
        />

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Eight sounds. Eight personalities.</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 max-w-3xl leading-[1.12]">
          Feel every keystroke.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
            Hear every switch.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
          Authentic mechanical keyboard acoustics right in your browser. Multi-sample recordings, physical spring return physics, and speed-responsive resonance.
        </p>

        {/* Clean Primary Actions */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/test"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Flame className="w-4 h-4 fill-zinc-950" />
            <span>Start Typing Test (60s)</span>
          </Link>

          <Link
            href="/sounds"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-semibold text-xs sm:text-sm tracking-wide shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Acoustic Sound Lab</span>
          </Link>
        </div>

        {/* 2. Interactive Keyboard Testbench with Integrated Switch Dock */}
        <div className="mt-12 w-full max-w-4xl flex flex-col items-center">
          
          {/* Integrated Switch Dock along top of keyboard */}
          <div className="w-full flex items-center justify-between pb-3 px-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>HOT-SWAP SWITCH:</span>
              <span className="text-zinc-200 font-bold">{currentProfile?.name}</span>
            </div>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Press any key on your keyboard to hear
            </span>
          </div>

          {/* Switch Selector Strip integrated directly with keyboard */}
          <div className="w-full grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 mb-3 backdrop-blur-sm shadow-md">
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
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-zinc-800 text-zinc-100 shadow-md ring-1 ring-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                  style={{
                    borderColor: isSelected ? pack.color : undefined
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full mb-1"
                    style={{ backgroundColor: pack.color }}
                  />
                  <span className="truncate max-w-full text-center leading-tight">
                    {pack.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live Virtual Mechanical Keyboard */}
          <VirtualKeyboard interactiveGlobal={true} />

        </div>

      </section>

      {/* 3. The 8 Switch Personalities Showcase Grid */}
      <section id="lineup" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/60">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Sound Profiles</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Eight sounds. Eight personalities.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            Compare acoustic dynamics side by side. Click test sound to audition each profile.
          </p>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PACK_IDS.map((id) => {
            const pack = SWITCH_PROFILES[id];
            const isSelected = activePack === id;
            const isPlaying = playingPreview === id;

            return (
              <div
                key={id}
                className={`flex flex-col justify-between p-5 rounded-2xl bg-zinc-900/40 border transition-all duration-200 hover:bg-zinc-900/70 ${
                  isSelected
                    ? 'border-zinc-500 ring-1 ring-zinc-700 shadow-xl'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
                style={{
                  boxShadow: isSelected ? `0 6px 24px ${pack.color}20` : undefined
                }}
              >
                <div>
                  {/* Category & Pitch Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: pack.color }}
                      />
                      <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                        {pack.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80">
                      {pack.pitch} Pitch
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-bold text-zinc-100 mb-0.5">
                    {pack.name}
                  </h3>
                  <p className="text-[11px] font-medium text-amber-400/90 mb-3">
                    {pack.tagline}
                  </p>

                  {/* Description from prompt */}
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                {/* Specs and Play Action */}
                <div className="mt-5 pt-3.5 border-t border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>{pack.actuation}</span>
                    <span>{pack.loudness}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => previewSwitch(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                        isPlaying
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      <Play className={`w-3 h-3 ${isPlaying ? 'fill-zinc-950' : 'fill-zinc-300'}`} />
                      <span>{isPlaying ? 'Auditioning...' : 'Test Sound'}</span>
                    </button>

                    <Link
                      href="/test"
                      onClick={() => setActivePack(id)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
                      title="Type with this switch in typing test"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* 4. Feature Pillars */}
      <section className="w-full py-14 bg-zinc-950/80 border-t border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Headphones className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-200">Real Switch Multi-Samples</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Authentic switch recordings with dedicated files for spacebar stabilizers, return keys, and alphanumerics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-200">Actuation & Spring Return</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bottom-out clacks on keydown, crisp spring reset ticks on keyup, with dynamic velocity adaptation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Gauge className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-200">Precision Typing Diagnostics</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                15s, 30s, 60s, 90s, unlimited, and word target modes with complete accuracy and WPM progression scorecards.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Bottom Launch Banner */}
      <section className="w-full py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-10 text-center shadow-xl space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Ready to test your typing speed?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Choose any mechanical switch sound and start typing immediately. No account required.
          </p>
          <div className="pt-3">
            <Link
              href="/test"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Flame className="w-4 h-4 fill-zinc-950" />
              <span>Launch Typing Test Now</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
