import { UserProfile, SavedTestRecord } from './profile-storage';

export type AchievementTier = 'starter' | 'bronze' | 'silver' | 'gold' | 'diamond';

export type AchievementIconName =
  | 'Compass'
  | 'Activity'
  | 'ShieldCheck'
  | 'Headphones'
  | 'Layers'
  | 'Zap'
  | 'Target'
  | 'Sliders'
  | 'Calendar'
  | 'Award'
  | 'Gauge'
  | 'Flame'
  | 'Crosshair'
  | 'Scale'
  | 'Sparkles'
  | 'Trophy'
  | 'Rocket'
  | 'CheckCircle2'
  | 'Timer'
  | 'Radio'
  | 'Star'
  | 'Crown'
  | 'Orbit'
  | 'Gem'
  | 'Medal';

export interface Achievement {
  id: string;
  name: string;
  category: 'Milestones' | 'Speed' | 'Accuracy' | 'Mastery';
  tier: AchievementTier;
  tagline: string;
  description: string;
  iconName: AchievementIconName;
  currentValue: number;
  targetValue: number;
  unit: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progressPercentage: number;
}

function computeMaxStreak(tests: SavedTestRecord[]): number {
  if (!tests.length) return 0;
  const uniqueDates = Array.from(
    new Set(
      tests.map((t) => {
        const d = new Date(t.timestamp || Date.now());
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      })
    )
  ).sort();

  let maxStreak = 0;
  let curStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr + 'T00:00:00');
    if (!prevDate) {
      curStreak = 1;
    } else {
      const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        curStreak++;
      } else {
        curStreak = 1;
      }
    }
    prevDate = d;
    if (curStreak > maxStreak) maxStreak = curStreak;
  }
  return maxStreak;
}

export function evaluateAchievements(profile: UserProfile): Achievement[] {
  const tests = profile.tests || [];
  const testsCount = tests.length;
  const highestWpm = profile.highestWpm || 0;

  // Highest accuracy achieved in any completed test
  const highestAcc = tests.length > 0 ? Math.max(...tests.map((t) => t.accuracy)) : 0;

  // Highest consistency in any completed test
  const highestConsistency = tests.length > 0 ? Math.max(...tests.map((t) => t.consistency)) : 0;

  // Unique switches tested
  const uniqueSwitches = new Set(tests.map((t) => t.soundPack)).size;

  // Streak
  const maxStreak = computeMaxStreak(tests);

  // Grandmaster test
  const hasGrandmaster = tests.some((t) => t.wpm >= 100 && t.accuracy >= 99);

  // Helper to find earliest test meeting a criterion
  const findUnlockDate = (predicate: (t: SavedTestRecord) => boolean): string | null => {
    const chronological = [...tests].reverse();
    const match = chronological.find(predicate);
    return match ? match.dateStr : null;
  };

  const achievementsList: Omit<Achievement, 'isUnlocked' | 'progressPercentage' | 'unlockedAt'>[] = [
    // ==========================================
    // 1. STARTER TIER (Learning Base & Novice)
    // ==========================================
    {
      id: 'starter-first',
      name: 'First Keystroke',
      category: 'Milestones',
      tier: 'starter',
      tagline: 'Complete your first typing test',
      description: 'Took the inaugural step into mechanical sound typing. Your local journey begins here.',
      iconName: 'Compass',
      currentValue: Math.min(1, testsCount),
      targetValue: 1,
      unit: 'test'
    },
    {
      id: 'starter-speed',
      name: 'Pace Setter',
      category: 'Speed',
      tier: 'starter',
      tagline: 'Reach 25+ Net WPM',
      description: 'Set an initial typing rhythm above baseline conversational speed.',
      iconName: 'Activity',
      currentValue: Math.min(25, highestWpm),
      targetValue: 25,
      unit: 'WPM'
    },
    {
      id: 'starter-acc',
      name: 'Clean Touch',
      category: 'Accuracy',
      tier: 'starter',
      tagline: 'Score 90%+ Accuracy in any test',
      description: 'Prioritized precision keystrokes over rushed errors.',
      iconName: 'ShieldCheck',
      currentValue: Math.min(90, highestAcc),
      targetValue: 90,
      unit: '%'
    },
    {
      id: 'starter-switch',
      name: 'Sound Explorer',
      category: 'Mastery',
      tier: 'starter',
      tagline: 'Test 2 different switch profiles',
      description: 'Discovered the acoustic contrast between mechanical switch sound profiles.',
      iconName: 'Headphones',
      currentValue: Math.min(2, uniqueSwitches),
      targetValue: 2,
      unit: 'switches'
    },

    // ==========================================
    // 2. BRONZE TIER
    // ==========================================
    {
      id: 'bronze-tests',
      name: 'Rhythm Builder',
      category: 'Milestones',
      tier: 'bronze',
      tagline: 'Complete 5 benchmark tests',
      description: 'Establishing an acoustic rhythm and building muscle memory.',
      iconName: 'Layers',
      currentValue: Math.min(5, testsCount),
      targetValue: 5,
      unit: 'tests'
    },
    {
      id: 'bronze-speed',
      name: 'Speed Spark',
      category: 'Speed',
      tier: 'bronze',
      tagline: 'Reach 40+ Net WPM',
      description: 'Actuate keys at 40 words per minute with comfortable control.',
      iconName: 'Zap',
      currentValue: Math.min(40, highestWpm),
      targetValue: 40,
      unit: 'WPM'
    },
    {
      id: 'bronze-acc',
      name: 'Sharp Shooter',
      category: 'Accuracy',
      tier: 'bronze',
      tagline: 'Score 95%+ Accuracy in any test',
      description: 'Consistent hand accuracy hitting targets with pinpoint precision.',
      iconName: 'Target',
      currentValue: Math.min(95, highestAcc),
      targetValue: 95,
      unit: '%'
    },
    {
      id: 'bronze-switch',
      name: 'Switch Enthusiast',
      category: 'Mastery',
      tier: 'bronze',
      tagline: 'Test 3 different switch profiles',
      description: 'Auditioned multiple mechanical packs to find your ideal sound texture.',
      iconName: 'Sliders',
      currentValue: Math.min(3, uniqueSwitches),
      targetValue: 3,
      unit: 'switches'
    },
    {
      id: 'bronze-streak',
      name: 'Daily Habit',
      category: 'Milestones',
      tier: 'bronze',
      tagline: 'Achieve a 2-day practice streak',
      description: 'Returned for a second consecutive day of focused typing.',
      iconName: 'Calendar',
      currentValue: Math.min(2, maxStreak),
      targetValue: 2,
      unit: 'days'
    },

    // ==========================================
    // 3. SILVER TIER
    // ==========================================
    {
      id: 'silver-tests',
      name: 'Dedicated Typist',
      category: 'Milestones',
      tier: 'silver',
      tagline: 'Complete 20 benchmark tests',
      description: 'Twenty full sessions logged locally. Muscle memory is solidifying.',
      iconName: 'Award',
      currentValue: Math.min(20, testsCount),
      targetValue: 20,
      unit: 'tests'
    },
    {
      id: 'silver-speed-60',
      name: 'Cadence Runner',
      category: 'Speed',
      tier: 'silver',
      tagline: 'Reach 60+ Net WPM',
      description: 'Cruising at 60 WPM — faster than the vast majority of computer users.',
      iconName: 'Gauge',
      currentValue: Math.min(60, highestWpm),
      targetValue: 60,
      unit: 'WPM'
    },
    {
      id: 'silver-speed-80',
      name: 'Sound Barrier',
      category: 'Speed',
      tier: 'silver',
      tagline: 'Reach 80+ Net WPM',
      description: 'Broke through the 80 WPM threshold with rapid key actuations.',
      iconName: 'Flame',
      currentValue: Math.min(80, highestWpm),
      targetValue: 80,
      unit: 'WPM'
    },
    {
      id: 'silver-acc',
      name: 'Laser Focus',
      category: 'Accuracy',
      tier: 'silver',
      tagline: 'Score 98%+ Accuracy in any test',
      description: 'Near-flawless typing execution under timed pressure.',
      iconName: 'Crosshair',
      currentValue: Math.min(98, highestAcc),
      targetValue: 98,
      unit: '%'
    },
    {
      id: 'silver-cons',
      name: 'Steady Cadence',
      category: 'Mastery',
      tier: 'silver',
      tagline: 'Achieve 90%+ Consistency',
      description: 'Even spacing and tempo between keystrokes across the session.',
      iconName: 'Scale',
      currentValue: Math.min(90, highestConsistency),
      targetValue: 90,
      unit: '%'
    },
    {
      id: 'silver-streak',
      name: 'Unbroken Focus',
      category: 'Milestones',
      tier: 'silver',
      tagline: 'Achieve a 5-day practice streak',
      description: 'Five consecutive days of typing discipline.',
      iconName: 'Sparkles',
      currentValue: Math.min(5, maxStreak),
      targetValue: 5,
      unit: 'days'
    },

    // ==========================================
    // 4. GOLD TIER
    // ==========================================
    {
      id: 'gold-tests',
      name: 'Century Typist',
      category: 'Milestones',
      tier: 'gold',
      tagline: 'Complete 50 benchmark tests',
      description: 'Fifty benchmarks completed. You are a seasoned mechanical typist.',
      iconName: 'Trophy',
      currentValue: Math.min(50, testsCount),
      targetValue: 50,
      unit: 'tests'
    },
    {
      id: 'gold-speed',
      name: 'Thock Demon',
      category: 'Speed',
      tier: 'gold',
      tagline: 'Reach 100+ Net WPM',
      description: 'Triple-digit velocity unlocked with lightning-fast finger dexterity.',
      iconName: 'Rocket',
      currentValue: Math.min(100, highestWpm),
      targetValue: 100,
      unit: 'WPM'
    },
    {
      id: 'gold-acc',
      name: 'Flawless Stroke',
      category: 'Accuracy',
      tier: 'gold',
      tagline: 'Score 100% Accuracy in a test',
      description: 'Not a single typo or mispress across an entire completed test.',
      iconName: 'CheckCircle2',
      currentValue: Math.min(100, highestAcc),
      targetValue: 100,
      unit: '%'
    },
    {
      id: 'gold-cons',
      name: 'Metronome',
      category: 'Mastery',
      tier: 'gold',
      tagline: 'Achieve 95%+ Consistency',
      description: 'Mechanical clockwork rhythm with microscopic variance between strokes.',
      iconName: 'Timer',
      currentValue: Math.min(95, highestConsistency),
      targetValue: 95,
      unit: '%'
    },
    {
      id: 'gold-switch',
      name: 'Switch Virtuoso',
      category: 'Mastery',
      tier: 'gold',
      tagline: 'Test 6 different switch profiles',
      description: 'Deep appreciation for clacks, thocks, boba clicks, and creamy lubed switches.',
      iconName: 'Radio',
      currentValue: Math.min(6, uniqueSwitches),
      targetValue: 6,
      unit: 'switches'
    },
    {
      id: 'gold-streak',
      name: 'Decade Runner',
      category: 'Milestones',
      tier: 'gold',
      tagline: 'Achieve a 10-day practice streak',
      description: 'Ten unbroken consecutive days of focused practice.',
      iconName: 'Star',
      currentValue: Math.min(10, maxStreak),
      targetValue: 10,
      unit: 'days'
    },

    // ==========================================
    // 5. DIAMOND TIER
    // ==========================================
    {
      id: 'diamond-tests',
      name: 'Acoustic Legend',
      category: 'Milestones',
      tier: 'diamond',
      tagline: 'Complete 100+ benchmark tests',
      description: 'Elite status achieved. Over one hundred full benchmark sessions recorded.',
      iconName: 'Crown',
      currentValue: Math.min(100, testsCount),
      targetValue: 100,
      unit: 'tests'
    },
    {
      id: 'diamond-speed-120',
      name: 'Hyper Sonic',
      category: 'Speed',
      tier: 'diamond',
      tagline: 'Reach 120+ Net WPM',
      description: 'Transcendent velocity. Keystrokes gliding with unmatched acoustic fluidity.',
      iconName: 'Orbit',
      currentValue: Math.min(120, highestWpm),
      targetValue: 120,
      unit: 'WPM'
    },
    {
      id: 'diamond-speed-140',
      name: 'Light Speed',
      category: 'Speed',
      tier: 'diamond',
      tagline: 'Reach 140+ Net WPM',
      description: 'World-class human performance. Fingers actuating switches faster than thought.',
      iconName: 'Gem',
      currentValue: Math.min(140, highestWpm),
      targetValue: 140,
      unit: 'WPM'
    },
    {
      id: 'diamond-mastery',
      name: 'Acoustic Grandmaster',
      category: 'Mastery',
      tier: 'diamond',
      tagline: 'Reach 100+ WPM with 99%+ Accuracy',
      description: 'The pinnacle of typing perfection — blazing triple-digit speed with flawless precision.',
      iconName: 'Medal',
      currentValue: hasGrandmaster ? 1 : 0,
      targetValue: 1,
      unit: 'honor'
    }
  ];

  return achievementsList.map((a) => {
    const isUnlocked = a.currentValue >= a.targetValue;
    const progressPercentage = Math.min(100, Math.round((a.currentValue / a.targetValue) * 100));

    let unlockedAt: string | null = null;
    if (isUnlocked) {
      if (a.id === 'starter-first') unlockedAt = findUnlockDate(() => true);
      else if (a.id === 'starter-speed') unlockedAt = findUnlockDate((t) => t.wpm >= 25);
      else if (a.id === 'starter-acc') unlockedAt = findUnlockDate((t) => t.accuracy >= 90);
      else if (a.id === 'starter-switch') unlockedAt = tests[0]?.dateStr || null;
      else if (a.id === 'bronze-tests') unlockedAt = tests[tests.length - 5]?.dateStr || tests[0]?.dateStr;
      else if (a.id === 'bronze-speed') unlockedAt = findUnlockDate((t) => t.wpm >= 40);
      else if (a.id === 'bronze-acc') unlockedAt = findUnlockDate((t) => t.accuracy >= 95);
      else if (a.id === 'bronze-switch') unlockedAt = tests[0]?.dateStr || null;
      else if (a.id === 'bronze-streak') unlockedAt = tests[0]?.dateStr || null;
      else if (a.id === 'silver-tests') unlockedAt = tests[tests.length - 20]?.dateStr || tests[0]?.dateStr;
      else if (a.id === 'silver-speed-60') unlockedAt = findUnlockDate((t) => t.wpm >= 60);
      else if (a.id === 'silver-speed-80') unlockedAt = findUnlockDate((t) => t.wpm >= 80);
      else if (a.id === 'silver-acc') unlockedAt = findUnlockDate((t) => t.accuracy >= 98);
      else if (a.id === 'silver-cons') unlockedAt = findUnlockDate((t) => t.consistency >= 90);
      else if (a.id === 'silver-streak') unlockedAt = tests[0]?.dateStr || null;
      else if (a.id === 'gold-tests') unlockedAt = tests[tests.length - 50]?.dateStr || tests[0]?.dateStr;
      else if (a.id === 'gold-speed') unlockedAt = findUnlockDate((t) => t.wpm >= 100);
      else if (a.id === 'gold-acc') unlockedAt = findUnlockDate((t) => t.accuracy >= 100);
      else if (a.id === 'gold-cons') unlockedAt = findUnlockDate((t) => t.consistency >= 95);
      else if (a.id === 'gold-switch') unlockedAt = tests[0]?.dateStr || null;
      else if (a.id === 'gold-streak') unlockedAt = tests[0]?.dateStr || null;
      else if (a.id === 'diamond-tests') unlockedAt = tests[tests.length - 100]?.dateStr || tests[0]?.dateStr;
      else if (a.id === 'diamond-speed-120') unlockedAt = findUnlockDate((t) => t.wpm >= 120);
      else if (a.id === 'diamond-speed-140') unlockedAt = findUnlockDate((t) => t.wpm >= 140);
      else if (a.id === 'diamond-mastery') unlockedAt = findUnlockDate((t) => t.wpm >= 100 && t.accuracy >= 99);
    }

    return {
      ...a,
      isUnlocked,
      progressPercentage,
      unlockedAt
    };
  });
}

export const TIER_CONFIG: Record<
  AchievementTier,
  {
    border: string;
    bgGradient: string;
    text: string;
    glow: string;
    label: string;
    stars: string;
    badgeBg: string;
  }
> = {
  starter: {
    border: 'border-emerald-500/50 hover:border-emerald-400',
    bgGradient: 'from-emerald-950/40 via-zinc-900 to-zinc-950',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    label: 'Starter',
    stars: '✦',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
  },
  bronze: {
    border: 'border-amber-700/60 hover:border-amber-600',
    bgGradient: 'from-amber-900/40 via-amber-950/30 to-zinc-950',
    text: 'text-amber-500',
    glow: 'shadow-[0_0_15px_rgba(217,119,6,0.25)]',
    label: 'Bronze',
    stars: '★',
    badgeBg: 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
  },
  silver: {
    border: 'border-zinc-400/60 hover:border-zinc-300',
    bgGradient: 'from-zinc-700/40 via-zinc-800/30 to-zinc-950',
    text: 'text-zinc-200',
    glow: 'shadow-[0_0_15px_rgba(212,212,216,0.25)]',
    label: 'Silver',
    stars: '★★',
    badgeBg: 'bg-zinc-700/30 text-zinc-300 border border-zinc-600/50'
  },
  gold: {
    border: 'border-amber-400/70 hover:border-amber-300',
    bgGradient: 'from-amber-500/30 via-amber-600/20 to-zinc-950',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    label: 'Gold',
    stars: '★★★',
    badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
  },
  diamond: {
    border: 'border-cyan-400/80 hover:border-cyan-300',
    bgGradient: 'from-cyan-500/30 via-sky-600/20 to-zinc-950',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_25px_rgba(34,211,238,0.4)]',
    label: 'Diamond',
    stars: '★★★★',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
  }
};
