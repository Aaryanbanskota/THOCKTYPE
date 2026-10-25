import type { Metadata } from 'next';
import React from 'react';
import ProfileClient from '@/components/ProfileClient';

export const metadata: Metadata = {
  title: 'Typist Profile & Speed Growth Analytics',
  description:
    'Track your typing speed progression, consistency curves, mechanical switch sound milestones, and 52-week activity heatmap with zero telemetry. 100% private and offline stored.',
  alternates: {
    canonical: 'https://thocktype.vercel.app/profile',
  },
  openGraph: {
    title: 'Typist Profile & Speed Growth Analytics | THOCKTYPE',
    description:
      'Track your typing speed progression, consistency curves, mechanical switch sound milestones, and 52-week activity heatmap with zero telemetry.',
    url: 'https://thocktype.vercel.app/profile',
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
