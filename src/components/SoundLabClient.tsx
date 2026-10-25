'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { SwitchIcon } from '@/components/SwitchIcon';
import { SoundPackId } from '@/types/sound';
import {
  Radio,
  Sliders,
  Play,
  ArrowRight,
  Headphones,
  Flame,
  Volume2,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';

export default function SoundLabClient() {
  const {
    activePack,
    setActivePack,
    volume,
    setVolume,
    options,
    updateOptions,
    playKey
  } = useSound();

  const [previewingId, setPreviewingId] = useState<SoundPackId | null>(null);

  const currentProfile = SWITCH_PROFILES[activePack];

  const handleTestMelody = (packId: SoundPackId) => {
    setActivePack(packId);
    setPreviewingId(packId);

    const pattern = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'Space', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'Enter'];
    pattern.forEach((code, i) => {
      setTimeout(() => {
        playKey(code, packId);
        if (i === pattern.length - 1) {
          setTimeout(() => setPreviewingId(null), 250);
        }
      }, i * 115);
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col items-center overflow-x-hidden">
      
      {/* Studio Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-3 shadow-sm">
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>Acoustic Mastering & Switch Lab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
          Mechanical Switch Studio
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Select any switch module below to inspect its acoustic signature, calibrate deskmat resonance, and audition multi-sample keystrokes.
        </p>
      </div>

      {/* 1. Hot-Swap Switch Deck: 8 Modular Cards */}
      <div className="w-full grid grid-cols-2 xs:grid-cols-4 lg:grid-cols-8 gap-2 mb-6 sm:mb-8">
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
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-800/90 border-zinc-600 ring-2 ring-amber-500/30 shadow-lg scale-102'
                  : 'bg-zinc-900/40 hover:bg-zinc-800/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <SwitchIcon
                id={id}
                className="w-4 h-4 mb-2 shrink-0"
                style={{ color: pack.color }}
              />
              <span className="font-semibold text-xs text-zinc-100 truncate w-full">
                {pack.name}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {pack.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Active Switch Spotlight Card */}
      <div className="w-full p-4 xs:p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900/50 border border-zinc-800 shadow-xl mb-8 relative overflow-hidden">
        
        {/* Subtle accent glow */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[100px] opacity-15 pointer-events-none"
          style={{ backgroundColor: currentProfile?.color }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <SwitchIcon
                id={activePack}
                className="w-4 h-4 shrink-0"
                style={{ color: currentProfile?.color }}
              />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                {currentProfile?.category} Profile
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${currentProfile?.badgeBg}`}>
                {currentProfile?.pitch} Pitch
              </span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {currentProfile?.name}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-amber-400 mt-0.5">
              {currentProfile?.tagline}
            </p>
          </div>

          {/* Quick Audition & Play in Test CTAs */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleTestMelody(activePack)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${previewingId === activePack ? 'fill-amber-400 text-amber-400' : 'fill-zinc-300'}`} />
              <span>{previewingId === activePack ? 'Auditioning...' : 'Audition Cadence'}</span>
            </button>

            <Link
              href="/test"
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold tracking-wide shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 fill-zinc-950" />
              <span>Type with this Switch</span>
            </Link>
          </div>
        </div>

        {/* Detailed Personality Narrative */}
        <div className="py-5 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs border-b border-zinc-800/80">
          <div className="md:col-span-2">
            <span className="text-zinc-500 font-mono block mb-1">ACOUSTIC BEHAVIOR</span>
            <p className="text-zinc-300 leading-relaxed text-sm">
              {currentProfile?.description}
            </p>
          </div>

          <div className="space-y-2 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/60 font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Actuation:</span>
              <span className="text-zinc-200 font-bold">{currentProfile?.actuation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Bottom-Out:</span>
              <span className="text-zinc-200 font-bold">{currentProfile?.bottomOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Acoustic Loudness:</span>
              <span className="text-zinc-200 font-bold">{currentProfile?.loudness}</span>
            </div>
          </div>
        </div>

        {/* Live Audio Visualizer Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Keystroke Frequency Response</span>
          </div>
          <div className="w-full sm:w-64">
            <AudioVisualizer height={28} barColor={currentProfile?.color} />
          </div>
        </div>

      </div>

      {/* 3. Studio Keyboard Console */}
      <div className="w-full mb-10">
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2.5 text-center">
          Interactive Keyboard Console • Press any key to test acoustics
        </div>
        <VirtualKeyboard interactiveGlobal={true} />
      </div>

      {/* 4. Acoustic Calibration Hardware Rack */}
      <div className="w-full p-6 sm:p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800 mb-12">
        <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 mb-5">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-zinc-200">Acoustic Tuning & DSP Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          
          {/* Pitch Tuning */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-zinc-300 font-semibold">Resonant Pitch Multiplier</span>
              <span className="text-amber-400 font-bold">{options.pitchShift.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.02"
              value={options.pitchShift}
              onChange={(e) => updateOptions({ pitchShift: parseFloat(e.target.value) })}
              className="w-full h-1.5 accent-amber-500 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-zinc-500">
              Tunes switch housing acoustic resonance higher or lower.
            </p>
          </div>

          {/* Volume Gain */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-zinc-300 font-semibold">Master Audio Gain</span>
              <span className="text-amber-400 font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 accent-amber-500 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-zinc-500">
              Global output volume sent to browser audio destination.
            </p>
          </div>

          {/* Keyup Physics */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-4">
            <div>
              <span className="text-zinc-200 font-semibold block">Keyup Spring Reset Tick</span>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Simulates switch stem top-out return on key release.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateOptions({ playKeyUp: !options.playKeyUp })}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                options.playKeyUp
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {options.playKeyUp ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Deskmat Low-Shelf */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-4">
            <div>
              <span className="text-zinc-200 font-semibold block">Deskmat Low-Shelf Dampening</span>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Low-frequency warm boost simulating 4mm thick neoprene deskmat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateOptions({ deskmatResonance: !options.deskmatResonance })}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                options.deskmatResonance
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {options.deskmatResonance ? 'ON' : 'OFF'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
