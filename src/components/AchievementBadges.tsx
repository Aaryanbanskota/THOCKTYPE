'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Achievement,
  TIER_CONFIG,
  AchievementTier,
  AchievementIconName
} from '@/lib/achievements';
import {
  Compass,
  Activity,
  ShieldCheck,
  Headphones,
  Layers,
  Zap,
  Target,
  Sliders,
  Calendar,
  Award,
  Gauge,
  Flame,
  Crosshair,
  Scale,
  Sparkles,
  Trophy,
  Rocket,
  CheckCircle2,
  Timer,
  Radio,
  Star,
  Crown,
  Orbit,
  Gem,
  Medal,
  Lock,
  X,
  ExternalLink
} from 'lucide-react';

export function renderAchievementIcon(name: AchievementIconName, className: string = 'w-6 h-6') {
  switch (name) {
    case 'Compass':
      return <Compass className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Headphones':
      return <Headphones className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Target':
      return <Target className={className} />;
    case 'Sliders':
      return <Sliders className={className} />;
    case 'Calendar':
      return <Calendar className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Gauge':
      return <Gauge className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Crosshair':
      return <Crosshair className={className} />;
    case 'Scale':
      return <Scale className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Rocket':
      return <Rocket className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    case 'Timer':
      return <Timer className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'Star':
      return <Star className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    case 'Orbit':
      return <Orbit className={className} />;
    case 'Gem':
      return <Gem className={className} />;
    case 'Medal':
      return <Medal className={className} />;
    default:
      return <Award className={className} />;
  }
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  selectedTier?: 'all' | AchievementTier;
}

export function AchievementBadges({ achievements, selectedTier: initialTier = 'all' }: AchievementBadgesProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | AchievementTier>(initialTier);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedBadge) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedBadge]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const unlockedPercentage = Math.round((unlockedCount / totalCount) * 100);

  const filtered = achievements.filter((a) => {
    if (filter === 'unlocked' && !a.isUnlocked) return false;
    if (filter === 'locked' && a.isUnlocked) return false;
    if (tierFilter !== 'all' && a.tier !== tierFilter) return false;
    return true;
  });

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl mb-6">
      
      {/* Header & Unlock Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Milestone Accolades & Badges
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-zinc-100 tracking-tight mt-0.5">
            {unlockedCount} of {totalCount} Badges Unlocked
          </h3>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-zinc-800 text-amber-400 font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-zinc-800 text-emerald-400 font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('locked')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'locked'
                ? 'bg-zinc-800 text-zinc-300 font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            In Progress ({totalCount - unlockedCount})
          </button>
        </div>
      </div>

      {/* Tier Filter Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-3.5 pb-1">
        <span className="text-[11px] font-mono text-zinc-500 mr-1">Tier:</span>
        <button
          type="button"
          onClick={() => setTierFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            tierFilter === 'all'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
          }`}
        >
          All Tiers
        </button>
        {(['starter', 'bronze', 'silver', 'gold', 'diamond'] as const).map((tierKey) => {
          const cfg = TIER_CONFIG[tierKey];
          const isSelected = tierFilter === tierKey;
          const countInTier = achievements.filter((a) => a.tier === tierKey).length;
          const unlockedInTier = achievements.filter((a) => a.tier === tierKey && a.isUnlocked).length;
          return (
            <button
              key={tierKey}
              type="button"
              onClick={() => setTierFilter(tierKey)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-zinc-800 border font-bold ' + cfg.border + ' ' + cfg.text
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/60'
              }`}
            >
              <span>{cfg.label}</span>
              <span className="text-[10px] text-zinc-500 font-normal">
                ({unlockedInTier}/{countInTier})
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress Bar towards all badges */}
      <div className="mt-3.5 mb-5">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
          <span>Overall Accolade Completion</span>
          <span className="text-amber-400 font-bold">{unlockedPercentage}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${unlockedPercentage}%` }}
          />
        </div>
      </div>

      {/* Badges Grid (GitHub Achievement Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map((badge) => {
          const cfg = TIER_CONFIG[badge.tier];
          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`
                relative p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center group
                ${
                  badge.isUnlocked
                    ? `bg-gradient-to-b ${cfg.bgGradient} ${cfg.border} ${cfg.glow} hover:scale-[1.02]`
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 opacity-60 hover:opacity-90'
                }
              `}
            >
              {/* GitHub 3D Metallic Shield/Medallion Icon Container */}
              <div
                className={`
                  w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2.5 relative shadow-inner
                  ${
                    badge.isUnlocked
                      ? 'bg-zinc-950/90 border-2 ' + cfg.border
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                  }
                `}
              >
                {/* Metallic Sheen Overlay */}
                {badge.isUnlocked && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                )}

                {badge.isUnlocked ? (
                  renderAchievementIcon(badge.iconName, `w-7 h-7 sm:w-8 sm:h-8 ${cfg.text}`)
                ) : (
                  <div className="relative">
                    {renderAchievementIcon(badge.iconName, 'w-6 h-6 sm:w-7 sm:h-7 text-zinc-600')}
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute -bottom-1 -right-1" />
                  </div>
                )}

                {/* Stars / Tier Multiplier */}
                <span
                  className={`
                    absolute -top-1.5 -right-1.5 text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold border shadow-sm
                    ${
                      badge.isUnlocked
                        ? 'bg-zinc-950 border-amber-500/50 ' + cfg.text
                        : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                    }
                  `}
                >
                  {cfg.stars}
                </span>
              </div>

              {/* Badge Title & Tagline */}
              <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100 tracking-tight leading-tight">
                {badge.name}
              </h4>
              <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1 leading-snug">
                {badge.tagline}
              </p>

              {/* Tier Pill */}
              <span
                className={`text-[9px] font-mono uppercase tracking-wider font-bold mt-2 px-2 py-0.5 rounded-full border ${cfg.badgeBg}`}
              >
                {cfg.label}
              </span>

              {/* Progress Indicator */}
              <div className="w-full mt-2.5 pt-2 border-t border-zinc-800/60">
                {badge.isUnlocked ? (
                  <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unlocked</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                      <span>Progress</span>
                      <span>
                        {badge.currentValue} / {badge.targetValue} {badge.unit}
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full bg-zinc-600 rounded-full transition-all duration-300"
                        style={{ width: `${badge.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-xs font-mono text-zinc-500">
          No badges match the selected filters.
        </div>
      )}

      {/* =========================================================================
       * DETAILED BADGE INSPECTOR MODAL (Opens on click)
       * Uses createPortal to mount directly on document.body for true viewport centering
       * ========================================================================= */}
      {mounted && selectedBadge && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-150"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {(() => {
              const cfg = TIER_CONFIG[selectedBadge.tier];
              return (
                <div className="flex flex-col items-center text-center">
                  {/* Big Metallic Medallion */}
                  <div
                    className={`
                      w-20 h-20 rounded-3xl flex items-center justify-center mb-4 relative shadow-xl
                      ${
                        selectedBadge.isUnlocked
                          ? 'bg-zinc-950 border-2 ' + cfg.border + ' ' + cfg.glow
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-600'
                      }
                    `}
                  >
                    {selectedBadge.isUnlocked ? (
                      renderAchievementIcon(selectedBadge.iconName, `w-10 h-10 ${cfg.text}`)
                    ) : (
                      <div className="relative">
                        {renderAchievementIcon(selectedBadge.iconName, 'w-9 h-9 text-zinc-600')}
                        <Lock className="w-4 h-4 text-zinc-500 absolute -bottom-1 -right-1" />
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider mb-1.5 border ${cfg.badgeBg}`}>
                    {cfg.label} Tier {cfg.stars}
                  </span>

                  <h3 className="text-xl font-extrabold text-zinc-100 tracking-tight">
                    {selectedBadge.name}
                  </h3>

                  <p className="text-xs font-mono text-amber-400 mt-1">
                    {selectedBadge.tagline}
                  </p>

                  <p className="text-xs text-zinc-400 mt-3 px-2 leading-relaxed">
                    {selectedBadge.description}
                  </p>

                  {/* Progress / Status Block */}
                  <div className="w-full mt-6 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2 text-left">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Current Progress:</span>
                      <span className="text-zinc-200 font-bold">
                        {selectedBadge.currentValue} / {selectedBadge.targetValue} {selectedBadge.unit}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedBadge.isUnlocked ? 'bg-emerald-500' : 'bg-amber-500/80'
                        }`}
                        style={{ width: `${selectedBadge.progressPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-zinc-500">
                      <span>Status:</span>
                      {selectedBadge.isUnlocked ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Unlocked {selectedBadge.unlockedAt ? `on ${selectedBadge.unlockedAt}` : ''}
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-medium">Locked</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
