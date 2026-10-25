import type { Metadata } from 'next';
import React from 'react';
import BadgesClient from '@/components/BadgesClient';

export const metadata: Metadata = {
  title: 'Typing Accolades & Milestone Achievement Badges',
  description:
    'Unlock achievement badges as your typing speed, accuracy, streaks, and acoustic sound pack milestones improve. Track your journey from Novice to Grandmaster.',
  alternates: {
    canonical: 'https://thocktype.vercel.app/badges',
  },
  openGraph: {
    title: 'Typing Accolades & Milestone Achievement Badges | THOCKTYPE',
    description:
      'Unlock achievement badges and track typing milestones across 8 mechanical switch acoustic profiles.',
    url: 'https://thocktype.vercel.app/badges',
  },
};

export default function BadgesPage() {
  return <BadgesClient />;
}
