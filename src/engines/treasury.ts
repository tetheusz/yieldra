/* ============================================
   TREASURY ENGINE
   Yield calculation + allocation logic
   
   Pure logic — no React dependency.
   ============================================ */

export interface StrategyState {
  name: string;
  apy: number;        // annual, e.g. 6.2
  allocated: number;  // $ amount
  earned: number;     // cumulative
  status: 'active' | 'paused';
}

export interface TreasurySnapshot {
  ownCapital: number;
  borrowedCapital: number;
  totalEquity: number;
  totalAllocated: number;
  idleCapital: number;
  reserveCurrent: number;
  reserveTarget: number;
  accumulatedYield: number;
  yieldThisMonth: number;
  strategies: StrategyState[];
}

/** Calculate yield for a single tick interval (in seconds) */
export function tickYield(strategy: StrategyState, intervalSeconds: number): number {
  if (strategy.status === 'paused' || strategy.allocated <= 0) return 0;
  const annualYield = strategy.allocated * (strategy.apy / 100);
  const secondsInYear = 365.25 * 24 * 3600;
  return annualYield * (intervalSeconds / secondsInYear);
}

/** Process one tick: accrue yield across all active strategies */
export function accrueYield(
  snapshot: TreasurySnapshot,
  intervalSeconds: number
): { updatedSnapshot: TreasurySnapshot; totalYieldThisTick: number } {
  let totalYieldThisTick = 0;

  const updatedStrategies = snapshot.strategies.map(s => {
    const yieldAmount = tickYield(s, intervalSeconds);
    totalYieldThisTick += yieldAmount;
    return {
      ...s,
      earned: Math.round((s.earned + yieldAmount) * 100) / 100,
    };
  });

  return {
    updatedSnapshot: {
      ...snapshot,
      strategies: updatedStrategies,
      accumulatedYield: Math.round((snapshot.accumulatedYield + totalYieldThisTick) * 100) / 100,
      yieldThisMonth: Math.round((snapshot.yieldThisMonth + totalYieldThisTick) * 100) / 100,
      totalEquity: Math.round((snapshot.totalEquity + totalYieldThisTick) * 100) / 100,
      ownCapital: Math.round((snapshot.ownCapital + totalYieldThisTick) * 100) / 100,
    },
    totalYieldThisTick,
  };
}

/** Check if reserve needs topping up */
export function reserveDeficit(current: number, target: number): number {
  return Math.max(0, target - current);
}

/** Simulate APY fluctuation (small noise) */
export function perturbAPY(currentAPY: number, maxDelta: number = 0.3): number {
  const delta = (Math.random() * 2 - 1) * maxDelta;
  const newAPY = currentAPY + delta;
  return Math.max(0.5, Math.round(newAPY * 10) / 10);
}

/** Add equity history data point */
export function addEquityPoint(
  history: { day: number; value: number }[],
  value: number,
  maxPoints: number = 60
): { day: number; value: number }[] {
  const lastDay = history.length > 0 ? history[history.length - 1].day : 0;
  const updated = [...history, { day: lastDay + 1, value: Math.round(value * 100) / 100 }];
  return updated.length > maxPoints ? updated.slice(-maxPoints) : updated;
}
