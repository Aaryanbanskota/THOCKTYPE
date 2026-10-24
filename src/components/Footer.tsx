'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Headphones, Cpu, Sparkles, Keyboard } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide in Focus / Zen mode
  if (pathname?.startsWith('/focus')) {
    return null;
  }

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pb-8 border-b border-zinc-800/60">
          
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="THOCKTYPE Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-zinc-200 tracking-wide">THOCKTYPE</span>
              <span className="text-[11px] text-zinc-500 font-mono">v2.0</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              A studio-grade mechanical typing laboratory and sound playground. Experience authentic acoustic profiles of eight distinct mechanical switches with real-time stereo panning, spring return physics, and speed-responsive resonance.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono text-zinc-500">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                <Headphones className="w-3 h-3 text-amber-400" /> Headphones Recommended
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                <Cpu className="w-3 h-3 text-sky-400" /> Web Audio Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Zero Latency
              </span>
            </div>
          </div>

          {/* Col 2: Keyboard Shortcuts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Key Shortcuts</h4>
            <ul className="text-xs space-y-1.5 font-mono text-zinc-400">
              <li className="flex items-center justify-between">
                <span>Restart Test</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 rounded text-zinc-300">Tab + Enter</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Zen Focus</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 rounded text-zinc-300">Alt + F</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Hot-Swap</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 rounded text-zinc-300">Alt + 1..8</kbd>
              </li>
              <li className="pt-2">
                <Link
                  href="/learn-more"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-sans font-semibold transition-all hover:scale-105"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Features & Shortcuts →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation & Legal */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Compliance & Docs</h4>
            <ul className="text-xs space-y-1.5">
              <li>
                <Link href="/learn-more" className="hover:text-amber-400 transition-colors font-medium text-zinc-300">
                  Features & Architecture Guide
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy (Zero Telemetry)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/license" className="hover:text-amber-400 transition-colors">
                  MIT Open Source License
                </Link>
              </li>
              <li>
                <Link href="/shortcuts" className="hover:text-amber-400 transition-colors">
                  Interactive Key Bindings
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="text-center sm:text-left">© 2026 THOCKTYPE • Open mechanical typing laboratory. No sign-up required.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/test" className="hover:text-zinc-300">Typing Test</Link>
            <span>•</span>
            <Link href="/profile" className="text-amber-400 hover:text-amber-300 font-medium">My Profile & Growth</Link>
            <span>•</span>
            <Link href="/sounds" className="hover:text-zinc-300">Sound Lab</Link>
            <span>•</span>
            <Link href="/learn-more" className="hover:text-zinc-300">Learn More</Link>
            <span>•</span>
            <Link href="/shortcuts" className="hover:text-zinc-300">Shortcuts</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
            <span>•</span>
            <Link href="/license" className="hover:text-zinc-300">License</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
