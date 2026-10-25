import type { Metadata } from 'next';
import React from 'react';
import BadgesClient from '@/components/BadgesClient';

export const metadata: Metadata = {
  title: 'Profile Accolades & Milestone Badges',
  description:
    'View your unlocked typing accolades, speed rank trophies, and mechanical keyboard switch collection achievements.',
  alternates: {
    canonical: 'https://thocktype.vercel.app/profile/badges',
  },
  openGraph: {
    title: 'Profile Accolades & Milestone Badges | THOCKTYPE',
    description:
      'View your unlocked typing accolades and speed rank trophies.',
    url: 'https://thocktype.vercel.app/profile/badges',
  },
};

export default function ProfileBadgesPage() {
  return <BadgesClient />;
}
