import type { Metadata } from 'next';
import React from 'react';
import { TypingTest } from '@/components/TypingTest';

export const metadata: Metadata = {
  title: 'Typing Speed Test — Mechanical Switch Sound Benchmark',
  description:
    'Benchmark your words per minute (WPM), accuracy, and consistency with authentic mechanical keyboard switch audio (thock & clack). Free online typing test with real-time acoustics and sub-millisecond precision.',
  alternates: {
    canonical: 'https://thocktype.vercel.app/test',
  },
  openGraph: {
    title: 'Typing Speed Test — Mechanical Switch Sound Benchmark | THOCKTYPE',
    description:
      'Benchmark your WPM, accuracy, and keystroke consistency with authentic mechanical switch acoustics. Zero signup, unlimited typing mode, and deep diagnostics.',
    url: 'https://thocktype.vercel.app/test',
  },
};

export default function TestPage() {
  return (
    <div className="w-full max-w-full flex-1 flex flex-col justify-center items-center px-2 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 overflow-x-hidden">
      <div className="w-full max-w-5xl">
        <TypingTest />
      </div>
    </div>
  );
}
