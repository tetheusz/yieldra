/* ============================================
   CREDIT ENGINE
   Dynamic credit limit calculation
   
   Pure logic — no React dependency.
   ============================================ */

export interface CreditInputs {
  behavioralScore: number;        // 300-850
  ownCapital: number;             // user's own capital
  totalEquity: number;            // own + borrowed
  currentDebt: number;            // outstanding debt
  reserveCurrent: number;         // current reserve
  reserveTarget: number;          // reserve target
}

export interface CreditOutput {
  creditLimit: number;
  availableCredit: number;
  creditUsed: number;
  utilization: number;            // 0-100
  interestRate: number;           // annual, as decimal (e.g. 0.045)
  healthFactor: number;
}

/** Base credit limit as a function of score + equity */
function baseCreditLimit(score: number, ownCapital: number): number {
  // Score tiers determine the leverage multiplier
  let multiplier: number;
  if (score >= 800) multiplier = 0.65;       // up to 65% of own capital
  else if (score >= 750) multiplier = 0.55;
  else if (score >= 700) multiplier = 0.45;
  else if (score >= 650) multiplier = 0.35;
  else if (score >= 600) multiplier = 0.25;
  else if (score >= 550) multiplier = 0.15;
  else multiplier = 0.05;

  return Math.round(ownCapital * multiplier / 1000) * 1000; // round to nearest $1K
}

/** Interest rate based on score (lower score = higher rate) */
function interestFromScore(score: number): number {
  if (score >= 800) return 0.032;
  if (score >= 750) return 0.038;
  if (score >= 700) return 0.045;
  if (score >= 650) return 0.055;
  if (score >= 600) return 0.068;
  if (score >= 550) return 0.085;
  return 0.120;
}

/** Calculate credit metrics */
export function calculateCredit(inputs: CreditInputs): CreditOutput {
  const creditLimit = baseCreditLimit(inputs.behavioralScore, inputs.ownCapital);
  const creditUsed = inputs.currentDebt;
  const availableCredit = Math.max(0, creditLimit - creditUsed);
  const utilization = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;
  const interestRate = interestFromScore(inputs.behavioralScore);
  
  // Health factor: (own capital + reserve) / debt
  // Higher = safer. Below 1.5 = warning. Below 1.0 = liquidation risk.
  const collateral = inputs.ownCapital + inputs.reserveCurrent;
  const healthFactor = inputs.currentDebt > 0
    ? collateral / inputs.currentDebt
    : 10; // no debt = max safe

  return {
    creditLimit,
    availableCredit,
    creditUsed,
    utilization: Math.round(utilization * 10) / 10,
    interestRate,
    healthFactor: Math.round(healthFactor * 100) / 100,
  };
}

/** Calculate monthly interest accrual */
export function monthlyInterest(debt: number, annualRate: number): number {
  return Math.round(debt * (annualRate / 12) * 100) / 100;
}

/** Simulate auto-repayment from yield */
export function autoRepayment(
  availableYield: number,
  currentDebt: number,
  amortizationPct: number // 0-1, portion of yield for repayment
): { repaymentAmount: number; remainingDebt: number; remainingYield: number } {
  const repaymentBudget = availableYield * amortizationPct;
  const repaymentAmount = Math.min(repaymentBudget, currentDebt);
  return {
    repaymentAmount: Math.round(repaymentAmount * 100) / 100,
    remainingDebt: Math.round((currentDebt - repaymentAmount) * 100) / 100,
    remainingYield: Math.round((availableYield - repaymentAmount) * 100) / 100,
  };
}
