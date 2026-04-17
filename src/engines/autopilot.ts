/* ============================================
   AUTOPILOT SIMULATION
   Orchestrates all engines on a timer loop.
   Generates realistic state transitions.
   
   Pure logic — receives state, returns new state.
   ============================================ */

import { perturbScore, scoreToGrade } from './scoring';
import { calculateCredit, monthlyInterest } from './credit';
import { accrueYield, perturbAPY, addEquityPoint, type TreasurySnapshot } from './treasury';
import { assessRisk, checkForAlerts } from './risk';
import type { AppState, AgentLogEntry, Alert } from '../state/store';

/** Simulation config */
export interface SimConfig {
  tickIntervalMs: number;          // how often the sim runs (real time)
  simulatedSecondsPerTick: number; // how much sim-time passes per tick
  yieldAccrual: boolean;
  scoreFluctuation: boolean;
  apyFluctuation: boolean;
  logGeneration: boolean;
  alertGeneration: boolean;
}

export const DEFAULT_SIM_CONFIG: SimConfig = {
  tickIntervalMs: 3000,             // every 3 seconds
  simulatedSecondsPerTick: 3600,    // each tick = 1 simulated hour
  yieldAccrual: true,
  scoreFluctuation: true,
  apyFluctuation: true,
  logGeneration: true,
  alertGeneration: true,
};

/** Action templates for log generation */
const LOG_TEMPLATES: { action: string; type: AgentLogEntry['type'] }[] = [
  { action: 'Yield harvested from {strategy}: ${amount}', type: 'harvest' },
  { action: 'Risk threshold check — all clear', type: 'check' },
  { action: 'Daily equity snapshot recorded', type: 'snapshot' },
  { action: 'Rebalanced {strategy} position', type: 'rebalance' },
  { action: 'Credit utilization at {util}% — within target', type: 'check' },
  { action: 'Reserve topped up by ${amount}', type: 'allocation' },
  { action: 'Agent {agent} requested unsecured loan of ${amount} USDC', type: 'loan' },
  { action: 'Agent {agent} repaid loan + ${fee} USDC fee', type: 'payment' },
  { action: 'CRITICAL: Agent {agent} slashed. Reputation reset to 0.', type: 'slash' },
];

/** Generate a time string for the current sim time */
function simTimeString(tickCount: number): string {
  const hour = (8 + Math.floor(tickCount / 4)) % 24;
  const minute = (tickCount * 15) % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/** Run one simulation tick */
export function simulateTick(
  state: AppState,
  config: SimConfig,
  tickCount: number
): Partial<AppState> {
  const updates: Partial<AppState> = {};

  // ── 1. Yield Accrual ──
  if (config.yieldAccrual && state.autopilotStatus === 'active') {
    const treasurySnap: TreasurySnapshot = {
      ownCapital: state.ownCapital,
      borrowedCapital: state.borrowedCapital,
      totalEquity: state.totalEquity,
      totalAllocated: state.totalAllocated,
      idleCapital: state.idleCapital,
      reserveCurrent: state.reserveCurrent,
      reserveTarget: state.reserveTarget,
      accumulatedYield: state.accumulatedYield,
      yieldThisMonth: state.yieldThisMonth,
      strategies: state.strategies,
    };

    const { updatedSnapshot, totalYieldThisTick } = accrueYield(
      treasurySnap,
      config.simulatedSecondsPerTick
    );

    Object.assign(updates, {
      strategies: updatedSnapshot.strategies,
      accumulatedYield: updatedSnapshot.accumulatedYield,
      yieldThisMonth: updatedSnapshot.yieldThisMonth,
      totalEquity: updatedSnapshot.totalEquity,
      ownCapital: updatedSnapshot.ownCapital,
      netWorth: updatedSnapshot.totalEquity,
    });

    // Interest accrual on debt (every ~24 ticks = 1 day)
    if (tickCount % 24 === 0 && state.currentDebt > 0) {
      const creditResult = calculateCredit({
        behavioralScore: state.behavioralScore,
        ownCapital: updatedSnapshot.ownCapital,
        totalEquity: updatedSnapshot.totalEquity,
        currentDebt: state.currentDebt,
        reserveCurrent: state.reserveCurrent,
        reserveTarget: state.reserveTarget,
      });

      const dailyInterest = monthlyInterest(state.currentDebt, creditResult.interestRate) / 30;
      updates.debtInterest = Math.round((state.debtInterest + dailyInterest) * 100) / 100;
    }

    // Update equity history (every ~6 ticks)
    if (tickCount % 6 === 0) {
      updates.equityHistory = addEquityPoint(
        state.equityHistory,
        updatedSnapshot.totalEquity
      );
    }

    // Auto-repayment (every ~168 ticks = 1 week simulated)
    if (tickCount % 168 === 0 && state.currentDebt > 0 && totalYieldThisTick > 0) {
      const repayAmount = Math.min(
        totalYieldThisTick * 10 * state.profitDistribution.amortization / 100,
        state.currentDebt
      );
      if (repayAmount > 0.01) {
        updates.currentDebt = Math.round((state.currentDebt - repayAmount) * 100) / 100;
        updates.creditUsed = updates.currentDebt;
      }
    }
  }

  // ── 2. Score Fluctuation ──
  if (config.scoreFluctuation && tickCount % 8 === 0) {
    const direction = state.creditUtilization < 30 ? 'up' : state.creditUtilization > 60 ? 'down' : 'stable';
    const newScore = perturbScore(state.behavioralScore, direction);
    const { grade } = scoreToGrade(newScore);
    updates.behavioralScore = newScore;
    updates.scoreGrade = grade;
  }

  // ── 3. APY Fluctuation ──
  if (config.apyFluctuation && tickCount % 12 === 0) {
    const currentStrategies = (updates.strategies as typeof state.strategies) || state.strategies;
    updates.strategies = currentStrategies.map(s => ({
      ...s,
      apy: s.status === 'active' ? perturbAPY(s.apy, 0.2) : s.apy,
    }));

    // Recalculate active yield APY
    const activeStrategies = (updates.strategies as typeof state.strategies).filter(s => s.status === 'active');
    if (activeStrategies.length > 0) {
      const totalActive = activeStrategies.reduce((sum, s) => sum + s.allocated, 0);
      const weightedAPY = activeStrategies.reduce((sum, s) => sum + s.apy * s.allocated, 0) / totalActive;
      updates.activeYieldAPY = Math.round(weightedAPY * 10) / 10;
    }
  }

  // ── 4. Recalculate Credit Metrics ──
  if (tickCount % 4 === 0) {
    const currentScore = (updates.behavioralScore as number) ?? state.behavioralScore;
    const currentOwnCapital = (updates.ownCapital as number) ?? state.ownCapital;
    const currentEquity = (updates.totalEquity as number) ?? state.totalEquity;
    const currentDebt = (updates.currentDebt as number) ?? state.currentDebt;

    const credit = calculateCredit({
      behavioralScore: currentScore,
      ownCapital: currentOwnCapital,
      totalEquity: currentEquity,
      currentDebt,
      reserveCurrent: state.reserveCurrent,
      reserveTarget: state.reserveTarget,
    });

    updates.creditLimit = credit.creditLimit;
    updates.availableCredit = credit.availableCredit;
    updates.creditUtilization = credit.utilization;
    updates.healthFactor = credit.healthFactor;
  }

  // ── 5. Risk Assessment ──
  if (tickCount % 6 === 0) {
    const currentStrategies = (updates.strategies as typeof state.strategies) || state.strategies;
    const totalAllocated = currentStrategies.reduce((sum, s) => sum + s.allocated, 0);
    const maxAllocation = Math.max(...currentStrategies.map(s => s.allocated));
    const largestPct = totalAllocated > 0 ? (maxAllocation / totalAllocated * 100) : 0;

    const risk = assessRisk({
      healthFactor: (updates.healthFactor as number) ?? state.healthFactor,
      creditUtilization: (updates.creditUtilization as number) ?? state.creditUtilization,
      reserveRatio: state.reserveCurrent / state.reserveTarget,
      largestSingleAllocation: largestPct,
      strategies: state.exposureBreakdown.map((e, i) => ({
        name: e.strategy,
        apy: currentStrategies[i]?.apy ?? 0,
        allocated: currentStrategies[i]?.allocated ?? 0,
        risk: e.risk,
      })),
    });

    updates.riskLevel = risk.level;
  }

  // ── 6. Log Generation ──
  if (config.logGeneration && tickCount % 3 === 0) {
    const template = LOG_TEMPLATES[tickCount % LOG_TEMPLATES.length];
    const currentStrategies = (updates.strategies as typeof state.strategies) || state.strategies;
    const activeStrat = currentStrategies.find(s => s.status === 'active') || currentStrategies[0];

    let action = template.action;
    action = action.replace('{strategy}', activeStrat?.name?.split('(')[0]?.trim() || 'Strategy');
    action = action.replace('{amount}', (Math.random() * 150 + 20).toFixed(2));
    action = action.replace('{util}', ((updates.creditUtilization as number) ?? state.creditUtilization).toFixed(0));

    const newEntry: AgentLogEntry = {
      time: simTimeString(tickCount),
      action,
      type: template.type,
    };

    const currentLog = state.agentLog;
    updates.agentLog = [newEntry, ...currentLog.slice(0, 19)]; // keep last 20
    updates.lastAction = '< 1 min ago';
    updates.lastActionLabel = action;
  }

  // ── 7. Alert Generation ──
  if (config.alertGeneration && tickCount % 10 === 0) {
    const newAlerts = checkForAlerts(
      (updates.healthFactor as number) ?? state.healthFactor,
      (updates.creditUtilization as number) ?? state.creditUtilization,
      state.reserveCurrent / state.reserveTarget,
      []
    );

    if (newAlerts.length > 0) {
      const alertEntries: Alert[] = newAlerts.map((a, i) => ({
        id: Date.now() + i,
        severity: a.severity,
        message: a.message,
        time: 'just now',
        read: false,
      }));

      const existingAlerts = state.alerts;
      updates.alerts = [...alertEntries, ...existingAlerts.slice(0, 9)]; // keep last 10
    }
  }

  // ── 8. Agentic Economy Simulation ──
  if (tickCount % 4 === 0 && config.logGeneration) {
    const agents = state.agentRegistry;
    const activeAgents = agents.filter(a => a.status === 'active');
    
    if (activeAgents.length > 0) {
      const luckyAgent = activeAgents[tickCount % activeAgents.length];
      const isSlash = tickCount % 48 === 0 && luckyAgent.score < 500; // Slash bad agents
      const isRepay = tickCount % 6 === 0;
      const isBorrow = tickCount % 8 === 0;

      let action = '';
      let type: AgentLogEntry['type'] = 'loan';

      if (isSlash) {
        action = `CRITICAL: Agent ${luckyAgent.name} slashed. Reputation reset to 0. Penalty: 50% interest.`;
        type = 'slash';
        updates.agentRegistry = agents.map(a => a.id === luckyAgent.id ? { ...a, status: 'slashed', score: 0, interestRate: 50, lastAction: 'SLASHED' } : a);
      } else if (isRepay) {
        const fee = 0.001;
        action = `Agent ${luckyAgent.name} repaid loan + $${fee} USDC fee`;
        type = 'payment';
        updates.protocolRevenue = (state.protocolRevenue || 0) + fee;
        updates.agentRegistry = agents.map(a => a.id === luckyAgent.id ? { ...a, score: Math.min(1000, a.score + 5), lastAction: 'Repaid Loan' } : a);
      } else if (isBorrow) {
        const amount = parseFloat((Math.random() * 50 + 10).toFixed(2));
        action = `Agent ${luckyAgent.name} borrowed ${amount} USDC (Reputation: ${luckyAgent.score})`;
        type = 'loan';
        updates.txVolume24h = (state.txVolume24h || 0) + amount;
        updates.agentRegistry = agents.map(a => a.id === luckyAgent.id ? { ...a, lastAction: `Borrowed ${amount} USDC` } : a);
      }

      // Calculate Real-time Velocity: (Revenue / TVL) * Factor
      if (state.protocolTVL > 0) {
        const dailyRevenue = (state.protocolRevenue || 0) * (86400 / config.simulatedSecondsPerTick); // Extrapolate to daily
        updates.capitalVelocity = Math.min(50, (dailyRevenue / (state.protocolTVL * 0.001)) * 0.1); 
      }

      if (action) {
        const newEntry: AgentLogEntry = {
          time: simTimeString(tickCount),
          action,
          type,
        };
        const currentLog = (updates.agentLog as AgentLogEntry[]) || state.agentLog;
        updates.agentLog = [newEntry, ...currentLog.slice(0, 19)];
      }
    }
  }

  // ── 9. Uptime ──
  const totalSimSeconds = tickCount * config.simulatedSecondsPerTick;
  const simDays = Math.floor(totalSimSeconds / 86400);
  const simHours = Math.floor((totalSimSeconds % 86400) / 3600);
  const simMinutes = Math.floor((totalSimSeconds % 3600) / 60);
  updates.autopilotUptime = `${simDays + 14}d ${simHours + 7}h ${simMinutes + 23}m`;

  return updates;
}
