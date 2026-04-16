/* ============================================
   SCORING ENGINE
   Behavioral score calculation
   
   Pure logic — no React dependency.
   Can be extracted to a standalone package.
   ============================================ */

/** Scoring factors with configurable weights */
export interface ScoringFactors {
  paymentHistoryOnTime: number;    // 0-1: ratio of on-time payments
  accountAge: number;              // days since account creation
  cashFlowStability: number;       // 0-1: variance metric (lower = more stable = better)
  creditUtilization: number;       // 0-1: current utilization ratio
  reserveHealth: number;           // 0-1: reserve current / reserve target
  yieldConsistency: number;        // 0-1: how consistent yield generation has been
}

interface ScoreWeights {
  paymentHistory: number;
  accountAge: number;
  cashFlowStability: number;
  creditUtilization: number;
  reserveHealth: number;
  yieldConsistency: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  paymentHistory: 0.30,
  accountAge: 0.10,
  cashFlowStability: 0.15,
  creditUtilization: 0.20,
  reserveHealth: 0.15,
  yieldConsistency: 0.10,
};

const MAX_SCORE = 850;
const MIN_SCORE = 300;

/** Calculate behavioral score from factors */
export function calculateScore(
  factors: ScoringFactors,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
  // Normalize account age: 0-1 scale, maxes out at 365 days
  const ageNorm = Math.min(factors.accountAge / 365, 1);

  // Credit utilization score: lower is better (inverse)
  const utilScore = 1 - factors.creditUtilization;

  const raw =
    factors.paymentHistoryOnTime * weights.paymentHistory +
    ageNorm * weights.accountAge +
    factors.cashFlowStability * weights.cashFlowStability +
    utilScore * weights.creditUtilization +
    factors.reserveHealth * weights.reserveHealth +
    factors.yieldConsistency * weights.yieldConsistency;

  return Math.round(MIN_SCORE + raw * (MAX_SCORE - MIN_SCORE));
}

/** Derive grade from score */
export function scoreToGrade(score: number): { grade: string; key: string } {
  if (score >= 750) return { grade: 'Excellent', key: 'excellent' };
  if (score >= 650) return { grade: 'Good', key: 'good' };
  if (score >= 550) return { grade: 'Fair', key: 'fair' };
  return { grade: 'Poor', key: 'poor' };
}

/** Simulate small score fluctuation (for autopilot loop) */
export function perturbScore(currentScore: number, direction: 'up' | 'down' | 'stable'): number {
  const noise = Math.floor(Math.random() * 4) - 1; // -1 to +2
  const drift = direction === 'up' ? 2 : direction === 'down' ? -2 : 0;
  const newScore = currentScore + drift + noise;
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, newScore));
}
