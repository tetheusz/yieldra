/* ============================================
   ENGINES — Barrel Export
   ============================================ */

export { calculateScore, scoreToGrade, perturbScore } from './scoring';
export type { ScoringFactors } from './scoring';

export { calculateCredit, monthlyInterest, autoRepayment } from './credit';
export type { CreditInputs, CreditOutput } from './credit';

export { accrueYield, tickYield, perturbAPY, addEquityPoint, reserveDeficit } from './treasury';
export type { StrategyState, TreasurySnapshot } from './treasury';

export { assessRisk, checkForAlerts } from './risk';
export type { RiskLevel, RiskInputs, RiskAssessment } from './risk';

export { simulateTick, DEFAULT_SIM_CONFIG } from './autopilot';
export type { SimConfig } from './autopilot';
