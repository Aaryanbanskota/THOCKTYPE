import { DifficultyMode } from '@/types/sound';

/**
 * Standard English typing words used across Monkeytype and typing tests.
 */
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
  'balance', 'natural', 'pure', 'calm', 'night', 'amber', 'frost', 'ruby',
  'chestnut', 'midnight', 'alpine', 'onyx', 'glacier', 'cream', 'clack', 'pop',
  'steady', 'cadence', 'thought', 'typing', 'repeat', 'fluid', 'habit', 'clean',
  'solid', 'moment', 'spark', 'breeze', 'echo', 'deep', 'quick', 'shift',
  'stable', 'stroke', 'sense', 'vibe', 'relax', 'learn', 'grow',
  'style', 'power', 'grace', 'pulse', 'drift', 'shade', 'reach',
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
  'play', 'build', 'create', 'simple', 'detail', 'energy', 'signal'
];

const MEDIUM_CONTRACTIONS = [
  "don't", "it's", "we're", "can't", "they'll", "you've", "there's", "won't", "isn't"
];

const HARD_PATTERNS = [
  'const speed = 120;',
  'switch[#42] = true;',
  'return { wpm: 98, acc: 99.5% };',
  'while (time > 0) { type(); }',
  'if (keys.length >= 10) return "pass";',
  '#include <keyboard.h>',
  '$total = (count * 100) / 60;',
  'rgb(245, 158, 11)',
  'Stem: POM (50g);',
  'array.map((x) => x + 1);',
  'path/to/switch.mp3',
  'assert(accuracy == 100%);',
  'User[#8]: "Ruby Thock";',
  'key_code: 57 // Space',
  '/* 4.0mm travel */',
  'options = { volume: 0.75, pitch: 1.0 };',
  'console.log("thock!");',
  'delay(150); -> ok',
  'status: 200 OK;',
  '[Clicky, Linear, Tactile]',
  'border: 2px solid #f59e0b;',
  'event.preventDefault();',
  'pressure >= 62g ? "bottom_out" : "actuation";',
  'f(x) = (x * 12) + 42;',
  'ThockType.v2.0 #2026',
  'calc(100% - 24px);',
  'font-family: "Geist Mono", monospace;',
  '<SoundProvider volume={0.8} />',
  'git commit -m "feat(keys): 100% precision"',
  'https://typelouder.app/switch-lab?mode=hard',
  'let result = (wpm * 5) / (seconds || 60);',
  'keyPressCount[index] += 1;',
  'rgba(16, 185, 129, 0.95);',
  'const [active, setActive] = useState(true);',
  'npm run build && bun test',
  'switch (key) { case "Space": return 32; }',
  'echo "mechanical switches" > profile.json',
  'travel_distance = 3.6mm ~ 4.0mm;'
];

/**
 * Generate typing word array based on chosen difficulty.
 */
export function generateTextByDifficulty(
  difficulty: DifficultyMode = 'easy',
  count: number = 50
): string[] {
  const words: string[] = [];

  if (difficulty === 'easy') {
    // Pure clean lowercase words
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * COMMON_WORDS.length);
      words.push(COMMON_WORDS[randomIndex]);
    }
    return words;
  }

  if (difficulty === 'medium') {
    // Sentences with capitalization, commas, periods, and contractions
    let capitalizeNext = true;
    for (let i = 0; i < count; i++) {
      let word = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];

      // Inject occasional contraction
      if (Math.random() < 0.12) {
        word = MEDIUM_CONTRACTIONS[Math.floor(Math.random() * MEDIUM_CONTRACTIONS.length)];
      }

      if (capitalizeNext) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
        capitalizeNext = false;
      }

      // Natural punctuation: commas every 4-7 words, periods every 8-13 words
      if (i > 0 && i % 6 === 0 && i !== count - 1 && !word.endsWith('.')) {
        word += ',';
      } else if (i > 0 && i % 11 === 0 && i !== count - 1) {
        word += '.';
        capitalizeNext = true;
      }

      words.push(word);
    }
    return words;
  }

  // Hard Mode: Complete keyboard practice (numbers 1-9, symbols, brackets, quotes, code, caps)
  const tokens: string[] = [];
  while (tokens.length < count) {
    if (Math.random() < 0.45) {
      // Pick a technical symbol / bracket / number pattern
      const pattern = HARD_PATTERNS[Math.floor(Math.random() * HARD_PATTERNS.length)];
      const parts = pattern.split(' ');
      tokens.push(...parts);
    } else {
      let word = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];

      const roll = Math.random();
      if (roll < 0.25) {
        word = word.toUpperCase();
      } else if (roll < 0.45) {
        word = word + '(' + Math.floor(Math.random() * 90 + 10) + ')';
      } else if (roll < 0.6) {
        word = '[' + word + ']';
      } else if (roll < 0.75) {
        word = '$' + word + ';';
      } else if (roll < 0.9) {
        word = '"' + word + '"!';
      }

      tokens.push(word);
    }
  }

  return tokens.slice(0, count);
}

/**
 * Backwards compatible helper
 */
export function generateRandomWords(count: number = 50): string[] {
  return generateTextByDifficulty('easy', count);
}
