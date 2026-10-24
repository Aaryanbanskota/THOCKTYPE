import { SoundPackId, DifficultyMode, TestResults, TroubleKey } from '@/types/sound';

export interface SavedTestRecord {
  id: string;
  timestamp: number;
  dateStr: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  exactSeconds: number;
  difficulty: DifficultyMode;
  soundPack: SoundPackId;
  correctChars: number;
  incorrectChars: number;
  kps: number;
  msPerKey: number;
  troubleKeys: TroubleKey[];
  tier: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarSwitch: SoundPackId;
  createdAt: string;
  testsCompleted: number;
  totalTimeSpentSeconds: number;
  highestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
  averageConsistency: number;
  tests: SavedTestRecord[];
}

export interface ImprovementStats {
  hasEnoughData: boolean;
  wpmDelta: number;
  wpmPercentageGrowth: number;
  accuracyDelta: number;
  earlyAverageWpm: number;
  recentAverageWpm: number;
  testsToday: number;
  topTroubleKeys: { char: string; count: number }[];
  currentTier: {
    name: string;
    badgeColor: string;
    ringColor: string;
    borderColor: string;
    glowColor: string;
    textColor: string;
    minWpm: number;
    nextTierName: string | null;
    nextTierMinWpm: number | null;
    progressPercentage: number;
  };
}

const STORAGE_KEY = 'thocktype_local_profile_v1';

export interface TierDefinition {
  name: string;
  minWpm: number;
  maxWpm: number;
  badgeColor: string;
  ringColor: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
}

export const TIERS: TierDefinition[] = [
  {
    name: 'Starter Typist',
    minWpm: 0,
    maxWpm: 39,
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    ringColor: 'border-emerald-500/80 ring-2 ring-emerald-500/30',
    borderColor: '#10b981',
    glowColor: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    textColor: 'text-emerald-400'
  },
  {
    name: 'Bronze Swift',
    minWpm: 40,
    maxWpm: 59,
    badgeColor: 'bg-amber-800/30 text-amber-500 border-amber-700/50',
    ringColor: 'border-amber-600/80 ring-2 ring-amber-600/30',
    borderColor: '#d97706',
    glowColor: 'shadow-[0_0_15px_rgba(217,119,6,0.35)]',
    textColor: 'text-amber-500'
  },
  {
    name: 'Silver Velocity',
    minWpm: 60,
    maxWpm: 79,
    badgeColor: 'bg-zinc-400/20 text-zinc-300 border-zinc-400/40',
    ringColor: 'border-zinc-300/80 ring-2 ring-zinc-300/30',
    borderColor: '#d4d4d8',
    glowColor: 'shadow-[0_0_15px_rgba(212,212,216,0.35)]',
    textColor: 'text-zinc-200'
  },
  {
    name: 'Gold Precision',
    minWpm: 80,
    maxWpm: 99,
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    ringColor: 'border-amber-400/90 ring-2 ring-amber-400/40',
    borderColor: '#f59e0b',
    glowColor: 'shadow-[0_0_18px_rgba(245,158,11,0.4)]',
    textColor: 'text-amber-300'
  },
  {
    name: 'Diamond Artisan',
    minWpm: 100,
    maxWpm: 119,
    badgeColor: 'bg-sky-400/20 text-sky-200 border-sky-400/50',
    ringColor: 'border-cyan-400/90 ring-2 ring-cyan-400/40',
    borderColor: '#22d3ee',
    glowColor: 'shadow-[0_0_20px_rgba(34,211,238,0.45)]',
    textColor: 'text-cyan-300'
  },
  {
    name: 'Master Thocker',
    minWpm: 120,
    maxWpm: 139,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    ringColor: 'border-purple-500/90 ring-2 ring-purple-500/40',
    borderColor: '#a855f7',
    glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.45)]',
    textColor: 'text-purple-300'
  },
  {
    name: 'Grandmaster Elite',
    minWpm: 140,
    maxWpm: 999,
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    ringColor: 'border-rose-500 ring-2 ring-rose-500/50',
    borderColor: '#f43f5e',
    glowColor: 'shadow-[0_0_25px_rgba(244,63,94,0.55)]',
    textColor: 'text-rose-400'
  }
];

export function getTierInfo(highestWpm: number) {
  const currentTierIndex = TIERS.findIndex(
    (t, i) => highestWpm >= t.minWpm && (i === TIERS.length - 1 || highestWpm < TIERS[i + 1].minWpm)
  );

  const safeIndex = currentTierIndex === -1 ? 0 : currentTierIndex;
  const currentTier = TIERS[safeIndex];
  const nextTier = safeIndex < TIERS.length - 1 ? TIERS[safeIndex + 1] : null;

  let progress = 100;
  if (nextTier) {
    const range = nextTier.minWpm - currentTier.minWpm;
    const current = Math.max(0, highestWpm - currentTier.minWpm);
    progress = Math.min(100, Math.round((current / range) * 100));
  }

  return {
    name: currentTier.name,
    badgeColor: currentTier.badgeColor,
    ringColor: currentTier.ringColor,
    borderColor: currentTier.borderColor,
    glowColor: currentTier.glowColor,
    textColor: currentTier.textColor,
    minWpm: currentTier.minWpm,
    nextTierName: nextTier?.name || null,
    nextTierMinWpm: nextTier?.minWpm || null,
    progressPercentage: progress
  };
}

export function getDefaultProfile(): UserProfile {
  return {
    id: `local_${Date.now()}`,
    username: 'Mechanical Typist',
    avatarSwitch: 's1',
    createdAt: new Date().toISOString(),
    testsCompleted: 0,
    totalTimeSpentSeconds: 0,
    highestWpm: 0,
    averageWpm: 0,
    averageAccuracy: 100,
    averageConsistency: 100,
    tests: []
  };
}

export function normalizeTestRecord(t: any): SavedTestRecord {
  let normalizedTroubleKeys: TroubleKey[] = [];
  if (Array.isArray(t?.troubleKeys)) {
    normalizedTroubleKeys = t.troubleKeys
      .map((k: any) => {
        if (typeof k === 'object' && k && 'char' in k) {
          return { char: String(k.char), count: Number(k.count) || 1 };
        } else if (typeof k === 'string') {
          return { char: k, count: 1 };
        }
        return null;
      })
      .filter((k: any): k is TroubleKey => Boolean(k));
  } else if (t?.troubleKeys && typeof t.troubleKeys === 'object') {
    normalizedTroubleKeys = Object.entries(t.troubleKeys).map(([char, count]) => ({
      char: String(char),
      count: typeof count === 'number' ? count : 1
    }));
  }

  return {
    id: t?.id || `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: typeof t?.timestamp === 'number' ? t.timestamp : Date.now(),
    dateStr: typeof t?.dateStr === 'string' ? t.dateStr : new Date().toLocaleDateString(),
    wpm: Number(t?.wpm) || 0,
    rawWpm: Number(t?.rawWpm) || Number(t?.wpm) || 0,
    accuracy: Number(t?.accuracy) || 100,
    consistency: Number(t?.consistency) || 100,
    exactSeconds: Number(t?.exactSeconds) || 60,
    difficulty: (t?.difficulty as DifficultyMode) || 'easy',
    soundPack: (t?.soundPack as SoundPackId) || 's1',
    correctChars: Number(t?.correctChars) || 0,
    incorrectChars: Number(t?.incorrectChars) || 0,
    kps: Number(t?.kps) || 0,
    msPerKey: Number(t?.msPerKey) || 0,
    troubleKeys: normalizedTroubleKeys,
    tier: typeof t?.tier === 'string' ? t.tier : 'Standard'
  };
}

export function normalizeProfile(parsed: any): UserProfile {
  const def = getDefaultProfile();
  if (!parsed || typeof parsed !== 'object') return def;

  const tests: SavedTestRecord[] = Array.isArray(parsed.tests)
    ? parsed.tests.map(normalizeTestRecord)
    : [];

  return {
    id: parsed.id || def.id,
    username: parsed.username || def.username,
    avatarSwitch: parsed.avatarSwitch || def.avatarSwitch,
    createdAt: parsed.createdAt || def.createdAt,
    testsCompleted: typeof parsed.testsCompleted === 'number' ? parsed.testsCompleted : tests.length,
    totalTimeSpentSeconds: Number(parsed.totalTimeSpentSeconds) || 0,
    highestWpm: Number(parsed.highestWpm) || (tests.length > 0 ? Math.max(...tests.map((t: SavedTestRecord) => t.wpm)) : 0),
    averageWpm: Number(parsed.averageWpm) || (tests.length > 0 ? Math.round(tests.reduce((a: number, b: SavedTestRecord) => a + b.wpm, 0) / tests.length) : 0),
    averageAccuracy: Number(parsed.averageAccuracy) || 100,
    averageConsistency: Number(parsed.averageConsistency) || 100,
    tests
  };
}

export function getLocalProfile(): UserProfile {
  if (typeof window === 'undefined') return getDefaultProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const def = getDefaultProfile();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(def));
      return def;
    }
    const parsed = JSON.parse(raw);
    const normalized = normalizeProfile(parsed);
    return normalized;
  } catch {
    return getDefaultProfile();
  }
}

export function saveTestToProfile(results: TestResults): UserProfile {
  if (typeof window === 'undefined') return getDefaultProfile();
  const profile = getLocalProfile();

  const record: SavedTestRecord = {
    id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    dateStr: new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    wpm: results.wpm,
    rawWpm: results.rawWpm,
    accuracy: results.accuracy,
    consistency: results.consistency,
    exactSeconds: results.exactSeconds,
    difficulty: results.difficulty,
    soundPack: results.soundPack,
    correctChars: results.correctChars,
    incorrectChars: results.incorrectChars,
    kps: results.kps,
    msPerKey: results.msPerKey,
    troubleKeys: results.troubleKeys || [],
    tier: results.report?.tier || 'Standard'
  };

  const updatedTests = [record, ...profile.tests].slice(0, 200); // Keep last 200 sessions
  const testsCompleted = updatedTests.length;
  const totalTimeSpentSeconds = profile.totalTimeSpentSeconds + Math.round(results.exactSeconds);
  const highestWpm = Math.max(profile.highestWpm, results.wpm);
  const averageWpm = Math.round(
    updatedTests.reduce((acc, t) => acc + t.wpm, 0) / testsCompleted
  );
  const averageAccuracy = Math.round(
    (updatedTests.reduce((acc, t) => acc + t.accuracy, 0) / testsCompleted) * 10
  ) / 10;
  const averageConsistency = Math.round(
    updatedTests.reduce((acc, t) => acc + t.consistency, 0) / testsCompleted
  );

  const updatedProfile: UserProfile = {
    ...profile,
    testsCompleted,
    totalTimeSpentSeconds,
    highestWpm,
    averageWpm,
    averageAccuracy,
    averageConsistency,
    tests: updatedTests
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
  } catch {
    // Local storage full or private mode quota
  }

  return updatedProfile;
}

export function updateProfileSettings(
  settings: Partial<Pick<UserProfile, 'username' | 'avatarSwitch'>>
): UserProfile {
  const profile = getLocalProfile();
  const updated: UserProfile = {
    ...profile,
    ...settings
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function clearProfileHistory(): UserProfile {
  const profile = getLocalProfile();
  const reset: UserProfile = {
    ...profile,
    testsCompleted: 0,
    totalTimeSpentSeconds: 0,
    highestWpm: 0,
    averageWpm: 0,
    averageAccuracy: 100,
    averageConsistency: 100,
    tests: []
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
  } catch {}
  return reset;
}

export function deleteTestRecord(testId: string): UserProfile {
  const profile = getLocalProfile();
  const filtered = profile.tests.filter(t => t.id !== testId);
  const testsCompleted = filtered.length;
  const highestWpm = filtered.length > 0 ? Math.max(...filtered.map(t => t.wpm)) : 0;
  const averageWpm = filtered.length > 0
    ? Math.round(filtered.reduce((acc, t) => acc + t.wpm, 0) / testsCompleted)
    : 0;
  const averageAccuracy = filtered.length > 0
    ? Math.round((filtered.reduce((acc, t) => acc + t.accuracy, 0) / testsCompleted) * 10) / 10
    : 100;
  const averageConsistency = filtered.length > 0
    ? Math.round(filtered.reduce((acc, t) => acc + t.consistency, 0) / testsCompleted)
    : 100;

  const updated: UserProfile = {
    ...profile,
    testsCompleted,
    highestWpm,
    averageWpm,
    averageAccuracy,
    averageConsistency,
    tests: filtered
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function calculateImprovementStats(profile: UserProfile): ImprovementStats {
  const tests = profile.tests;
  const tierInfo = getTierInfo(profile.highestWpm);

  // Today's tests count
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const testsToday = tests.filter(t => t.timestamp >= startOfToday.getTime()).length;

  // Aggregate trouble keys defensively
  const troubleMap: Record<string, number> = {};
  tests.forEach((t) => {
    if (!t) return;
    if (Array.isArray(t.troubleKeys)) {
      t.troubleKeys.forEach((k: any) => {
        if (!k) return;
        if (typeof k === 'object' && 'char' in k) {
          troubleMap[k.char] = (troubleMap[k.char] || 0) + (Number(k.count) || 1);
        } else if (typeof k === 'string') {
          troubleMap[k] = (troubleMap[k] || 0) + 1;
        }
      });
    } else if (t.troubleKeys && typeof t.troubleKeys === 'object') {
      Object.entries(t.troubleKeys).forEach(([char, count]) => {
        if (char) {
          troubleMap[char] = (troubleMap[char] || 0) + (typeof count === 'number' ? count : 1);
        }
      });
    }
  });

  const topTroubleKeys = Object.entries(troubleMap)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (tests.length < 3) {
    return {
      hasEnoughData: false,
      wpmDelta: 0,
      wpmPercentageGrowth: 0,
      accuracyDelta: 0,
      earlyAverageWpm: profile.averageWpm,
      recentAverageWpm: profile.averageWpm,
      testsToday,
      topTroubleKeys,
      currentTier: tierInfo
    };
  }

  // Chronological order: earliest tests at start, latest tests at end
  const chronological = [...tests].reverse();
  const sampleSize = Math.min(5, Math.floor(chronological.length / 2)) || 1;

  const earlySlice = chronological.slice(0, sampleSize);
  const recentSlice = chronological.slice(-sampleSize);

  const earlyAverageWpm = Math.round(
    earlySlice.reduce((a, b) => a + b.wpm, 0) / earlySlice.length
  );
  const recentAverageWpm = Math.round(
    recentSlice.reduce((a, b) => a + b.wpm, 0) / recentSlice.length
  );

  const earlyAccuracy = earlySlice.reduce((a, b) => a + b.accuracy, 0) / earlySlice.length;
  const recentAccuracy = recentSlice.reduce((a, b) => a + b.accuracy, 0) / recentSlice.length;

  const wpmDelta = recentAverageWpm - earlyAverageWpm;
  const wpmPercentageGrowth = earlyAverageWpm > 0
    ? Math.round((wpmDelta / earlyAverageWpm) * 100)
    : 0;
  const accuracyDelta = Math.round((recentAccuracy - earlyAccuracy) * 10) / 10;

  return {
    hasEnoughData: true,
    wpmDelta,
    wpmPercentageGrowth,
    accuracyDelta,
    earlyAverageWpm,
    recentAverageWpm,
    testsToday,
    topTroubleKeys,
    currentTier: tierInfo
  };
}

export function exportProfileToJson(profile: UserProfile): string {
  return JSON.stringify(profile, null, 2);
}

export function importProfileFromJson(jsonText: string): boolean {
  try {
    const parsed = JSON.parse(jsonText);
    if (parsed && typeof parsed === 'object') {
      const normalized = normalizeProfile(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
