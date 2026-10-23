'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { SwitchIcon } from '@/components/SwitchIcon';
import { SoundPackId } from '@/types/sound';
import {
  Keyboard,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Sparkles,
  Command,
  ArrowRight,
  Flame,
  Radio,
  Home
} from 'lucide-react';
import Link from 'next/link';

interface HUDNotification {
  id: number;
  message: string;
  subtext?: string;
  packId?: SoundPackId;
}

export function GlobalShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    activePack,
    setActivePack,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    playKey
  } = useSound();

  const [hud, setHud] = useState<HUDNotification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTabTimeRef = useRef<number>(0);

  const showHUD = useCallback((message: string, subtext?: string, packId?: SoundPackId) => {
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    const id = Date.now();
    setHud({ id, message, subtext, packId });
    hudTimeoutRef.current = setTimeout(() => {
      setHud((current) => (current?.id === id ? null : current));
    }, 2200);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      const isTestRoute = pathname === '/test' || pathname === '/focus';

      // 1. Modal Close with Esc
      if (e.key === 'Escape') {
        if (isModalOpen) {
          e.preventDefault();
          setIsModalOpen(false);
          return;
        }
      }

      // 2. Open Shortcuts Cheat-Sheet Modal with Shift + ? or Alt + /
      if ((e.key === '?' || (e.altKey && e.key === '/')) && !isInput) {
        e.preventDefault();
        setIsModalOpen((prev) => !prev);
        return;
      }

      // 3. Tab + Enter Restart Guard (Prevents focus escaping to other DOM elements on test pages)
      if (e.key === 'Tab' && isTestRoute) {
        lastTabTimeRef.current = Date.now();
        // Prevent default tab navigation so focus doesn't jump to navbar or explore text
        e.preventDefault();
      }

      if (e.key === 'Enter') {
        const timeSinceTab = Date.now() - lastTabTimeRef.current;
        // Trigger restart if Enter is pressed right after Tab (within 800ms) or with Shift/Ctrl
        if (isTestRoute && (timeSinceTab < 800 || e.shiftKey || e.ctrlKey)) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('thocktype:restart-test'));
          showHUD('Restarting Typing Test', 'Tab + Enter');
          return;
        }
      }

      // 4. Alt + F: Open Zen Focus Mode (Works globally on any page!)
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        window.open(`/focus?pack=${activePack}`, '_blank');
        showHUD('Opening Zen Focus Mode', 'Alt + F in new tab', activePack);
        return;
      }

      // 5. Alt + 1..8: Hot-swap mechanical switches globally
      if (e.altKey && e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key, 10) - 1;
        const targetPack = PACK_IDS[index];
        if (targetPack) {
          e.preventDefault();
          setActivePack(targetPack);
          playKey('KeyF', targetPack);
          const profile = SWITCH_PROFILES[targetPack];
          showHUD(
            `Switched to ${profile.name}`,
            `Alt + ${index + 1} • ${profile.category} (${profile.pitch} Pitch)`,
            targetPack
          );
          return;
        }
      }

      // 6. Alt + M: Toggle Mute / Unmute
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        toggleMute();
        showHUD(
          !isMuted ? 'Audio Muted' : 'Audio Unmuted',
          'Alt + M'
        );
        return;
      }

      // 7. Alt + ArrowUp / ArrowDown: Adjust Volume by 10%
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        const nextVol = Math.min(1, Math.round((volume + 0.1) * 10) / 10);
        setVolume(nextVol);
        showHUD(`Master Volume: ${Math.round(nextVol * 100)}%`, 'Alt + ↑');
        return;
      }
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        const nextVol = Math.max(0, Math.round((volume - 0.1) * 10) / 10);
        setVolume(nextVol);
        showHUD(`Master Volume: ${Math.round(nextVol * 100)}%`, 'Alt + ↓');
        return;
      }

      // 8. Alt + T: Quick Navigate to Typing Test
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        router.push('/test');
        showHUD('Navigating to Typing Test', 'Alt + T');
        return;
      }

      // 9. Alt + S: Quick Navigate to Sound Lab
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        router.push('/sounds');
        showHUD('Navigating to Sound Lab', 'Alt + S');
        return;
      }

      // 10. Alt + H: Quick Navigate to Home
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        router.push('/');
        showHUD('Navigating to Home', 'Alt + H');
        return;
      }

      // 11. Alt + K: Quick Navigate to Shortcuts Page
      if (e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        router.push('/shortcuts');
        showHUD('Navigating to Shortcuts Overview', 'Alt + K');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    pathname,
    router,
    activePack,
    setActivePack,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    playKey,
    showHUD,
    isModalOpen
  ]);

  // Expose opener for cheat sheet
  useEffect(() => {
    const onOpenModal = () => setIsModalOpen(true);
    window.addEventListener('thocktype:open-shortcuts-modal', onOpenModal);
    return () => window.removeEventListener('thocktype:open-shortcuts-modal', onOpenModal);
  }, []);

  return (
    <>
      {/* Sleek Floating HUD Notification Pill */}
      {hud && (
        <div className="fixed top-16 right-4 sm:right-8 z-[200] pointer-events-none animate-in fade-in slide-in-from-top-3 duration-150">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-zinc-700/80 shadow-2xl backdrop-blur-xl text-zinc-100">
            {hud.packId ? (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                style={{
                  backgroundColor: `${SWITCH_PROFILES[hud.packId].color}25`,
                  border: `1px solid ${SWITCH_PROFILES[hud.packId].color}50`
                }}
              >
                <SwitchIcon
                  id={hud.packId}
                  className="w-4 h-4"
                  style={{ color: SWITCH_PROFILES[hud.packId].color }}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-zinc-100 tracking-tight">
                {hud.message}
              </div>
              {hud.subtext && (
                <div className="text-[10px] font-mono text-zinc-400">
                  {hud.subtext}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quick Shortcut Cheat-Sheet Modal (Press ? anywhere) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-2xl bg-zinc-900/95 border border-zinc-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                    Keyboard Shortcuts Reference
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Global shortcuts available on every page
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcut Grid Sections */}
            <div className="mt-6 space-y-6 text-xs">
              
              {/* 1. Global Navigation */}
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-2.5">
                  1. Navigation & Modes
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Open Zen Focus Mode</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-amber-300 font-bold">Alt + F</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Jump to Typing Test</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200">Alt + T</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Jump to Sound Lab</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200">Alt + S</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Go to Home</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200">Alt + H</kbd>
                  </div>
                </div>
              </div>

              {/* 2. Typing Test Controls */}
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400 block mb-2.5">
                  2. Typing Test Controls
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Restart Current Test</span>
                    <div className="flex items-center gap-1 font-mono">
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Tab</kbd>
                      <span>+</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Enter</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Instant Restart (Alternate)</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200">Shift + Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Finish Unlimited / Exit</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200">Esc</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Open Cheat Sheet</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200">?</kbd>
                  </div>
                </div>
              </div>

              {/* 3. Audio & Mechanical Switch Hot-Swap */}
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-2.5">
                  3. Switch Sound Hot-Swap (Alt + 1..8)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PACK_IDS.map((id, index) => {
                    const profile = SWITCH_PROFILES[id];
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-zinc-800"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <SwitchIcon id={id} className="w-3.5 h-3.5 shrink-0" style={{ color: profile.color }} />
                          <span className="text-[11px] text-zinc-300 truncate">{profile.name.split(' ')[0]}</span>
                        </div>
                        <kbd className="px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400 shrink-0">
                          Alt+{index + 1}
                        </kbd>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Global Volume Controls */}
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 block mb-2.5">
                  4. Audio & Volume Controls
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Toggle Mute</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200">Alt + M</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Volume Up (+10%)</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200">Alt + ↑</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-300">Volume Down (-10%)</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200">Alt + ↓</kbd>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer CTA */}
            <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <Link
                href="/shortcuts"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
              >
                <span>View Full Visual Keyboard Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Close (Esc)
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
