'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { SwitchIcon } from '@/components/SwitchIcon';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  Sliders,
  Sparkles,
  Flame,
  Radio,
  Keyboard,
  X
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

export function Header() {
  const pathname = usePathname();
  const {
    activePack,
    setActivePack,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    options,
    updateOptions,
    playKey
  } = useSound();

  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);

  const switchMenuRef = useRef<HTMLDivElement>(null);
  const audioMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switchMenuRef.current && !switchMenuRef.current.contains(event.target as Node)) {
        setIsSwitchMenuOpen(false);
      }
      if (audioMenuRef.current && !audioMenuRef.current.contains(event.target as Node)) {
        setIsAudioMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide in Focus / Zen mode
  if (pathname?.startsWith('/focus')) {
    return null;
  }

  const currentProfile = SWITCH_PROFILES[activePack];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Custom Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="THOCKTYPE Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-zinc-100 group-hover:text-amber-400 transition-colors">
            THOCKTYPE
          </span>
        </Link>

        {/* Center: Clean Nav Links */}
        <nav className="flex items-center gap-1 text-xs font-medium text-zinc-400">
          <Link
            href="/test"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              pathname === '/test'
                ? 'bg-zinc-800/90 text-amber-400 font-semibold'
                : 'hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span><span className="hidden sm:inline">Typing </span>Test</span>
          </Link>
          <Link
            href="/sounds"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              pathname === '/sounds'
                ? 'bg-zinc-800/90 text-amber-400 font-semibold'
                : 'hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span><span className="hidden sm:inline">Sound </span>Lab</span>
          </Link>
          <Link
            href="/#lineup"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg hover:text-zinc-200 hover:bg-zinc-900/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
            <span>Lineup</span>
          </Link>
        </nav>

        {/* Right: Clean Compact Controls (Switch Selector + Sound Popover) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* 1. Compact Switch Selector Pill */}
          <div className="relative" ref={switchMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsSwitchMenuOpen(!isSwitchMenuOpen);
                setIsAudioMenuOpen(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs text-zinc-200 transition-all shadow-sm cursor-pointer"
              title="Change mechanical switch sound"
            >
              <SwitchIcon
                id={activePack}
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: currentProfile?.color }}
              />
              <span className="font-semibold text-zinc-200 text-xs max-w-[65px] xs:max-w-[100px] sm:max-w-[130px] truncate">
                {currentProfile?.name}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            {/* Switch Selection Popover */}
            {isSwitchMenuOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-72 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[80vh] overflow-y-auto">
                <div className="px-2.5 py-1.5 mb-1.5 flex items-center justify-between border-b border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Select Mechanical Switch
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSwitchMenuOpen(false)}
                    className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {PACK_IDS.map((id) => {
                    const pack = SWITCH_PROFILES[id];
                    const isSelected = activePack === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setActivePack(id);
                          setIsSwitchMenuOpen(false);
                          playKey('KeyF', id);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-100 font-semibold ring-1 ring-zinc-700'
                            : 'text-zinc-300 hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <SwitchIcon
                            id={id}
                            className="w-4 h-4 shrink-0"
                            style={{ color: pack.color }}
                          />
                          <div>
                            <div className="text-zinc-100 text-xs font-medium">{pack.name}</div>
                            <div className="text-[10px] text-zinc-500">{pack.pitch} • {pack.loudness}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${pack.badgeBg}`}>
                          {pack.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Sound Icon Button (Opens Floating Audio Control Panel) */}
          <div className="relative" ref={audioMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsAudioMenuOpen(!isAudioMenuOpen);
                setIsSwitchMenuOpen(false);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isAudioMenuOpen
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-md'
                  : 'bg-zinc-900/80 hover:bg-zinc-800/80 border-zinc-800 text-zinc-300'
              }`}
              title="Open audio & volume settings"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Audio Controls Popover */}
            {isAudioMenuOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-72 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Audio & Acoustics</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAudioMenuOpen(false)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Volume Slider & Mute Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Master Volume</span>
                    <span className="text-amber-400 font-bold">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-zinc-300" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 accent-amber-500 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Live Mini Spectrum Visualizer */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-zinc-400">Audio Spectrum</span>
                  <AudioVisualizer height={26} />
                </div>

                {/* Keyup Return & Deskmat Toggles */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px]">Key Release Tick</span>
                    <button
                      type="button"
                      onClick={() => updateOptions({ playKeyUp: !options.playKeyUp })}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        options.playKeyUp ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {options.playKeyUp ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px]">Deskmat Resonance</span>
                    <button
                      type="button"
                      onClick={() => updateOptions({ deskmatResonance: !options.deskmatResonance })}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        options.deskmatResonance ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {options.deskmatResonance ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
