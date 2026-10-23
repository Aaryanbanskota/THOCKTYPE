export type SoundPackId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8';

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
  mode: 'time' | 'words' | 'unlimited';
  duration: 15 | 30 | 60 | 90;
  wordCount: 25 | 50 | 100;
  competitive: boolean;
  soundPack: SoundPackId;
}

export interface WpmDataPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TestResults {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  timeSpent: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalKeystrokes: number;
  consistency: number;
  soundPack: SoundPackId;
  history: WpmDataPoint[];
}
