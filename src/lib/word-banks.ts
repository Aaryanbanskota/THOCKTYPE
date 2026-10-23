export const COMMON_WORDS = [
  'practice', 'pace', 'to', 'one', 'instead', 'follows', 'eyes', 'your', 'brings',
  'rhythm', 'and', 'on', 'allow', 'when', 'every', 'low', 'read', 'keystrokes',
  'fade', 'about', 'time', 'sound', 'switch', 'click', 'thock', 'smooth', 'linear',
  'tactile', 'board', 'space', 'enter', 'fast', 'slow', 'world', 'great', 'feel',
  'spring', 'press', 'mechanical', 'finger', 'desk', 'travel', 'accents', 'hands',
  'tempo', 'speed', 'quiet', 'clear', 'stream', 'flow', 'focus', 'sharp', 'gentle',
  'motion', 'craft', 'glide', 'glass', 'stone', 'music', 'layer', 'drive', 'point',
  'light', 'heavy', 'metal', 'stem', 'plate', 'custom', 'listen', 'hear', 'voice',
  'silent', 'crisp', 'round', 'punch', 'strike', 'letter', 'sentence', 'word', 'line',
  'rhythm', 'balance', 'natural', 'pure', 'calm', 'night', 'amber', 'frost', 'ruby',
  'chestnut', 'midnight', 'alpine', 'onyx', 'glacier', 'cream', 'clack', 'pop',
  'steady', 'cadence', 'thought', 'typing', 'repeat', 'fluid', 'habit', 'clean',
  'solid', 'glide', 'moment', 'spark', 'breeze', 'echo', 'deep', 'quick', 'shift',
  'stable', 'stroke', 'craft', 'sense', 'vibe', 'relax', 'learn', 'grow', 'sharp',
  'tempo', 'style', 'power', 'grace', 'pulse', 'drift', 'stone', 'shade', 'reach'
];

export const KEYBOARD_QUOTES = [
  'Practice pace to one instead follows eyes your pace the your follows brings rhythm and on allow when every your to low you your read keystrokes fade and eyes your to',
  'The mechanical keyboard transforms typing from an invisible chore into a tactile and auditory ritual of focus and rhythm.',
  'A rounded thock lands softly on the desk, absorbing high frequencies into a warm and comforting low-end cadence.',
  'Every keystroke carries weight and release, a dance between bottom-out actuation and the mechanical snap of the spring returning home.',
  'Typing at speed is about rhythm rather than raw force, letting your fingers glide effortlessly from key to key across the plate.'
];

export function generateRandomWords(count: number = 50): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * COMMON_WORDS.length);
    words.push(COMMON_WORDS[randomIndex]);
  }
  return words;
}
