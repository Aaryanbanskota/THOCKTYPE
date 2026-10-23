'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { Volume2, VolumeX, Keyboard, Radio, Flame, Sparkles, ChevronDown } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

export function Header() {
  const pathname = usePathname();
  const { activePack, setActivePack, volume, setVolume, isMuted, toggleMute, playKey } = useSound();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Hide in Focus / Zen mode
  if (pathname?.startsWith('/focus')) {
    return null;
  }

  const currentProfile = SWITCH_PROFILES[activePack];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200 border border-amber-300/40">
            <Keyboard className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-zinc-100 group-hover:text-amber-400 transition-colors">
                THOCKTYPE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono tracking-tight hidden sm:inline">
              Mechanical Sound & Typing Studio
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/60">
          <Link
            href="/test"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              pathname === '/test'
                ? 'bg-zinc-800 text-amber-400 shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Typing Test</span>
          </Link>
          <Link
            href="/sounds"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              pathname === '/sounds'
                ? 'bg-zinc-800 text-amber-400 shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Sound Lab</span>
          </Link>
          <Link
            href="/#lineup"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Switch Lineup</span>
          </Link>
        </nav>

        {/* Sound Switcher + Volume Control */}
        <div className="flex items-center gap-3">
          
          {/* Mini Visualizer */}
          <div className="hidden lg:block w-24">
            <AudioVisualizer height={28} />
          </div>

          {/* Quick Sound Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-200 text-xs font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              aria-label="Select keyboard sound pack"
            >
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-zinc-900"
                style={{ backgroundColor: currentProfile?.color }}
              />
              <span className="font-semibold text-zinc-100">{currentProfile?.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono px-1 py-0.2 bg-zinc-800 rounded">
                {currentProfile?.category}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 mb-1 border-b border-zinc-800">
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Select Mechanical Switch
                    </p>
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
                            setIsDropdownOpen(false);
                            playKey('KeyF', id);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                            isSelected
                              ? 'bg-zinc-800 text-zinc-100 font-semibold ring-1 ring-zinc-700'
                              : 'text-zinc-300 hover:bg-zinc-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: pack.color }}
                            />
                            <div>
                              <div className="text-zinc-100 font-medium">{pack.name}</div>
                              <div className="text-[10px] text-zinc-400">{pack.pitch} Pitch • {pack.loudness}</div>
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
              </>
            )}
          </div>

          {/* Volume Slider & Mute Button */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
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
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 h-1.5 accent-amber-500 bg-zinc-800 rounded-lg cursor-pointer"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              aria-label="Keyboard volume control"
            />
          </div>

        </div>
      </div>
    </header>
  );
}
