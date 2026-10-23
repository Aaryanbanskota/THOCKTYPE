import React from 'react';
import Link from 'next/link';
import { Award, Code2, Sparkles, CheckCircle2, Shield } from 'lucide-react';

export const metadata = {
  title: 'Open Source License & Attributions | THOCKTYPE',
  description: 'ThockType MIT open source license, audio recording attributions, and public repository credits.'
};

export default function LicensePage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Masthead */}
      <div className="mb-10 pb-6 border-b border-zinc-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono uppercase tracking-widest mb-3">
          <Code2 className="w-3.5 h-3.5" />
          <span>Open Source Software</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
          License & Attributions
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-mono">
          MIT License • Free to inspect, fork, modify, and deploy publicly on GitHub
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
        
        {/* MIT License Box */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            The MIT License (MIT)
          </h2>
          
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-zinc-400 leading-relaxed space-y-4">
            <p className="text-zinc-300">
              Copyright (c) 2026 THOCKTYPE Contributors
            </p>
            <p>
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the &quot;Software&quot;), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            <p>
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>
            <p className="text-zinc-500">
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.
            </p>
          </div>
        </section>

        {/* Audio Engine & Mechanical Switch Samples Attributions */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Acoustic Switch Catalog & Sound Profiles
          </h2>
          <p>
            The eight switch acoustic profiles featured in this lab (Frost Click, Ruby Thock, Chestnut Bump, Midnight Thock, Alpine Pop, Onyx Glide, Glacier Glide, and Cream Clack) are synthesized and sampled using the browser&apos;s native Web Audio API and high-fidelity mechanical keyboard recordings inspired by the TypeLouder mechanical sound catalog.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="font-semibold text-zinc-200 text-xs">Audio Processing Engine</div>
              <div className="text-[11px] text-zinc-400 mt-1">100% Client-side Web Audio API (AudioContext, GainNode, DynamicsCompressor, BiquadFilter, Convolver).</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="font-semibold text-zinc-200 text-xs">Zero External API Dependencies</div>
              <div className="text-[11px] text-zinc-400 mt-1">No remote sound APIs, no token requirements, fully functional completely offline.</div>
            </div>
          </div>
        </section>

        {/* Framework & Design Attributions */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Frameworks and Open-Source Dependencies
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong className="text-zinc-200">Next.js 16:</strong> Modern React Application Framework by Vercel.</li>
            <li><strong className="text-zinc-200">Tailwind CSS v4:</strong> Next-generation utility-first styling engine.</li>
            <li><strong className="text-zinc-200">Lucide React:</strong> Beautiful & consistent open source icons.</li>
            <li><strong className="text-zinc-200">Canvas Confetti:</strong> Performance-optimized canvas celebration particles.</li>
          </ul>
        </section>

      </div>

      {/* Back button */}
      <div className="mt-12 pt-6 border-t border-zinc-800 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-amber-400 transition-colors font-mono"
        >
          ← Return to ThockType Studio
        </Link>
        <Link
          href="/privacy"
          className="text-xs text-zinc-400 hover:text-amber-400 transition-colors font-mono"
        >
          Privacy Policy →
        </Link>
      </div>

    </div>
  );
}
