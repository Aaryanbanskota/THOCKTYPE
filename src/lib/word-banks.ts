/**
 * Standard English typing words used across Monkeytype and typing tests.
 * Words are randomly drawn to generate practice passages.
 */
export const COMMON_WORDS = [
  // Core rhythm words (matching reference screenshot)
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
  'solid', 'moment', 'spark', 'breeze', 'echo', 'deep', 'quick', 'shift',
  'stable', 'stroke', 'sense', 'vibe', 'relax', 'learn', 'grow',
  'style', 'power', 'grace', 'pulse', 'drift', 'shade', 'reach',

  // Common high-frequency English practice vocabulary
  'the', 'be', 'of', 'in', 'that', 'have', 'it', 'for', 'not', 'with', 'he',
  'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we',
  'say', 'her', 'she', 'or', 'an', 'will', 'my', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'who', 'get', 'which', 'go',
  'me', 'make', 'can', 'like', 'no', 'just', 'him', 'know', 'take', 'person',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
  'day', 'most', 'us', 'water', 'long', 'find', 'right', 'small', 'large',
  'house', 'hold', 'turn', 'start', 'show', 'keep', 'run', 'never', 'last',
  'might', 'great', 'always', 'where', 'open', 'same', 'begin', 'life',
  'still', 'between', 'under', 'never', 'place', 'while', 'near', 'state',
  'write', 'move', 'point', 'call', 'ask', 'number', 'system', 'program',
  'play', 'build', 'create', 'sound', 'simple', 'detail', 'energy', 'signal'
];

export const KEYBOARD_QUOTES = [
  'Practice pace to one instead follows eyes your pace the your follows brings rhythm and on allow when every your to low you your read keystrokes fade and eyes your to',
  'The mechanical keyboard transforms typing from an invisible chore into a tactile and auditory ritual of focus and rhythm.',
  'A rounded thock lands softly on the desk, absorbing high frequencies into a warm and comforting low-end cadence.',
  'Every keystroke carries weight and release, a dance between bottom-out actuation and the mechanical snap of the spring returning home.',
  'Typing at speed is about rhythm rather than raw force, letting your fingers glide effortlessly from key to key across the plate.'
];

/**
 * Randomly samples words from the curated bank.
 */
export function generateRandomWords(count: number = 50): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * COMMON_WORDS.length);
    words.push(COMMON_WORDS[randomIndex]);
  }
  return words;
}
