import { SwitchProfile, SoundPackId } from '@/types/sound';

export const SWITCH_PROFILES: Record<SoundPackId, SwitchProfile> = {
  s1: {
    id: 's1',
    name: 'Frost Click',
    category: 'Clicky',
    tagline: 'Crisp, unmistakable click with razor-sharp mechanical snap',
    description:
      'The sharpest of the lineup — a crisp, unmistakable click on every press. This is the sound most people picture when they think "mechanical keyboard," and the one your colleagues will notice.',
    color: '#38bdf8', // sky blue
    accentClass: 'text-sky-400 border-sky-500/30 bg-sky-500/10 hover:border-sky-400',
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    pitch: 'High',
    loudness: 'Loud',
    actuation: '50g (Clicky stem)',
    bottomOut: '60g bottom-out',
    sampleFiles: ['20.mp3', '21.mp3', '22.mp3', '23.mp3', '24.mp3', '57.mp3', '28.mp3'],
    iconName: 'Snowflake'
  },
  s2: {
    id: 's2',
    name: 'Ruby Thock',
    category: 'Linear',
    tagline: 'Deep, rounded thock with effortless linear glide',
    description:
      'Smooth and linear, with no click at all. Each press lands as a rounded thock rather than a snap, which makes it one of the easiest sounds to type on for hours.',
    color: '#f43f5e', // rose / ruby
    accentClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:border-rose-400',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    pitch: 'Low',
    loudness: 'Medium',
    actuation: '45g (Smooth linear)',
    bottomOut: '55g bottom-out',
    sampleFiles: ['20.mp3', '21.mp3', '22.mp3', '23.mp3', '24.mp3', '57.mp3', '28.mp3'],
    iconName: 'Gem'
  },
  s3: {
    id: 's3',
    name: 'Chestnut Bump',
    category: 'Tactile',
    tagline: 'Soft tactile bump without harsh high-end rattle',
    description:
      'A soft tactile bump without the sharp click — the middle ground. You feel the keystroke in the sound without it cutting through the room.',
    color: '#d97706', // warm amber / chestnut
    accentClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:border-amber-400',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    pitch: 'Medium',
    loudness: 'Medium',
    actuation: '55g (Subtle bump)',
    bottomOut: '62g bottom-out',
    sampleFiles: ['20.mp3', '21.mp3', '22.mp3', '23.mp3', '24.mp3', '57.mp3', '28.mp3'],
    iconName: 'Nut'
  },
  s4: {
    id: 's4',
    name: 'Midnight Thock',
    category: 'Linear',
    tagline: 'Heaviest, low-end muted acoustic profile for shared rooms',
    description:
      'The deepest and most muted pack. Heavy, low-end, and close to a well-dampened board — the quietest option if you are working somewhere shared.',
    color: '#818cf8', // indigo / midnight
    accentClass: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 hover:border-indigo-400',
    badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    pitch: 'Very Low',
    loudness: 'Quiet',
    actuation: '62g (Silent dampened)',
    bottomOut: '67g bottom-out',
    sampleFiles: ['20.mp3', '21.mp3', '22.mp3', '23.mp3', '24.mp3', '57.mp3', '28.mp3'],
    iconName: 'Moon'
  },
  s5: {
    id: 's5',
    name: 'Alpine Pop',
    category: 'Linear',
    tagline: 'Light, glassy, and quick with a lively patter at speed',
    description:
      'Light, glassy, and quick — a bright linear with a poppy top note on every press. No click, no bump, just a lively patter that stays crisp at speed.',
    color: '#10b981', // emerald / alpine
    accentClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    pitch: 'High',
    loudness: 'Medium',
    actuation: '42g (Featherweight linear)',
    bottomOut: '50g bottom-out',
    sampleFiles: ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '201.mp3', '301.mp3'],
    iconName: 'Mountain'
  },
  s6: {
    id: 's6',
    name: 'Onyx Glide',
    category: 'Linear',
    tagline: 'Smooth, deep linear closer to a soft drum than a click',
    description:
      'A smooth, deep linear with the edges rounded off. Presses land low and even, closer to a soft drum than a click — a calm sound for long sessions.',
    color: '#a1a1aa', // sleek zinc / onyx
    accentClass: 'text-zinc-300 border-zinc-500/30 bg-zinc-500/10 hover:border-zinc-300',
    badgeBg: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
    pitch: 'Low',
    loudness: 'Quiet',
    actuation: '55g (Lubed stem)',
    bottomOut: '65g bottom-out',
    sampleFiles: ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '201.mp3', '301.mp3'],
    iconName: 'Disc'
  },
  s7: {
    id: 's7',
    name: 'Glacier Glide',
    category: 'Linear',
    tagline: 'Cool glassy clack, lighter than thock, gentler than click',
    description:
      'Bright and clean without being clicky. A slick linear with a cool, glassy clack — lighter than the thock packs, gentler than a true click.',
    color: '#22d3ee', // ice cyan
    accentClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-400',
    badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    pitch: 'Medium',
    loudness: 'Medium',
    actuation: '48g (Polished linear)',
    bottomOut: '58g bottom-out',
    sampleFiles: ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '201.mp3', '301.mp3'],
    iconName: 'Wind'
  },
  s8: {
    id: 's8',
    name: 'Cream Clack',
    category: 'Linear',
    tagline: 'Deep plush bottom-out with crisp satisfying clack',
    description:
      'Full and rounded with a satisfying clack on the bottom-out. The plushest-sounding pack of the set — deep like a thock, but with more snap to it.',
    color: '#fde047', // cream yellow
    accentClass: 'text-amber-300 border-amber-400/30 bg-amber-400/10 hover:border-amber-300',
    badgeBg: 'bg-amber-400/15 text-amber-200 border-amber-400/30',
    pitch: 'Medium',
    loudness: 'Loud',
    actuation: '55g (POM housing)',
    bottomOut: '70g bottom-out',
    sampleFiles: ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '201.mp3', '301.mp3'],
    iconName: 'Coffee'
  }
};

export const PACK_IDS: SoundPackId[] = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
