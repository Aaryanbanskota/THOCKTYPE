import { BenchmarkReport, DifficultyMode, TroubleKey } from '@/types/sound';

export interface BenchmarkInput {
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  exactSeconds: number;
  correctChars: number;
  incorrectChars: number;
  correctedErrors: number;
  totalErrorsCommitted: number;
  backspaceCount: number;
  totalKeystrokes: number;
  consistency: number;
  difficulty: DifficultyMode;
  troubleKeys: TroubleKey[];
}

/**
 * Pure mathematical benchmark analysis engine.
 * 100% Client-side, 0% AI, 0% external APIs.
 * Generates harsh technical diagnostics, potential capacity calculations,
 * and motivational growth guidance based purely on real keystroke physics.
 */
export function analyzeBenchmark(data: BenchmarkInput): BenchmarkReport {
  const {
    netWpm,
    rawWpm,
    accuracy,
    exactSeconds,
    correctChars,
    incorrectChars,
    correctedErrors,
    totalErrorsCommitted,
    backspaceCount,
    totalKeystrokes,
    consistency,
    difficulty,
    troubleKeys
  } = data;

  const kps = exactSeconds > 0 ? Math.round((totalKeystrokes / exactSeconds) * 10) / 10 : 0;
  const msPerKey = totalKeystrokes > 0 ? Math.round((exactSeconds * 1000) / totalKeystrokes) : 0;
  const efficiency = totalKeystrokes > 0
    ? Math.max(0, Math.min(100, Math.round((correctChars / totalKeystrokes) * 1000) / 10))
    : 100;

  // 1. Determine Typist Tier
  let tier = 'Foundation Typist';
  let tierBadgeColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';

  if (netWpm < 25) {
    tier = 'Novice / Developing Tier';
    tierBadgeColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  } else if (netWpm < 45) {
    tier = 'Conversational Flow Tier';
    tierBadgeColor = 'text-sky-400 border-sky-500/40 bg-sky-500/10';
  } else if (netWpm < 65) {
    tier = 'Productive Professional Tier';
    tierBadgeColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  } else if (netWpm < 85) {
    tier = 'High-Cadence Specialist Tier';
    tierBadgeColor = 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
  } else if (netWpm < 110) {
    tier = 'Elite Mechanical Master Tier';
    tierBadgeColor = 'text-purple-400 border-purple-500/40 bg-purple-500/10';
  } else {
    tier = 'Hypersonic Grandmaster Tier';
    tierBadgeColor = 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  }

  // 2. Projected Capacity & Motivational Coaching
  // Specifically implements: "If it's 20, it will say you have capacity to increase to 30, 40. If you do a little bit hard, you can increase it to 40. It should also give some motivation to the user."
  let projectedWpmMin = 30;
  let projectedWpmMax = 40;
  let potentialHeadline = '';
  let motivationMessage = '';

  if (netWpm < 20) {
    projectedWpmMin = 30;
    projectedWpmMax = 40;
    potentialHeadline = `Current: ${netWpm} WPM → Verified Capacity to hit 30 – 40 WPM (+${Math.max(12, 40 - netWpm)} WPM Boost)`;
    motivationMessage = `You clocked ${netWpm} WPM today. Don't worry at all about where you start — your finger actuation mechanics show you have the clear capacity to increase to 30, 40 WPM! If you push just a little bit harder on keeping your fingers anchored to the home-row (A-S-D-F and J-K-L-;) without looking down at your keyboard, you can increase your speed to 40 WPM within 10–14 days. Every keystroke is building permanent muscle memory. Keep your head high, maintain your posture, and practice 10 minutes daily — you are going to blow past 40 WPM very soon!`;
  } else if (netWpm >= 20 && netWpm < 35) {
    projectedWpmMin = 35;
    projectedWpmMax = 50;
    potentialHeadline = `Current: ${netWpm} WPM → Target Capacity of 40 – 50 WPM (+${Math.max(10, 45 - netWpm)} WPM Leap)`;
    motivationMessage = `At ${netWpm} WPM, you already have the core keyboard layout memorized! Your natural finger travel shows the capacity to increase to 40, and with deliberate focus, easily up to 50 WPM. If you push a little bit harder on eliminating pauses between words and trusting your ring and pinky fingers, you will break the 40–45 WPM threshold very quickly. Stay motivated — the jump from 20s into 40s is the most rewarding leap in typing, and you are right at the edge of it!`;
  } else if (netWpm >= 35 && netWpm < 55) {
    projectedWpmMin = 55;
    projectedWpmMax = 70;
    potentialHeadline = `Current: ${netWpm} WPM → Target Velocity of 60 – 70 WPM (+${65 - netWpm} WPM Leap)`;
    motivationMessage = `Solid work at ${netWpm} WPM! You are already typing as fast as the average working professional. Your finger fluidity demonstrates the capacity to reach 60 to 70 WPM. If you work a little bit on "lookahead reading" — training your eyes to preview 2 words ahead while your fingers type the current word — you will cut micro-hesitations and cross 65 WPM smoothly. You have great momentum, keep pushing!`;
  } else if (netWpm >= 55 && netWpm < 80) {
    projectedWpmMin = 75;
    projectedWpmMax = 95;
    potentialHeadline = `Current: ${netWpm} WPM → High-Velocity Target of 80 – 95 WPM`;
    motivationMessage = `Impressive! At ${netWpm} WPM you are faster than 75% of computer users worldwide. Your motor control proves you have the physical capacity to hit 80 to 95 WPM. If you focus on utilizing the mechanical spring rebound of your switches and tightening finger-lift elevation, 90+ WPM is completely attainable. Stay disciplined with high-precision reps!`;
  } else if (netWpm >= 80 && netWpm < 105) {
    projectedWpmMin = 100;
    projectedWpmMax = 120;
    potentialHeadline = `Current: ${netWpm} WPM → Elite Triple-Digit Target: 105 – 120 WPM`;
    motivationMessage = `Exceptional ${netWpm} WPM pace! You are typing at the level of seasoned software engineers and courtroom transcriptionists. You have the mechanical precision to break the coveted 100+ WPM milestone. Push hard on rolling burst patterns across multi-letter stems (-ing, -tion, -ment) and you will solidify triple digits permanently!`;
  } else {
    projectedWpmMin = Math.round(netWpm + 10);
    projectedWpmMax = Math.round(netWpm + 25);
    potentialHeadline = `Current: ${netWpm} WPM → Grandmaster Territory: ${projectedWpmMin} – ${projectedWpmMax} WPM`;
    motivationMessage = `Hypersonic performance at ${netWpm} WPM! You are operating in the top 0.5% of competitive mechanical typists. Your actuation cadence is virtually seamless. At this tier, tiny micro-adjustments in switch bottom-out force and wrist elevation will elevate you toward ${projectedWpmMax} WPM. A true masterclass!`;
  }

  // 3. Harsh Technical Diagnostics (Honest, Unforgiving Keystroke Audits)
  const harshDiagnostics: BenchmarkReport['harshDiagnostics'] = [];

  // Audit 1: Speed Leakage (Raw WPM vs Net WPM Penalty)
  const speedGap = Math.max(0, Math.round((rawWpm - netWpm) * 10) / 10);
  if (speedGap >= 12) {
    harshDiagnostics.push({
      title: `Critical Speed Leakage: -${speedGap} WPM Lost to Typos`,
      description: `Your hands reached a raw speed of ${rawWpm} WPM, but errors stripped away ${speedGap} WPM from your verified net score. You are overdriving your muscle memory. Slow down your fingers by 10% until your accuracy reaches 98%; your net score will immediately surge past ${Math.round(netWpm + speedGap * 0.7)} WPM.`,
      severity: 'critical'
    });
  } else if (speedGap >= 5) {
    harshDiagnostics.push({
      title: `Moderate Speed Friction: -${speedGap} WPM Penalty`,
      description: `You gave away ${speedGap} WPM due to unforced errors and correction cycles. Tightening your stroke accuracy will instantly translate your raw speed (${rawWpm} WPM) into net output.`,
      severity: 'warning'
    });
  } else {
    harshDiagnostics.push({
      title: `Exceptional Energy Transfer: Only -${speedGap} WPM Lost`,
      description: `Outstanding efficiency. Almost 100% of your raw finger velocity (${rawWpm} WPM) converted cleanly into verified net words (${netWpm} WPM).`,
      severity: 'good'
    });
  }

  // Audit 2: Precision & Accuracy Strictness
  if (accuracy < 92) {
    harshDiagnostics.push({
      title: `Precision Deficit: ${accuracy}% (Unacceptable in Production)`,
      description: `A precision rate of ${accuracy}% means 1 out of every ${Math.max(1, Math.round(100 / (100 - accuracy)))} keystrokes was an error. In real typing, stopping to fix typos takes 3× longer than typing cleanly. Force yourself to complete runs at 98%+ accuracy before attempting to speed up.`,
      severity: 'critical'
    });
  } else if (accuracy < 97) {
    harshDiagnostics.push({
      title: `Acceptable Precision: ${accuracy}% (Room for Muscle Memory Polish)`,
      description: `Solid accuracy at ${accuracy}%, with ${totalErrorsCommitted} total misstrikes recorded. Reaching 98.5%+ will stabilize your cadence and eliminate hesitation pauses.`,
      severity: 'warning'
    });
  } else {
    harshDiagnostics.push({
      title: `Surgical Precision: ${accuracy}%`,
      description: `Superb strike accuracy. You maintained strict control of key travel with virtually zero wasted movements.`,
      severity: 'good'
    });
  }

  // Audit 3: Backspace Addiction & Correction Friction
  if (backspaceCount >= 18) {
    harshDiagnostics.push({
      title: `Backspace Addiction: ${backspaceCount} Backspaces Hit`,
      description: `You pressed backspace ${backspaceCount} times during this test. Assuming an average correction cost of 250ms, you lost approximately ${Math.round((backspaceCount * 0.25) * 10) / 10} seconds of pure dead time. Practice letting go of perfectionism and focus on forward kinetic flow.`,
      severity: 'critical'
    });
  } else if (backspaceCount >= 7) {
    harshDiagnostics.push({
      title: `Correction Friction: ${backspaceCount} Backspaces`,
      description: `${backspaceCount} backspaces pressed (${correctedErrors} errors successfully repaired). Minimizing backspace reliance will automatically raise your WPM by ~5–8 points.`,
      severity: 'warning'
    });
  } else {
    harshDiagnostics.push({
      title: `Clean Recovery: Only ${backspaceCount} Backspaces`,
      description: `Very low backspace friction. You trusted your initial keystrokes and preserved forward typing momentum.`,
      severity: 'good'
    });
  }

  // Audit 4: Cadence Uniformity (Consistency)
  if (consistency < 65) {
    harshDiagnostics.push({
      title: `Erratic Burst-and-Stall Cadence (${consistency}%)`,
      description: `You are exhibiting severe pacing variance: sprinting across simple words and stalling heavily on complex letter pairings. Mechanical keyboards excel when typed with an even metronomic rhythm.`,
      severity: 'warning'
    });
  } else {
    harshDiagnostics.push({
      title: `Consistent Metronomic Cadence (${consistency}%)`,
      description: `Uniform keydown intervals with steady pacing between word transitions. This rhythmic stability preserves stamina during long typing sessions.`,
      severity: 'good'
    });
  }

  // 4. Trouble Keys Hit-List
  let keyTrainingRecommendation = 'All keystrokes executed cleanly with no recurring trouble keys.';
  if (troubleKeys && troubleKeys.length > 0) {
    const list = troubleKeys
      .slice(0, 4)
      .map((t) => `'${t.char === ' ' ? 'Space' : t.char}' (${t.count} miss${t.count > 1 ? 'es' : ''})`)
      .join(', ');
    keyTrainingRecommendation = `Specific target keys to drill: ${list}. These specific keys accounted for the majority of your errors today. Practicing 20 words featuring these keys will yield immediate speed gains.`;
  }

  return {
    tier,
    tierBadgeColor,
    projectedWpmMin,
    projectedWpmMax,
    potentialHeadline,
    motivationMessage,
    harshDiagnostics,
    keyTrainingRecommendation,
    kps,
    msPerKey,
    efficiency
  };
}
