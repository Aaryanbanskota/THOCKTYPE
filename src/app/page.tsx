'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { AudioVisualizer } from '@/components/AudioVisualizer';
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
  Layers
} from 'lucide-react';

export default function HomePage() {
  const { activePack, setActivePack, playKey } = useSound();
  const [playingPreview, setPlayingPreview] = useState<SoundPackId | null>(null);

  // Play a quick rhythmic melody of keystrokes for a specific pack
  const previewSwitch = (packId: SoundPackId) => {
    setActivePack(packId);
    setPlayingPreview(packId);

    const keys = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'Space', 'KeyJ', 'KeyK', 'KeyL', 'Enter'];
    keys.forEach((k, idx) => {
      setTimeout(() => {
        playKey(k, packId);
        if (idx === keys.length - 1) {
          setTimeout(() => setPlayingPreview(null), 200);
        }
      }, idx * 110);
    });
  };

  const currentProfile = SWITCH_PROFILES[activePack];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="relative w-full pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Glow ambient backdrop */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[140px] opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: currentProfile?.color }}
        />

        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Eight sounds. Eight personalities.</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-100 max-w-4xl leading-[1.1]">
          Feel every keystroke.{' '}
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
          >
            Hear every switch.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Authentic mechanical keyboard sound feedback directly in your browser. From razor-sharp clicks to deep, dampened thocks — test your speed and immerse in tactile acoustics.
        </p>

        {/* Hero Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/test"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Flame className="w-4 h-4 fill-zinc-950" />
            <span>Start Typing Test (60s)</span>
          </Link>

          <Link
            href="/sounds"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-semibold text-sm tracking-wide shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Interactive Sound Lab</span>
          </Link>
        </div>

        {/* Sound Switcher Strip right on Hero */}
        <div className="mt-12 w-full max-w-4xl flex flex-col items-center">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Try pressing keys or switch profiles below</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 p-2 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
            {PACK_IDS.map((id) => {
              const pack = SWITCH_PROFILES[id];
              const isActive = activePack === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActivePack(id);
                    playKey('KeyF', id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 shadow-lg border border-zinc-700 scale-105 ring-1'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                  style={{
                    borderColor: isActive ? pack.color : undefined,
                    boxShadow: isActive ? `0 0 12px ${pack.color}33` : undefined
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: pack.color }}
                  />
                  <span>{pack.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Virtual Keyboard Visualizer */}
        <div className="mt-8 w-full max-w-4xl">
          <VirtualKeyboard interactiveGlobal={true} />
        </div>

      </section>

      {/* Feature Pillars */}
      <section className="w-full py-16 bg-zinc-950 border-y border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-200">Real Switch Recordings</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No synthesised beeps. Every switch pack is recorded from authentic mechanical keyboards with dedicated multi-samples for spacebar stabilizers, returns, and keycaps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-200">Physical Actuation & Return</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Experience realistic key travel acoustics. Bottom-out on keydown and mechanical spring return on keyup, with dynamic adaptation for fast typing bursts versus slow deliberate holds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Gauge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-200">Precision Typing Diagnostics</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Flexible intervals: 15s, 30s, 60s, 90s, or unlimited. Live WPM and accuracy metrics with complete post-test scorecards and progression analytics.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* The 8 Sounds Showcase Grid */}
      <section id="lineup" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>The Acoustic Switch Lineup</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Eight sounds. Eight personalities.
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Compare acoustic profiles side by side. Click play to sample or select any pack to type on it immediately.
          </p>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACK_IDS.map((id) => {
            const pack = SWITCH_PROFILES[id];
            const isSelected = activePack === id;
            const isPlaying = playingPreview === id;

            return (
              <div
                key={id}
                className={`flex flex-col justify-between p-6 rounded-3xl bg-zinc-900/50 border transition-all duration-200 hover:-translate-y-1 ${
                  isSelected
                    ? 'border-zinc-500 bg-zinc-900/90 shadow-xl'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
                style={{
                  boxShadow: isSelected ? `0 8px 30px ${pack.color}20` : undefined
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: pack.color }}
                      />
                      <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                        {pack.category}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80">
                      {pack.pitch} Pitch
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-zinc-100 mb-1">
                    {pack.name}
                  </h3>
                  <p className="text-xs font-medium text-amber-400/90 mb-3">
                    {pack.tagline}
                  </p>

                  {/* Exact description from user prompt */}
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                {/* Specs and Play Button */}
                <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Actuation: {pack.actuation}</span>
                    <span>{pack.loudness}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => previewSwitch(id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                        isPlaying
                          ? 'bg-amber-400 text-zinc-950 font-bold scale-98 shadow-md'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      <Play className={`w-3.5 h-3.5 ${isPlaying ? 'fill-zinc-950' : 'fill-zinc-200'}`} />
                      <span>{isPlaying ? 'Playing...' : 'Test Sound'}</span>
                    </button>

                    <Link
                      href="/test"
                      onClick={() => setActivePack(id)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
                      title="Type with this sound in test"
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

      {/* Bottom CTA Banner */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Ready to test your speed?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
              Type with authentic mechanical sound.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Choose your interval — 15s, 30s, 60s, 90s, or unlimited. Instant accuracy diagnostics, zero login required.
            </p>

            <div className="pt-2">
              <Link
                href="/test"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Flame className="w-4 h-4 fill-zinc-950" />
                <span>Launch Typing Test Now</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
