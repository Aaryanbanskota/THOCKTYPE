'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { SwitchIcon } from '@/components/SwitchIcon';
import { getLocalProfile, getTierInfo } from '@/lib/profile-storage';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  Sliders,
  Sparkles,
  Flame,
  Radio,
  Keyboard,
  Maximize2,
  Menu,
  X,
  User,
  Award,
  Trophy,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Infinity as InfinityIcon
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localUsername, setLocalUsername] = useState<string>('My Profile');
  const [highestWpm, setHighestWpm] = useState<number>(0);

  const switchMenuRef = useRef<HTMLDivElement>(null);
  const audioMenuRef = useRef<HTMLDivElement>(null);

  // Load profile info for display
  useEffect(() => {
    try {
      const p = getLocalProfile();
      if (p) {
        setLocalUsername(p.username || 'My Profile');
        setHighestWpm(p.highestWpm || 0);
      }
    } catch {}
  }, [pathname, isMobileMenuOpen]);

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

  // Close all menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSwitchMenuOpen(false);
    setIsAudioMenuOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSwitchMenuOpen(false);
        setIsAudioMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Hide in Focus / Zen mode
  if (pathname?.startsWith('/focus')) {
    return null;
  }

  const currentProfile = SWITCH_PROFILES[activePack];
  const tierInfo = getTierInfo(highestWpm);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Custom Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
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
            <span className="font-extrabold text-xs sm:text-sm tracking-wider text-zinc-100 group-hover:text-amber-400 transition-colors">
              THOCKTYPE
            </span>
          </Link>

          {/* Center: Desktop Nav Links (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-400">
            <Link
              href="/test"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/test'
                  ? 'bg-zinc-800/90 text-amber-400 font-semibold'
                  : 'hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Typing Test</span>
            </Link>
            <Link
              href="/unlimited"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/unlimited'
                  ? 'bg-zinc-800/90 text-amber-400 font-semibold'
                  : 'hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <InfinityIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlimited</span>
            </Link>
            <Link
              href="/sounds"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/sounds'
                  ? 'bg-zinc-800/90 text-amber-400 font-semibold'
                  : 'hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Sound Lab</span>
            </Link>
            <Link
              href="/focus"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/focus'
                  ? 'bg-zinc-800/90 text-amber-400 font-semibold'
                  : 'hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Zen Focus</span>
            </Link>
            <Link
              href="/badges"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/badges'
                  ? 'bg-zinc-800/90 text-amber-400 font-semibold'
                  : 'hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-zinc-500" />
              <span>Badges</span>
            </Link>
          </nav>

          {/* Right: Controls (Switch Selector + Sound Popover + Mobile Hamburger) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 1. Switch Selector Button */}
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
                <span className="font-semibold text-zinc-200 text-xs hidden sm:inline max-w-[120px] truncate">
                  {currentProfile?.name}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
              </button>

              {/* Desktop Switch Selection Popover */}
              {isSwitchMenuOpen && (
                <div className="hidden md:block absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-2 shadow-2xl z-50 max-h-[75vh] overflow-y-auto">
                  <div className="px-2.5 py-1.5 mb-1.5 flex items-center justify-between border-b border-zinc-800/80">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Select Mechanical Switch
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSwitchMenuOpen(false)}
                      className="text-zinc-500 hover:text-zinc-300 cursor-pointer p-1"
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
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-4 shadow-2xl z-50 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Audio & Acoustics</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAudioMenuOpen(false)}
                      className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
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
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
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
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold cursor-pointer ${
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
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold cursor-pointer ${
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

            {/* 3. Circular Profile Avatar Button with Dynamic Rank Ring */}
            <Link
              href="/profile"
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                tierInfo?.ringColor || 'border-zinc-800'
              } ${tierInfo?.glowColor || ''} ${
                pathname === '/profile'
                  ? 'bg-zinc-800 text-zinc-100 ring-2'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title={`Profile (${localUsername}) • Rank: ${tierInfo.name}`}
              aria-label="User Profile"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* 4. Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(true);
                setIsSwitchMenuOpen(false);
                setIsAudioMenuOpen(false);
              }}
              aria-label="Open navigation menu"
              className="md:hidden p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 cursor-pointer flex items-center gap-1.5"
            >
              <Menu className="w-5 h-5 text-amber-400" />
            </button>

          </div>

        </div>
      </header>

      {/* =========================================================================
       * FULL-SCREEN MOBILE TAKEOVER MENU (Hides hero & all background content)
       * ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] w-screen h-[100dvh] bg-[#121314] text-zinc-100 flex flex-col overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          
          {/* Top Bar of Fullscreen Mobile Menu */}
          <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="THOCKTYPE Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-xs tracking-wider text-zinc-100">
                THOCKTYPE
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 hover:bg-zinc-800 cursor-pointer shadow-md"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold">CLOSE</span>
            </button>
          </div>

          {/* Body Content of Mobile Takeover Menu */}
          <div className="flex-1 p-4 xs:p-6 space-y-6 max-w-lg mx-auto w-full">
            
            {/* User Profile Mini Banner */}
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 hover:border-zinc-700 transition-colors shadow-md group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0"
                  style={{ color: currentProfile?.color }}
                >
                  <User className="w-5 h-5 text-zinc-300" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                    <span>{localUsername}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono font-medium border border-zinc-700">
                      Guest
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    {highestWpm > 0 ? `Best: ${highestWpm} WPM • View Stats & Badges →` : 'View stats & achievements →'}
                  </div>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Primary Mobile Navigation Links */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 block">
                Menu Navigation
              </span>

              <Link
                href="/test"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-bold transition-all ${
                  pathname === '/test'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div>Typing Speed Test</div>
                    <div className="text-[11px] font-normal text-zinc-400">Standard benchmark with diagnostics</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </Link>

              <Link
                href="/unlimited"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-bold transition-all ${
                  pathname === '/unlimited'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                    <InfinityIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div>Unlimited Typing Mode</div>
                    <div className="text-[11px] font-normal text-zinc-400">Endless stream, zero countdown</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </Link>

              <Link
                href="/sounds"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-bold transition-all ${
                  pathname === '/sounds'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <div>Acoustic Sound Lab</div>
                    <div className="text-[11px] font-normal text-zinc-400">8 switches & acoustics calibration</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </Link>

              <Link
                href="/focus"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-bold transition-all ${
                  pathname === '/focus'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div>Zen Focus Mode</div>
                    <div className="text-[11px] font-normal text-zinc-400">Distraction-free minimal canvas</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </Link>

              <Link
                href="/badges"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-bold transition-all ${
                  pathname === '/badges'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div>Badges & Accolades</div>
                    <div className="text-[11px] font-normal text-zinc-400">Starter to Diamond milestone honors</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </Link>

              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-bold transition-all ${
                  pathname === '/profile'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${tierInfo.ringColor} bg-zinc-950/70 text-zinc-200`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>My Profile & Growth</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold border ${tierInfo.badgeColor}`}>
                        {tierInfo.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-normal text-zinc-400">Local charts, scores & activity log</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </Link>

              <Link
                href="/learn-more"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl border bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 text-zinc-200 text-sm font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <div>Shortcuts & Guide</div>
                    <div className="text-[11px] font-normal text-zinc-400">Hotkeys, engineering & manual</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </Link>
            </div>

            {/* Switch Quick-Picker in Mobile Menu */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Switch: {currentProfile?.name}
                </span>
                <span className="text-[10px] font-mono text-amber-400">
                  {currentProfile?.category}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
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
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 text-zinc-100 border-amber-500/50 ring-1 ring-amber-500/40 shadow-sm'
                          : 'bg-zinc-950/60 hover:bg-zinc-800/40 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <SwitchIcon
                        id={id}
                        className="w-4 h-4 mb-1 shrink-0"
                        style={{ color: pack.color }}
                      />
                      <span className="text-[10px] font-medium truncate w-full">
                        {pack.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Volume & Audio Control */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Master Volume</span>
                <span className="text-amber-400 font-bold">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2.5 accent-amber-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
       * MOBILE BOTTOM-SHEET MODAL FOR MECHANICAL SWITCH SELECTION
       * Opens when tapping switch selector on mobile screens (< 768px)
       * ========================================================================= */}
      {isSwitchMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-t-3xl bg-zinc-900 border-t border-zinc-800 p-4 pb-8 max-h-[85vh] overflow-y-auto overscroll-contain shadow-2xl space-y-3">
            
            {/* Drag Handle Bar */}
            <div className="w-12 h-1 rounded-full bg-zinc-700 mx-auto mb-1" />

            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Switch Sound Laboratory
                </span>
                <h3 className="text-base font-extrabold text-zinc-100">
                  Select Mechanical Switch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSwitchMenuOpen(false)}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
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
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-100 border-amber-500/50 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0"
                        style={{ color: pack.color }}
                      >
                        <SwitchIcon id={id} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-zinc-100">{pack.name}</div>
                        <div className="text-[11px] text-zinc-500">{pack.pitch} • {pack.loudness} • {pack.actuation}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold ${pack.badgeBg}`}>
                      {pack.category}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
