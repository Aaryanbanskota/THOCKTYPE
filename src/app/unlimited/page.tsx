import type { Metadata } from 'next';
import { TypingTest } from '@/components/TypingTest';
import Link from 'next/link';
import {
  Infinity as InfinityIcon,
  Flame,
  Volume2,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Maximize2,
  Layers,
  ArrowRight,
  HelpCircle,
  Radio,
  Keyboard
} from 'lucide-react';

const pageTitle = 'Unlimited Typing Test — Type for Unlimited Time Without Limits';
const pageDescription =
  'The best free online typing site where you can type for unlimited time. Practice typing endlessly with infinite word streaming, zero countdown timer, authentic mechanical keyboard sounds, and zero signup.';
const canonicalUrl = 'https://thocktype.com/unlimited';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'typing site where I can type for unlimited time',
    'unlimited typing test',
    'infinite typing test',
    'endless typing test',
    'typing test without timer',
    'typing test unlimited time',
    'type forever typing site',
    'free continuous typing practice',
    'zen typing test',
    'mechanical keyboard typing test unlimited',
    'monkeytype unlimited alternative',
    'typelouder unlimited'
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    siteName: 'THOCKTYPE',
    type: 'website',
    images: [
      {
        url: '/banner.svg',
        width: 1200,
        height: 630,
        alt: 'THOCKTYPE Unlimited Typing Test — Type Forever Without Time Limits',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: ['/banner.svg'],
  },
};

const unlimitedJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where can I find a typing site where I can type for unlimited time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'THOCKTYPE Unlimited (https://thocktype.com/unlimited) allows you to type for unlimited time with zero time limits, zero countdowns, and an endless stream of words accompanied by realistic mechanical keyboard sound effects.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the unlimited typing test work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In Unlimited mode, words are generated continuously as you type. There is no countdown or time limit. You can practice typing for as long as you want, and finish your session at any moment by clicking "Finish Session" or pressing the Escape key to view your full benchmark analysis.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why should I practice typing without a timer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Typing without a countdown timer eliminates performance anxiety and rushed keystrokes. It allows typists to develop natural cadence, steady muscle memory, ergonomic rhythm, and sustained typing endurance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I change mechanical keyboard sounds during an unlimited session?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! You can hot-swap between 8 authentic switch acoustic profiles (including Holy Panda, Cherry MX Blue, Gateron Ink Black, Topre, and NovelKeys Cream) using the switch selector on the toolbar or via shortcuts Alt+1 through Alt+8.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is THOCKTYPE Unlimited completely free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, THOCKTYPE is 100% free with zero ads, zero signup, and zero tracking. All your stats and milestone badges are preserved privately in your browser storage.',
      },
    },
  ],
};

export default function UnlimitedPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(unlimitedJsonLd) }}
      />

      <div className="w-full max-w-full flex-1 flex flex-col items-center px-3 sm:px-6 lg:px-8 py-6 sm:py-10 overflow-x-hidden">
        
        {/* Masthead Header */}
        <section className="w-full max-w-4xl text-center mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 font-bold shadow-sm">
              <InfinityIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>UNLIMITED MODE</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-sm">
              Zero Time Limits
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold shadow-sm">
              Endless Word Stream
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
            Type For Unlimited Time.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Practice typing continuously with no timer, no countdown, and no limits. Enjoy an endless word stream paired with 8 authentic mechanical keyboard switch sounds. Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono">Esc</kbd> anytime to calculate your score.
          </p>
        </section>

        {/* Live Typing Test Pre-configured to Unlimited Mode */}
        <div className="w-full max-w-4xl mb-14">
          <TypingTest initialMode="unlimited" />
        </div>

        {/* SEO & Knowledge Architecture Section */}
        <div className="w-full max-w-4xl border-t border-zinc-800/80 pt-12 space-y-12">
          
          {/* Feature Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <InfinityIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100">Zero Time Restrictions</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Unlike 60-second typing tests that force frantic sprinting, Unlimited Mode lets you focus on posture, accuracy, and rhythmic cadence at your own natural tempo.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100">8 Mechanical Switch Sounds</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Immerse yourself with authentic audio recordings of Holy Panda, Cherry MX Blue, Gateron Ink Black, and Topre switches with spatial stereo panning and spring return resonance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100">100% Private & Free</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Zero signups, zero tracking, and zero ads. Your personal bests, streaks, and milestone badges are saved locally and securely inside your browser storage.
              </p>
            </div>
          </section>

          {/* Detailed Editorial Guide: Why Unlimited Typing Test? */}
          <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Typing Mastery Philosophy</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Why typing without a timer produces faster, more consistent typists
            </h2>
            <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
              <p>
                Most conventional typing tests enforce 15, 30, or 60-second sprints. While sprints test maximum burst speed, they frequently create artificial tension, leading typists to sacrifice accuracy, rush through mistakes, and build erratic keystroke habits.
              </p>
              <p>
                In contrast, <strong>unlimited time typing</strong> provides the low-stress environment required to rewire muscle memory. By removing the ticking clock, you allow your brain to settle into a fluid flow state where your fingers learn precise actuation distance, consistent hand positioning, and uniform rhythmic cadence.
              </p>
              <p>
                With THOCKTYPE’s endless word stream algorithm, you will never encounter sudden buffer stops or word exhaustion. Type for two minutes or two hours — whenever you are satisfied, press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono">Escape</kbd> or click <em>Finish Session</em> to receive your comprehensive Net WPM, Raw WPM, accuracy, and keystroke consistency diagnosis.
              </p>
            </div>
          </section>

          {/* Semantic FAQ Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Everything about Unlimited Typing Practice
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-200">
                  Can I type for hours without interruption?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Yes. THOCKTYPE continuously loads new word buffers seamlessly in the background as you type, allowing you to practice endlessly without pauses or resets.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-200">
                  How do I end the session and view my WPM?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Simply press the <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono">Esc</kbd> key or click the &quot;Finish Session&quot; button beneath the typing area. Your full benchmark report and consistency index will appear immediately.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-200">
                  What switch sounds are available?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  You can choose between 8 sound profiles: Frost Click (Cherry MX Blue), Ruby Thock (Holy Panda), Midnight Thock (Gateron Ink Black), Cream Clack (NovelKeys Cream), Chestnut Mute, Glacier Pop, Onyx Deep (Topre), and Alpine Clack.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-200">
                  Can I use full-screen distraction-free mode?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Yes! Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono">Alt + F</kbd> or click Zen Focus on the toolbar to open a pure, full-screen textbox without any navigation or visual clutter.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Links Banner */}
          <section className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300">
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>Looking for timed sprints or custom text practice?</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/test" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
                Standard Test →
              </Link>
              <span className="text-zinc-600">•</span>
              <Link href="/focus" className="text-zinc-400 hover:text-zinc-200 transition-colors">
                Zen Focus →
              </Link>
              <span className="text-zinc-600">•</span>
              <Link href="/sounds" className="text-zinc-400 hover:text-zinc-200 transition-colors">
                Sound Lab →
              </Link>
            </div>
          </section>

        </div>

      </div>
    </>
  );
}
