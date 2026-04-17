/* ============================================
   RISK ENGINE
   Exposure analysis + alert generation
   
   Pure logic — no React dependency.
   ============================================ */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskInputs {
  healthFactor: number;
  creditUtilization: number;    // 0-100
  reserveRatio: number;         // current/target, 0-1+
  largestSingleAllocation: number; // % of total
  strategies: { name: string; apy: number; allocated: number; risk: number }[];
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;               // 0-100, higher = riskier
  healthFactor: number;
  leverageFactor: number;
}

/** 
 * Calculate Net APY considering Borrowing Costs 
 * Formula: ((Principal + Borrowed) * YieldRate - Borrowed * BorrowRate) / Principal
 */
export function calculateNetYield(principal: number, borrowed: number, yieldRate: number, borrowRate: number): number {
  if (principal <= 0) return 0;
  const totalAssets = principal + borrowed;
  const grossYield = totalAssets * (yieldRate / 100);
  const interestCost = borrowed * (borrowRate / 100);
  const netProfit = grossYield - interestCost;
  return (netProfit / principal) * 100;
}

/** Calculate overall risk level */
export function assessRisk(inputs: RiskInputs): RiskAssessment {
  let riskScore = 0;

  // Health factor contribution (0-30 points)
  if (inputs.healthFactor < 1.0) riskScore += 30;
  else if (inputs.healthFactor < 1.5) riskScore += 22;
  else if (inputs.healthFactor < 2.0) riskScore += 15;
  else if (inputs.healthFactor < 3.0) riskScore += 8;
  else riskScore += 2;

  // Credit utilization (0-25 points)
  if (inputs.creditUtilization > 80) riskScore += 25;
  else if (inputs.creditUtilization > 60) riskScore += 18;
  else if (inputs.creditUtilization > 40) riskScore += 10;
  else riskScore += 3;

  // Reserve health (0-20 points)
  if (inputs.reserveRatio < 0.5) riskScore += 20;
  else if (inputs.reserveRatio < 0.7) riskScore += 14;
  else if (inputs.reserveRatio < 0.9) riskScore += 8;
  else riskScore += 2;

  // Concentration risk (0-15 points)
  if (inputs.largestSingleAllocation > 50) riskScore += 15;
  else if (inputs.largestSingleAllocation > 35) riskScore += 10;
  else if (inputs.largestSingleAllocation > 25) riskScore += 5;
  else riskScore += 1;

  // Strategy risk (0-10 points)
  const avgStrategyRisk = inputs.strategies.length > 0
    ? inputs.strategies.reduce((sum, s) => sum + s.risk, 0) / inputs.strategies.length
    : 0;
  riskScore += Math.min(10, Math.round(avgStrategyRisk / 10));

  // Determine level
  let level: RiskLevel;
  if (riskScore >= 70) level = 'critical';
  else if (riskScore >= 45) level = 'high';
  else if (riskScore >= 25) level = 'medium';
  else level = 'low';

  return {
    level,
    score: riskScore,
    healthFactor: inputs.healthFactor,
    leverageFactor: (inputs.creditUtilization / 80) + 1.0, // Simplistic mapping for risk display
  };
}

/** Generate an alert if conditions warrant it */
export interface GeneratedAlert {
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

export function checkForAlerts(
  healthFactor: number,
  creditUtilization: number,
  reserveRatio: number,
  apyChanges: { strategy: string; oldAPY: number; newAPY: number }[]
): GeneratedAlert[] {
  const alerts: GeneratedAlert[] = [];

  if (healthFactor < 1.0) {
    alerts.push({ severity: 'critical', message: `Health factor critically low at ${healthFactor.toFixed(1)}x — liquidation risk` });
  } else if (healthFactor < 1.5) {
    alerts.push({ severity: 'warning', message: `Health factor at ${healthFactor.toFixed(1)}x — approaching minimum threshold` });
  }

  if (creditUtilization > 80) {
    alerts.push({ severity: 'warning', message: `Credit utilization at ${creditUtilization.toFixed(0)}% — above safe threshold` });
  }

  if (reserveRatio < 0.7) {
    alerts.push({ severity: 'warning', message: `Reserve at ${(reserveRatio * 100).toFixed(0)}% of target — below safe level` });
  }

  for (const change of apyChanges) {
    const delta = change.newAPY - change.oldAPY;
    if (Math.abs(delta) >= 0.5) {
      const direction = delta > 0 ? 'increased' : 'decreased';
      alerts.push({
        severity: Math.abs(delta) >= 1.5 ? 'warning' : 'info',
        message: `${change.strategy} APY ${direction} by ${Math.abs(delta).toFixed(1)}% — now ${change.newAPY.toFixed(1)}%`,
      });
    }
  }

  return alerts;
}
