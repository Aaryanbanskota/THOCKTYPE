'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getLocalProfile, getDefaultProfile, UserProfile } from '@/lib/profile-storage';
import { evaluateAchievements, TIER_CONFIG } from '@/lib/achievements';
import { AchievementBadges } from '@/components/AchievementBadges';
import {
  Trophy,
  Award,
  ArrowLeft,
  Flame,
  ShieldCheck,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

export default function BadgesClient() {
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile);

  useEffect(() => {
    setProfile(getLocalProfile());
  }, []);

  const achievements = useMemo(() => {
    return evaluateAchievements(profile);
  }, [profile]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center">
      
      {/* Top Breadcrumb & Return Link */}
      <div className="w-full flex items-center justify-between mb-6">
        <Link
          href="/profile"
          className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Profile</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Offline Stored • 100% Free</span>
        </div>
      </div>

      {/* Hero Accolade Showcase Header */}
      <div className="w-full rounded-2xl sm:rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-5 sm:p-8 shadow-xl backdrop-blur-xl mb-6 relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Milestone Accolades</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
              Badges & Achievements
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Progress through Starter, Bronze, Silver, Gold, and Diamond accolades. Earned by practicing speed, accuracy, consistency, and testing multiple mechanical switch sound profiles.
            </p>
          </div>

          {/* Quick CTA to test */}
          <Link
            href="/test"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Flame className="w-4 h-4 fill-zinc-950" />
            <span>Take Test to Unlock</span>
          </Link>
        </div>

        {/* Tier Badges Counters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 mt-6 pt-6 border-t border-zinc-800/80">
          {(['starter', 'bronze', 'silver', 'gold', 'diamond'] as const).map((tierKey) => {
            const cfg = TIER_CONFIG[tierKey];
            const inTier = achievements.filter((a) => a.tier === tierKey);
            const unlockedInTier = inTier.filter((a) => a.isUnlocked).length;
            return (
              <div
                key={tierKey}
                className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className={`text-[10px] font-mono font-bold uppercase ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[9px] text-zinc-500">{cfg.stars}</span>
                </div>
                <span className="text-lg sm:text-xl font-extrabold font-mono text-zinc-100">
                  {unlockedInTier} <span className="text-xs text-zinc-500 font-normal">/ {inTier.length}</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  {unlockedInTier === inTier.length && inTier.length > 0 ? (
                    <span className="text-emerald-400 font-semibold">Mastered</span>
                  ) : (
                    `${inTier.length - unlockedInTier} left`
                  )}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Main Badges Component */}
      <AchievementBadges achievements={achievements} />

      {/* Footer Navigation */}
      <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs font-mono text-zinc-400">
        <Link
          href="/profile"
          className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Profile & Growth</span>
        </Link>
        <Link
          href="/test"
          className="text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          Start Typing Benchmark →
        </Link>
      </div>

    </div>
  );
}
