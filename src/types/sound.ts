export type SoundPackId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8';

export type DifficultyMode = 'easy' | 'medium' | 'hard';

export interface SwitchProfile {
  id: SoundPackId;
  name: string;
  category: 'Clicky' | 'Linear' | 'Tactile';
  tagline: string;
  description: string;
  color: string;
  accentClass: string;
  badgeBg: string;
  pitch: 'Very Low' | 'Low' | 'Medium' | 'High';
  loudness: 'Quiet' | 'Medium' | 'Loud';
  actuation: string;
  bottomOut: string;
  sampleFiles: string[];
  iconName: 'Snowflake' | 'Gem' | 'Nut' | 'Moon' | 'Mountain' | 'Disc' | 'Wind' | 'Coffee';
}

export interface SoundEngineOptions {
  volume: number;
  pitchShift: number;
  stereoSpread: boolean;
  playKeyUp: boolean;
  deskmatResonance: boolean;
}

export interface TestSettings {
  mode: 'time' | 'words' | 'unlimited' | 'custom';
  duration: 15 | 30 | 60 | 90;
  wordCount: 25 | 50 | 100;
  difficulty: DifficultyMode;
  competitive: boolean;
  soundPack: SoundPackId;
}

export interface WpmDataPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TroubleKey {
  char: string;
  count: number;
}

export interface BenchmarkReport {
  tier: string;
  tierBadgeColor: string;
  projectedWpmMin: number;
  projectedWpmMax: number;
  potentialHeadline: string;
  motivationMessage: string;
  harshDiagnostics: {
    title: string;
    description: string;
    severity: 'good' | 'warning' | 'critical';
  }[];
  keyTrainingRecommendation: string;
  kps: number;
  msPerKey: number;
  efficiency: number;
}

export interface TestResults {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  timeSpent: number;
  exactSeconds: number;
  difficulty: DifficultyMode;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalKeystrokes: number;
  backspaceCount: number;
  correctedErrors: number;
  totalErrorsCommitted: number;
  consistency: number;
  efficiency: number;
  kps: number;
  msPerKey: number;
  troubleKeys: TroubleKey[];
  soundPack: SoundPackId;
  history: WpmDataPoint[];
  errorTimestamps?: number[];
  report: BenchmarkReport;
}
