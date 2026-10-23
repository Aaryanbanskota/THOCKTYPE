import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, Server, HardDrive, FileText, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | THOCKTYPE',
  description: 'ThockType privacy policy — zero cookies, zero telemetry, 100% local Web Audio processing.'
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Masthead */}
      <div className="mb-10 pb-6 border-b border-zinc-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero-Telemetry Privacy Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-mono">
          Effective Date: October 2026 • Compliant with GDPR (EU), CCPA (California), and Global Data Protection Standards
        </p>
      </div>

      {/* Highlights Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-zinc-200">No Account Required</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">We do not ask for your email, username, or passwords.</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
          <EyeOff className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-zinc-200">Zero Analytics or Trackers</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">No Google Analytics, Meta Pixels, or third-party ad scripts.</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
          <HardDrive className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-zinc-200">Local Keystroke Processing</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Your keystrokes and audio never leave your device.</div>
          </div>
        </div>
      </div>

      {/* Main Legal Content */}
      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            1. Overview and Core Philosophy
          </h2>
          <p>
            ThockType (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) is committed to absolute user privacy. Our platform is built from the ground up to operate without server-side user data collection. We do not require registration, do not collect personal identifying information (PII), and do not monetize your typing habits.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            2. Data We Do NOT Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong className="text-zinc-200">Keystroke Logging:</strong> What you type into the typing benchmark is computed in browser volatile memory (RAM) and immediately discarded when you restart or navigate away. Keystrokes are never transmitted across the network.</li>
            <li><strong className="text-zinc-200">Personal Identifiers:</strong> We do not ask for names, addresses, phone numbers, or credit card information.</li>
            <li><strong className="text-zinc-200">Audio Surveillance:</strong> We do not access your microphone. All mechanical keyboard sounds are synthesized or played back through the Web Audio API output device only.</li>
            <li><strong className="text-zinc-200">Third-Party Tracking Cookies:</strong> We do not load advertising networks, retargeting beacons, or behavioral monitoring pixels.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            3. Local Storage and Client-Side State
          </h2>
          <p>
            To deliver a seamless user experience, ThockType may save limited configuration settings in your browser&apos;s <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-mono">localStorage</code>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>Audio volume and mute preferences.</li>
            <li>Selected mechanical switch profile (e.g., Frost Click, Ruby Thock).</li>
            <li>Benchmark mode preferences (e.g., 60 seconds, Easy/Medium/Hard).</li>
          </ul>
          <p className="text-xs text-zinc-500">
            This data never leaves your computer or mobile device and can be cleared at any time through your browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            4. Compliance with International Privacy Regulations
          </h2>
          <p>
            Because we do not store, process, or sell personal data on remote servers:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong className="text-zinc-200">GDPR (EU):</strong> We process zero European citizen personal data; there are no databases, user records, or cross-border data transfers.</li>
            <li><strong className="text-zinc-200">CCPA / CPRA (California):</strong> We do not sell or share personal information with any third party under any circumstances.</li>
            <li><strong className="text-zinc-200">COPPA (Children&apos;s Online Privacy):</strong> ThockType does not target children under 13 or collect any information from minors.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            5. Changes to This Policy
          </h2>
          <p>
            If we make modifications to this policy, we will update the effective date at the top of this document. Since we do not collect email addresses, please revisit this page periodically for updates.
          </p>
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
          href="/terms"
          className="text-xs text-zinc-400 hover:text-amber-400 transition-colors font-mono"
        >
          View Terms of Service →
        </Link>
      </div>

    </div>
  );
}
