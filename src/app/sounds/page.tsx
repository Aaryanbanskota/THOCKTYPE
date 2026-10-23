'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { SoundPackId } from '@/types/sound';
import {
  Radio,
  Sliders,
  Volume2,
  Sparkles,
  Play,
  ArrowRight,
  Headphones,
  CheckCircle2,
  Flame
} from 'lucide-react';

export default function SoundLabPage() {
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
      
      {/* Page Title & Subtitle */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-3 shadow-sm">
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>Mechanical Sound Laboratory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight">
          Acoustic Switch Studio
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
          Sample and tweak the eight mechanical switch personalities. Press keys on your physical keyboard or click virtual keys to hear authentic bottom-outs, spring releases, and stabilizer physics.
        </p>
      </div>

      {/* Switch Selector Tabs */}
      <div className="w-full flex flex-wrap justify-center gap-2 mb-8 p-2 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isSelected
                  ? 'bg-zinc-800 text-zinc-100 shadow-xl border border-zinc-700 scale-105'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
              style={{
                borderColor: isSelected ? pack.color : undefined,
                boxShadow: isSelected ? `0 0 16px ${pack.color}25` : undefined
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: pack.color }}
              />
              <span>{pack.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono">({pack.category})</span>
            </button>
          );
        })}
      </div>

      {/* Active Switch Showcase Card & Spectrum Visualizer */}
      <div className="w-full max-w-4xl p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-md"
                style={{ backgroundColor: currentProfile?.color }}
              />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">
                {currentProfile?.category} Switch Profile
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${currentProfile?.badgeBg}`}>
                {currentProfile?.pitch} Pitch
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {currentProfile?.name}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-amber-400 mt-1">
              {currentProfile?.tagline}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleTestMelody(activePack)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 shadow-md transition-all active:scale-95"
            >
              <Play className={`w-3.5 h-3.5 ${previewingId === activePack ? 'fill-amber-400 text-amber-400' : 'fill-zinc-300'}`} />
              <span>{previewingId === activePack ? 'Playing Rhythm...' : 'Sample Melody'}</span>
            </button>

            <Link
              href="/test"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold tracking-wide shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 fill-zinc-950" />
              <span>Type with this Switch</span>
            </Link>
          </div>
        </div>

        {/* Detailed Description */}
        <p className="mt-5 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
          {currentProfile?.description}
        </p>

        {/* Real-time Audio Spectrum */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Headphones className="w-4 h-4 text-amber-400" />
            <span>Live Frequency Response</span>
          </div>
          <div className="w-full sm:w-64">
            <AudioVisualizer height={34} barColor={currentProfile?.color} />
          </div>
        </div>
      </div>

      {/* 65% Interactive Mechanical Keyboard */}
      <div className="w-full max-w-4xl mb-12">
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 text-center">
          Interactive Keyboard Tester • Press any key on your keyboard
        </div>
        <VirtualKeyboard interactiveGlobal={true} />
      </div>

      {/* Acoustic Settings Studio */}
      <div className="w-full max-w-4xl p-6 sm:p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 shadow-xl mb-16">
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800 mb-6">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-zinc-200">Acoustic Physics & Engine Tuning</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Pitch Shift Slider */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-zinc-300 font-semibold">Switch Pitch Tuning</span>
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
            <p className="text-[11px] text-zinc-400">
              Adjusts the switch resonant frequency higher or deeper.
            </p>
          </div>

          {/* Master Volume */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-zinc-300 font-semibold">Master Audio Volume</span>
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
            <p className="text-[11px] text-zinc-400">
              Web Audio master gain level.
            </p>
          </div>

          {/* Upstroke / Key Release Sound */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-4">
            <div>
              <span className="text-zinc-200 font-semibold block">Key Release (Upstroke)</span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Emits mechanical switch stem spring reset upon key release.
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

          {/* Deskmat Acoustic Resonance */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-4">
            <div>
              <span className="text-zinc-200 font-semibold block">Deskmat Resonance</span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Simulates low-end dampening of a 4mm neoprene desk mat.
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

      {/* Switch Lineup Comparison Table */}
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-zinc-100">Switch Comparison Matrix</h3>
          <p className="text-xs text-zinc-400 mt-1">Detailed specifications for all eight acoustic switch profiles</p>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Switch Pack</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Acoustic Pitch</th>
                <th className="py-3.5 px-4">Actuation</th>
                <th className="py-3.5 px-4">Loudness</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {PACK_IDS.map((id) => {
                const pack = SWITCH_PROFILES[id];
                const isCurrent = activePack === id;
                return (
                  <tr key={id} className={`hover:bg-zinc-800/30 transition-colors ${isCurrent ? 'bg-zinc-800/20' : ''}`}>
                    <td className="py-3.5 px-4 font-sans font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pack.color }} />
                      <span className="text-zinc-100">{pack.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${pack.badgeBg}`}>
                        {pack.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">{pack.pitch}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{pack.actuation}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{pack.loudness}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setActivePack(id);
                          playKey('KeyF', id);
                        }}
                        className={`px-3 py-1 rounded-lg text-[11px] font-sans font-semibold transition-all ${
                          isCurrent
                            ? 'bg-amber-400 text-zinc-950 font-bold'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {isCurrent ? 'Active' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
