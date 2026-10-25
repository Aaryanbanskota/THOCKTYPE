'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  getLocalProfile,
  getDefaultProfile,
  updateProfileSettings,
  clearProfileHistory,
  deleteTestRecord,
  calculateImprovementStats,
  exportProfileToJson,
  importProfileFromJson,
  UserProfile,
  SavedTestRecord,
  TIERS
} from '@/lib/profile-storage';
import { SWITCH_PROFILES, PACK_IDS } from '@/lib/sound-profiles';
import { SwitchIcon } from '@/components/SwitchIcon';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { renderAchievementIcon } from '@/components/AchievementBadges';
import { evaluateAchievements, TIER_CONFIG, Achievement } from '@/lib/achievements';
import { SoundPackId, DifficultyMode } from '@/types/sound';
import {
  Trophy,
  TrendingUp,
  Target,
  Clock,
  Activity,
  Flame,
  Award,
  Download,
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Zap,
  BarChart2,
  AlertCircle,
  Sliders
} from 'lucide-react';

export default function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('Mechanical Typist');
  const [isSelectingAvatar, setIsSelectingAvatar] = useState<boolean>(false);
  const [chartTab, setChartTab] = useState<'wpm' | 'accuracy' | 'trouble'>('wpm');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | DifficultyMode>('all');
  const [hoveredPoint, setHoveredPoint] = useState<SavedTestRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showAchievementsModal || selectedBadge || isSelectingAvatar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAchievementsModal, selectedBadge, isSelectingAvatar]);

  // Load profile on client mount
  useEffect(() => {
    const data = getLocalProfile();
    setProfile(data);
    setNameInput(data.username);
  }, []);

  const stats = useMemo(() => {
    if (!profile) return null;
    return calculateImprovementStats(profile);
  }, [profile]);

  const achievements = useMemo(() => {
    if (!profile) return [];
    return evaluateAchievements(profile);
  }, [profile]);

  const unlockedAchievements = useMemo(() => {
    return achievements.filter((a) => a.isUnlocked);
  }, [achievements]);

  const filteredTests = useMemo(() => {
    if (!profile) return [];
    if (selectedDifficulty === 'all') return profile.tests;
    return profile.tests.filter((t) => t.difficulty === selectedDifficulty);
  }, [profile, selectedDifficulty]);

  // Chronological order for graphs (oldest first, newest last)
  const chronologicalTests = useMemo(() => {
    if (!profile) return [];
    return [...profile.tests].reverse();
  }, [profile]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim() || 'Mechanical Typist';
    const updated = updateProfileSettings({ username: trimmed });
    setProfile(updated);
    setIsEditingName(false);
  };

  const handleSelectAvatar = (packId: SoundPackId) => {
    const updated = updateProfileSettings({ avatarSwitch: packId });
    setProfile(updated);
    setIsSelectingAvatar(false);
  };

  const handleDeleteTest = (id: string) => {
    const updated = deleteTestRecord(id);
    setProfile(updated);
  };

  const handleClearHistory = () => {
    const cleared = clearProfileHistory();
    setProfile(cleared);
    setShowClearConfirm(false);
  };

  const handleExportData = () => {
    if (!profile) return;
    const jsonStr = exportProfileToJson(profile);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thocktype-profile-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProfileFromJson(content);
      if (success) {
        setProfile(getLocalProfile());
        setImportStatus('Profile imported successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Failed to import: invalid format.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };



  const currentAvatarProfile = SWITCH_PROFILES[profile.avatarSwitch];
  const tier = stats?.currentTier;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center">
      
      {/* 1. Profile Header Card */}
      <div className="w-full rounded-2xl sm:rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl mb-6 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: currentAvatarProfile?.color || '#f59e0b' }}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 relative z-10">
          
          {/* Avatar + Identity Details */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            
            {/* Interactive Switch Avatar with Dynamic Rank Ring */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsSelectingAvatar(true)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 border-2 flex items-center justify-center transition-all hover:scale-105 cursor-pointer relative ${
                  tier?.ringColor || 'border-zinc-800'
                } ${tier?.glowColor || 'shadow-lg'}`}
                title={`Rank: ${tier?.name || 'Starter Typist'} • Click to customize avatar switch`}
              >
                <SwitchIcon
                  id={profile.avatarSwitch}
                  className="w-9 h-9 sm:w-11 sm:h-11"
                  style={{ color: currentAvatarProfile?.color }}
                />
                <span className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 group-hover:text-zinc-200 shadow-sm">
                  <Edit2 className="w-2.5 h-2.5" />
                </span>
              </button>
            </div>

            {/* Username & Status */}
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={24}
                      className="px-2.5 py-1 text-sm sm:text-base font-bold bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="p-1.5 rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
                      {profile.username}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      title="Edit display name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {tier && (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider border ${tier.badgeColor}`}>
                    {tier.name}
                  </span>
                )}
              </div>

              {/* Local Storage badge */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Local Account (Zero Signup • 100% Private)</span>
                </span>
                <span className="hidden sm:inline text-zinc-600">•</span>
                <span className="text-zinc-500">
                  Fav switch: {currentAvatarProfile?.name}
                </span>
              </div>

              {/* Unlocked Badges Showcase Box */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Honors:</span>
                </span>

                {unlockedAchievements.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-500 italic">
                      No badges unlocked yet
                    </span>
                    <Link
                      href="/badges"
                      className="text-[10px] font-mono text-amber-400 hover:underline"
                    >
                      View 24 badges →
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {unlockedAchievements.slice(0, 3).map((badge) => {
                      const cfg = TIER_CONFIG[badge.tier];
                      return (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => setSelectedBadge(badge)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-transform hover:scale-110 cursor-pointer ${cfg.border} bg-zinc-950/90 ${cfg.glow}`}
                          title={`${badge.name} (${cfg.label}) • Click to inspect`}
                        >
                          {renderAchievementIcon(badge.iconName, `w-3.5 h-3.5 ${cfg.text}`)}
                        </button>
                      );
                    })}

                    {/* If more than 3 achievements, show button to see more achievements */}
                    {unlockedAchievements.length > 3 ? (
                      <button
                        type="button"
                        onClick={() => setShowAchievementsModal(true)}
                        className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105"
                        title="See all unlocked achievements in a box"
                      >
                        <span>+{unlockedAchievements.length - 3} More</span>
                      </button>
                    ) : (
                      <Link
                        href="/badges"
                        className="text-[10px] font-mono text-zinc-500 hover:text-amber-400 ml-1 transition-colors"
                      >
                        All Badges ({achievements.length}) →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Quick Actions (Launch test, Export data) */}
          <div className="flex items-center gap-2">
            <Link
              href="/test"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 fill-zinc-950" />
              <span>Take Speed Test</span>
            </Link>

            <button
              type="button"
              onClick={handleExportData}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
              title="Export local test history to JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Tier Level Progress Bar */}
        {tier && (
          <div className="mt-5 pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-zinc-400">
                Tier Rank: <span className="text-zinc-200 font-bold">{tier.name}</span>
              </span>
              <span className="text-amber-400 font-semibold">
                {tier.nextTierName
                  ? `${profile.highestWpm} / ${tier.nextTierMinWpm} WPM to ${tier.nextTierName}`
                  : `Top Rank Reached (${profile.highestWpm} WPM)`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                style={{ width: `${tier.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

      </div>

      {/* 2. Key High-Impact Metric Cards */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        
        {/* Peak WPM */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>PEAK WPM</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight font-mono">
            {profile.highestWpm}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">
            All-time top velocity
          </span>
        </div>

        {/* Average WPM + Growth */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>AVERAGE WPM</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight font-mono">
            {profile.averageWpm}
          </span>
          <span className="text-[10px] font-mono mt-1 flex items-center gap-1">
            {stats && stats.hasEnoughData ? (
              stats.wpmDelta >= 0 ? (
                <span className="text-emerald-400">
                  +{stats.wpmDelta} WPM ({stats.wpmPercentageGrowth >= 0 ? `+${stats.wpmPercentageGrowth}%` : ''})
                </span>
              ) : (
                <span className="text-rose-400">
                  {stats.wpmDelta} WPM ({stats.wpmPercentageGrowth}%)
                </span>
              )
            ) : (
              <span className="text-zinc-500">Across {profile.testsCompleted} tests</span>
            )}
          </span>
        </div>

        {/* Average Accuracy */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>ACCURACY</span>
            <Target className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <span className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight font-mono">
            {profile.averageAccuracy}%
          </span>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">
            Consistency: {profile.averageConsistency}%
          </span>
        </div>

        {/* Tests & Time */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>PRACTICE TIME</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight font-mono">
            {Math.round((profile.totalTimeSpentSeconds / 60) * 10) / 10}m
          </span>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">
            {profile.testsCompleted} sessions completed
          </span>
        </div>

      </div>

      {/* 3. Growth Diagnostics & Improvement Report */}
      {stats && stats.hasEnoughData && (
        <div className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 p-4 sm:p-6 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Performance Growth Analysis
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-500 block">Baseline vs Recent Velocity</span>
              <div className="text-lg font-bold text-zinc-100 font-mono mt-0.5">
                {stats.earlyAverageWpm} WPM → <span className="text-emerald-400">{stats.recentAverageWpm} WPM</span>
              </div>
              <span className="text-[10px] text-zinc-400">
                {stats.wpmDelta >= 0 ? `+${stats.wpmDelta} net increase` : `${stats.wpmDelta} variance`}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-500 block">Relative Skill Improvement</span>
              <div className="text-lg font-bold font-mono mt-0.5 text-amber-400">
                {stats.wpmPercentageGrowth >= 0 ? `+${stats.wpmPercentageGrowth}% Speed` : `${stats.wpmPercentageGrowth}% Speed`}
              </div>
              <span className="text-[10px] text-zinc-400">
                Accuracy delta: {stats.accuracyDelta >= 0 ? `+${stats.accuracyDelta}%` : `${stats.accuracyDelta}%`}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-500 block">Today's Training Cadence</span>
              <div className="text-lg font-bold font-mono mt-0.5 text-zinc-200">
                {stats.testsToday} tests today
              </div>
              <span className="text-[10px] text-emerald-400">
                Active momentum sustained
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Graphical Interactive Analytics Card */}
      <div className="w-full rounded-2xl sm:rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl mb-6">
        
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Graphical Diagnostics
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-100 tracking-tight mt-0.5">
              Historical Performance Trend
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setChartTab('wpm')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartTab === 'wpm'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              WPM Speed
            </button>
            <button
              type="button"
              onClick={() => setChartTab('accuracy')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartTab === 'accuracy'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Accuracy %
            </button>
            <button
              type="button"
              onClick={() => setChartTab('trouble')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartTab === 'trouble'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Trouble Keys
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        {chronologicalTests.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <BarChart2 className="w-10 h-10 text-zinc-600 mb-3" />
            <h4 className="text-sm font-bold text-zinc-300 font-mono">No Tests Completed Yet</h4>
            <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
              Complete your first typing benchmark to generate historical WPM curves, precision trends, and trouble key telemetry.
            </p>
            <Link
              href="/test"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono"
            >
              <span>Launch First Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="pt-4">
            
            {/* WPM Speed Trend SVG Chart */}
            {chartTab === 'wpm' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Net WPM
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" /> Gross / Raw WPM
                    </span>
                  </div>
                  {hoveredPoint && (
                    <span className="text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      WPM: <strong className="text-amber-400">{hoveredPoint.wpm}</strong> (Raw: {hoveredPoint.rawWpm}) • {hoveredPoint.dateStr}
                    </span>
                  )}
                </div>

                {/* SVG Line / Area Graph */}
                <div className="w-full h-48 sm:h-60 bg-zinc-950/70 rounded-xl p-2 sm:p-4 border border-zinc-800/80 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="wpmGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    {[0.25, 0.5, 0.75].map((pct, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={150 * pct}
                        x2="500"
                        y2={150 * pct}
                        stroke="#27272a"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Compute points */}
                    {(() => {
                      const maxVal = Math.max(80, ...chronologicalTests.map((t) => Math.max(t.wpm, t.rawWpm))) * 1.15;
                      const len = chronologicalTests.length;
                      const getX = (idx: number) => (len <= 1 ? 250 : (idx / (len - 1)) * 500);
                      const getY = (val: number) => 150 - (val / maxVal) * 140;

                      // Raw WPM path
                      const rawPath = chronologicalTests.map((t, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(t.rawWpm)}`).join(' ');
                      
                      // Net WPM path
                      const netPath = chronologicalTests.map((t, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(t.wpm)}`).join(' ');
                      const areaPath = `${netPath} L ${getX(len - 1)} 150 L 0 150 Z`;

                      return (
                        <>
                          {/* Net WPM Area fill */}
                          <path d={areaPath} fill="url(#wpmGradient)" />
                          
                          {/* Raw WPM Line */}
                          <path d={rawPath} fill="none" stroke="#52525b" strokeWidth="2" strokeDasharray="3 3" />
                          
                          {/* Net WPM Line */}
                          <path d={netPath} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                          {/* Data dots */}
                          {chronologicalTests.map((t, idx) => (
                            <circle
                              key={t.id}
                              cx={getX(idx)}
                              cy={getY(t.wpm)}
                              r={hoveredPoint?.id === t.id ? 6 : 3.5}
                              fill="#f59e0b"
                              stroke="#18181b"
                              strokeWidth="2"
                              className="transition-all cursor-pointer"
                              onMouseEnter={() => setHoveredPoint(t)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}

            {/* Accuracy & Consistency Trend Chart */}
            {chartTab === 'accuracy' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Accuracy %
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Consistency %
                    </span>
                  </div>
                  {hoveredPoint && (
                    <span className="text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      Acc: <strong className="text-sky-400">{hoveredPoint.accuracy}%</strong> • Cons: {hoveredPoint.consistency}%
                    </span>
                  )}
                </div>

                <div className="w-full h-48 sm:h-60 bg-zinc-950/70 rounded-xl p-2 sm:p-4 border border-zinc-800/80 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                    {/* Horizontal 100%, 90%, 80% marks */}
                    {[0.2, 0.5, 0.8].map((pct, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={150 * pct}
                        x2="500"
                        y2={150 * pct}
                        stroke="#27272a"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                    ))}

                    {(() => {
                      const len = chronologicalTests.length;
                      const getX = (idx: number) => (len <= 1 ? 250 : (idx / (len - 1)) * 500);
                      // Map 50%..100% into height
                      const getY = (val: number) => 150 - ((Math.max(50, val) - 50) / 50) * 140;

                      const accPath = chronologicalTests.map((t, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(t.accuracy)}`).join(' ');
                      const consPath = chronologicalTests.map((t, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(t.consistency)}`).join(' ');

                      return (
                        <>
                          <path d={consPath} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />
                          <path d={accPath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {chronologicalTests.map((t, idx) => (
                            <circle
                              key={t.id}
                              cx={getX(idx)}
                              cy={getY(t.accuracy)}
                              r={hoveredPoint?.id === t.id ? 6 : 3.5}
                              fill="#38bdf8"
                              stroke="#18181b"
                              strokeWidth="2"
                              className="transition-all cursor-pointer"
                              onMouseEnter={() => setHoveredPoint(t)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}

            {/* Trouble Keys Audit */}
            {chartTab === 'trouble' && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-zinc-400">
                  Most frequently missed keys across all completed benchmark sessions. Target these keys during practice.
                </p>

                {stats && stats.topTroubleKeys.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {stats.topTroubleKeys.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <kbd className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-amber-400 font-mono font-bold flex items-center justify-center text-sm shadow-sm">
                            {item.char === ' ' ? '␣' : item.char}
                          </kbd>
                          <div>
                            <span className="text-xs font-mono font-medium text-zinc-200">
                              Key &ldquo;{item.char === ' ' ? 'Space' : item.char}&rdquo;
                            </span>
                            <span className="text-[10px] text-zinc-500 block">
                              Missed {item.count} times
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-400">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-mono text-zinc-500">
                    No trouble keys recorded yet. Complete more tests to track mistake patterns!
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* GitHub-Style 52-Week Contribution Matrix & Activity Log (Moved down) */}
      <ActivityHeatmap tests={profile.tests} />

      {/* 5. Milestone Accolades & Badges Summary */}
      <div className="w-full rounded-2xl sm:rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Milestone Accolades
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-zinc-100 tracking-tight mt-0.5">
              Badges & Honors ({unlockedAchievements.length} of {achievements.length} Unlocked)
            </h3>
          </div>

          <Link
            href="/badges"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <span>Explore All 24 Badges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mt-4 mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
            <span>Overall Honor Completion</span>
            <span className="text-amber-400 font-bold">
              {achievements.length > 0 ? Math.round((unlockedAchievements.length / achievements.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-cyan-400 transition-all duration-500"
              style={{
                width: `${achievements.length > 0 ? Math.round((unlockedAchievements.length / achievements.length) * 100) : 0}%`
              }}
            />
          </div>
        </div>

        {/* Badges Preview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {(unlockedAchievements.length >= 4 ? unlockedAchievements.slice(0, 4) : achievements.slice(0, 4)).map((badge) => {
            const cfg = TIER_CONFIG[badge.tier];
            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center group ${
                  badge.isUnlocked
                    ? `bg-gradient-to-b ${cfg.bgGradient} ${cfg.border} hover:scale-[1.02]`
                    : 'bg-zinc-950/60 border-zinc-800/80 opacity-60 hover:opacity-90'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 relative border ${
                    badge.isUnlocked ? cfg.border + ' bg-zinc-950 ' + cfg.glow : 'border-zinc-800 bg-zinc-900 text-zinc-600'
                  }`}
                >
                  {badge.isUnlocked ? (
                    renderAchievementIcon(badge.iconName, `w-5 h-5 ${cfg.text}`)
                  ) : (
                    renderAchievementIcon(badge.iconName, 'w-5 h-5 text-zinc-600')
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-200 truncate w-full">
                  {badge.name}
                </span>
                <span className={`text-[9px] font-mono uppercase font-bold mt-1 px-1.5 py-0.2 rounded border ${cfg.badgeBg}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Complete Test History Log */}
      <div className="w-full rounded-2xl sm:rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl mb-6">
        
        {/* History Header & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Session Archive
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-100 tracking-tight mt-0.5">
              All Completed Benchmarks ({filteredTests.length})
            </h2>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
            {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-zinc-800 text-amber-400 font-bold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Test History List */}
        {filteredTests.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-zinc-500">
            No test records found for this filter.
          </div>
        ) : (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {filteredTests.map((test) => {
              const pack = SWITCH_PROFILES[test.soundPack];
              return (
                <div
                  key={test.id}
                  className="p-3 sm:p-3.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-950/90 border border-zinc-800/70 hover:border-zinc-700/80 flex items-center justify-between gap-3 transition-all"
                >
                  {/* Left: Speed + Accuracy */}
                  <div className="flex items-center gap-3 sm:gap-5">
                    <div className="w-12 sm:w-14 text-center">
                      <span className="text-lg sm:text-xl font-bold font-mono text-amber-400 block leading-tight">
                        {test.wpm}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-zinc-500">WPM</span>
                    </div>

                    <div className="border-l border-zinc-800 pl-3 sm:pl-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold text-zinc-200">
                          {test.accuracy}% Acc
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          ({test.consistency}% Cons)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                          {test.difficulty}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                        <span>{test.dateStr}</span>
                        <span>•</span>
                        <span>{test.exactSeconds}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Switch attribution & delete */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                      <SwitchIcon id={test.soundPack} className="w-3.5 h-3.5" style={{ color: pack?.color }} />
                      <span>{pack?.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTest(test.id)}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete this test session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 6. Data Management & Local Account Administration */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Data stays in your browser. Back up or restore anytime.</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* Import JSON */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          {/* Clear history */}
          {showClearConfirm ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset History</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
       * ACHIEVEMENTS POPUP MODAL (GitHub-style wide showcase modal)
       * Uses createPortal to mount on document.body for true viewport centering
       * ========================================================================= */}
      {mounted && showAchievementsModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-150"
          onClick={() => setShowAchievementsModal(false)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl bg-zinc-900 border border-zinc-800 p-5 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-100">
                    Unlocked Achievements ({unlockedAchievements.length})
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Click any badge medallion to inspect achievements & stats
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAchievementsModal(false)}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GitHub-style wide badge grid (Badge on top, title down) */}
            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 custom-scrollbar pr-1">
              {unlockedAchievements.map((badge) => {
                const cfg = TIER_CONFIG[badge.tier];
                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => {
                      setShowAchievementsModal(false);
                      setSelectedBadge(badge);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2.5 ${cfg.border} bg-zinc-950/70 hover:bg-zinc-950 hover:scale-[1.03] group shadow-sm`}
                    title={`${badge.name} • ${cfg.label} Tier`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${cfg.border} bg-zinc-900 ${cfg.glow} transition-transform group-hover:scale-110`}
                    >
                      {renderAchievementIcon(badge.iconName, `w-6 h-6 ${cfg.text}`)}
                    </div>
                    <div className="w-full">
                      <div className="text-xs font-bold text-zinc-100 line-clamp-1 group-hover:text-amber-300">
                        {badge.name}
                      </div>
                      <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border ${cfg.badgeBg}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-mono text-zinc-400">
                Unlocked <strong className="text-emerald-400 font-bold">{unlockedAchievements.length}</strong> of <strong className="text-zinc-200">{achievements.length}</strong> badges
              </span>
              <Link
                href="/badges"
                onClick={() => setShowAchievementsModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95"
              >
                <span>View Full Badges Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
       * AVATAR SWITCH PICKER MODAL (Portaled to document.body to avoid clipping)
       * ========================================================================= */}
      {mounted && isSelectingAvatar && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-150"
          onClick={() => setIsSelectingAvatar(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-100">
                    Select Profile Avatar Switch
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Choose from all 8 authentic switch acoustic profiles
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectingAvatar(false)}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 custom-scrollbar pr-1">
              {PACK_IDS.map((id) => {
                const p = SWITCH_PROFILES[id];
                const isSelected = profile.avatarSwitch === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      handleSelectAvatar(id);
                      setIsSelectingAvatar(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-zinc-800 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-zinc-950/70 border-zinc-800 hover:bg-zinc-800/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl bg-zinc-900 border flex items-center justify-center shrink-0 shadow-sm"
                        style={{ borderColor: `${p.color}50` }}
                      >
                        <SwitchIcon id={id} className="w-5 h-5" style={{ color: p.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-100 truncate">{p.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate">
                          {p.pitch} • {p.loudness}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 uppercase font-bold border ${p.badgeBg}`}>
                      {p.category}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Current: <strong className="text-amber-400 font-sans">{currentAvatarProfile?.name}</strong></span>
              <button
                type="button"
                onClick={() => setIsSelectingAvatar(false)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
       * DETAILED BADGE INSPECTOR MODAL (Opens on badge click)
       * Uses createPortal to mount on document.body for true viewport centering
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
                  <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 relative shadow-xl ${
                      selectedBadge.isUnlocked
                        ? 'bg-zinc-950 border-2 ' + cfg.border + ' ' + cfg.glow
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-600'
                    }`}
                  >
                    {renderAchievementIcon(selectedBadge.iconName, `w-10 h-10 ${cfg.text}`)}
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
                          <Check className="w-3.5 h-3.5" />
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

      {/* Notification Toast */}
      {importStatus && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-amber-500 text-amber-300 text-xs font-mono shadow-2xl animate-in fade-in duration-150">
          {importStatus}
        </div>
      )}

    </div>
  );
}
