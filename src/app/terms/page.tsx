import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, AlertTriangle, Scale } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | THOCKTYPE',
  description: 'ThockType terms of service and acceptable usage guidelines.'
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Masthead */}
      <div className="mb-10 pb-6 border-b border-zinc-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
          <Scale className="w-3.5 h-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-mono">
          Last Updated: October 2026 • Governed by Open Web & Free Software Principles
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using ThockType (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may discontinue use of the website at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            2. Purpose of the Service
          </h2>
          <p>
            ThockType provides an interactive mechanical switch sound test, acoustic auditory simulator, and touch-typing benchmarking laboratory. The platform is offered free of charge without mandatory subscription or registration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            3. Disclaimer & &quot;As-Is&quot; Provision
          </h2>
          <p>
            The Service and all associated audio profiles, mechanical animations, and typing analytics are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied, including but not limited to fitness for a particular purpose or non-infringement.
          </p>
          <p className="text-xs text-zinc-500">
            Acoustic sound profiles are simulated and curated audio recordings intended for recreation, switch comparison, and typing practice; actual physical mechanical keyboard sound varies depending on your board plate, lubrication, keycaps, desk mat, and environment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            4. Permissible Usage
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>Attempt to disrupt the integrity or performance of the website or host infrastructure.</li>
            <li>Misrepresent scores generated on the platform for fraudulent or unlawful purposes.</li>
            <li>Incorporate the proprietary audio assets into commercial resale packs without attribution.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            5. Intellectual Property
          </h2>
          <p>
            The source code of ThockType is licensed under the permissive MIT Open Source License. Audio trademarks, mechanical switch names, and sound profile designations are the property of their respective creators and community curators.
          </p>
        </section>

      </div>

      {/* Back button */}
      <div className="mt-12 pt-6 border-t border-zinc-800 flex items-center justify-between">
        <Link
          href="/privacy"
          className="text-xs text-zinc-400 hover:text-amber-400 transition-colors font-mono"
        >
          ← Privacy Policy
        </Link>
        <Link
          href="/license"
          className="text-xs text-zinc-400 hover:text-amber-400 transition-colors font-mono"
        >
          View MIT License & Attributions →
        </Link>
      </div>

    </div>
  );
}
