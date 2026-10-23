import React from 'react';
import Link from 'next/link';
import { Keyboard, Headphones, Cpu, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-800/60">
          
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Keyboard className="w-3.5 h-3.5" />
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
                <span>Reset / Pause</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 rounded text-zinc-300">Esc</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Switch Sounds</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 rounded text-zinc-300">Dropdown</kbd>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Explore</h4>
            <ul className="text-xs space-y-1.5">
              <li>
                <Link href="/test" className="hover:text-amber-400 transition-colors">
                  Typing Speed & Accuracy Test
                </Link>
              </li>
              <li>
                <Link href="/sounds" className="hover:text-amber-400 transition-colors">
                  Interactive Sound Lab & Tester
                </Link>
              </li>
              <li>
                <Link href="/#lineup" className="hover:text-amber-400 transition-colors">
                  The Eight Sound Personalities
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 THOCKTYPE • Open mechanical typing laboratory. No sign-up required.</p>
          <div className="flex items-center gap-4">
            <Link href="/test" className="hover:text-zinc-300">Typing Test</Link>
            <span>•</span>
            <Link href="/sounds" className="hover:text-zinc-300">Sound Lab</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
