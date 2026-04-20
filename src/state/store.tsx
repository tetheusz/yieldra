/* ============================================
   STATE STORE — React Context
   Autonomous Credit & Yield Engine
   ============================================ */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { simulateTick, DEFAULT_SIM_CONFIG } from '../engines/autopilot';
import { useWallet } from './wallet';
import { ethers } from 'ethers';
import addresses from '../config/contractAddresses.json';
import abis from '../config/contractABIs.json';


// ── Types ──
export interface Strategy {
  name: string;
  apy: number;
  allocated: number;
  earned: number;
  status: 'active' | 'paused';
}

export interface RepaymentRecord {
  date: string;
  amount: number;
  status: 'paid' | 'pending';
}

export interface AgentLogEntry {
  time: string;
  action: string;
  type: 'rebalance' | 'payment' | 'harvest' | 'check' | 'snapshot' | 'allocation' | 'slash' | 'loan';
}

export interface AgentReputation {
  id: string;
  name: string;
  score: number;
  status: 'active' | 'slashed' | 'blacklisted';
  interestRate: number;
  lastAction: string;
}

export interface Alert {
  id: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
  read: boolean;
}

export interface ExposureItem {
  strategy: string;
  risk: number;
  weight: number;
}

export interface ConcentrationRisk {
  label: string;
  percentage: number;
  level: 'low' | 'medium' | 'high';
}

export interface EquityPoint {
  day: number;
  value: number;
}

export interface AppState {
  hasDeposited: boolean;
  // Overview
  netWorth: number;
  netWorthChange: number;
  availableCredit: number;
  activeYieldAPY: number;
  autopilotActive: boolean;
  agentId: string;

  // Credit
  behavioralScore: number;
  scoreGrade: string;
  creditLimit: number;
  creditUsed: number;
  currentDebt: number;
  debtInterest: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  creditUtilization: number;
  repaymentHistory: RepaymentRecord[];

  // Treasury
  ownCapital: number;
  borrowedCapital: number;
  totalEquity: number;
  totalAllocated: number;
  idleCapital: number;
  reserveTarget: number;
  reserveCurrent: number;
  accumulatedYield: number;
  yieldThisMonth: number;
  strategies: Strategy[];
  equityHistory: EquityPoint[];

  // Autopilot
  autopilotStatus: 'active' | 'paused';
  autopilotUptime: string;
  lastAction: string;
  lastActionLabel: string;
  profitDistribution: {
    amortization: number;
    reinvestment: number;
    reserve: number;
  };
  agentLog: AgentLogEntry[];
  autopilotConfig: {
    maxSingleAllocation: number;
    rebalanceThreshold: number;
    autoRepayment: boolean;
    minReserve: number;
    riskTolerance: string;
  };
  performanceSinceActivation: {
    totalGains: number;
    totalActions: number;
    daysActive: number;
    avgDailyYield: number;
  };

  // Risk
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  healthFactor: number;
  alerts: Alert[];
  exposureBreakdown: ExposureItem[];
  concentrationRisks: ConcentrationRisk[];

  // Global Protocol Analytics
  protocolTVL: number;
  protocolTotalBorrowed: number;
  protocolUtilization: number;
  protocolRevenue: number;
  capitalVelocity: number;
  txVolume24h: number;
  avgNanopaymentFee: number;
  creditManagerLiquidity: number;
  agentRegistry: AgentReputation[];
}

// ── Format utilities ──
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return formatUSD(value);
}

// ── Initial Empty State (New User) ──
const initialEmptyState: AppState = {
  hasDeposited: false,
  // Overview
  netWorth: 0,
  netWorthChange: 0,
  availableCredit: 0,
  activeYieldAPY: 0,
  autopilotActive: false,
  agentId: '0',

  // Credit
  behavioralScore: 0,
  scoreGrade: 'N/A',
  creditLimit: 0,
  creditUsed: 0,
  currentDebt: 0,
  debtInterest: 0,
  nextPaymentDate: '-',
  nextPaymentAmount: 0,
  creditUtilization: 0,
  repaymentHistory: [],

  // Treasury
  ownCapital: 0,
  borrowedCapital: 0,
  totalEquity: 0,
  totalAllocated: 0,
  idleCapital: 0,
  reserveTarget: 0,
  reserveCurrent: 0,
  accumulatedYield: 0,
  yieldThisMonth: 0,
  strategies: [],
  equityHistory: [],

  // Autopilot
  autopilotStatus: 'paused',
  autopilotUptime: '0d 0h 0m',
  lastAction: '-',
  lastActionLabel: 'Awaiting deposit',
  profitDistribution: {
    amortization: 40,
    reinvestment: 35,
    reserve: 25,
  },
  agentLog: [],
  autopilotConfig: {
    maxSingleAllocation: 30,
    rebalanceThreshold: 5,
    autoRepayment: true,
    minReserve: 15,
    riskTolerance: 'conservative',
  },
  performanceSinceActivation: {
    totalGains: 0,
    totalActions: 0,
    daysActive: 0,
    avgDailyYield: 0,
  },

  // Risk
  riskLevel: 'low',
  healthFactor: 0,
  alerts: [],
  exposureBreakdown: [],
  concentrationRisks: [],
  protocolTVL: 0,
  protocolTotalBorrowed: 0,
  protocolUtilization: 0,
  protocolRevenue: 0,
  capitalVelocity: 0,
  txVolume24h: 0,
  avgNanopaymentFee: 0.001,
  creditManagerLiquidity: 0,
  agentRegistry: [
    { id: '1', name: 'OpenAI_Settler', score: 980, status: 'active', interestRate: 8.5, lastAction: 'Idle' },
    { id: '2', name: 'Matrix_MM', score: 920, status: 'active', interestRate: 9.0, lastAction: 'Idle' },
    { id: '3', name: 'Bittensor_Node', score: 850, status: 'active', interestRate: 9.5, lastAction: 'Idle' },
    { id: '4', name: 'Anthropic_Agent', score: 400, status: 'active', interestRate: 12.0, lastAction: 'Idle' },
  ],
};

// ── Populated State (Triggered after physical deposit completion) ──
export const mockPopulatedState: Partial<AppState> = {
  hasDeposited: true,
  autopilotActive: true,
  agentId: '0',
  autopilotStatus: 'active',
  lastAction: 'Vault initialized',
  lastActionLabel: 'Agent standing by for yield allocation',
  reserveCurrent: 0,
  yieldThisMonth: 0,
  strategies: [],
  equityHistory: [],
  agentLog: [],
  performanceSinceActivation: {
    totalGains: 0,
    totalActions: 0,
    daysActive: 0,
    avgDailyYield: 0,
  },
  riskLevel: 'low',
  healthFactor: 0,
  alerts: [],
  exposureBreakdown: [],
  concentrationRisks: [],
  protocolTVL: 0,
  protocolTotalBorrowed: 0,
  protocolUtilization: 0,
  protocolRevenue: 0,
  creditManagerLiquidity: 0,
  agentRegistry: [],
};

// ── Context ──
interface StoreContextValue {
  state: AppState;
  setState: (partial: Partial<AppState>) => void;
}

const StoreContext = createContext<StoreContextValue>({
  state: initialEmptyState,
  setState: () => {},
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(initialEmptyState);
  const tickRef = useRef(0);
  const { wallet } = useWallet();

  const setState = useCallback((partial: Partial<AppState>) => {
    setStateRaw(prev => ({ ...prev, ...partial }));
  }, []);

  // ── Smart Contract Polling Loop ──
  useEffect(() => {
    if (!wallet.provider || !wallet.address) return;

    const fetchData = async () => {
      try {
        const vaultContract = new ethers.Contract(addresses.ArcVault, abis.ArcVault, wallet.provider);
        const creditContract = new ethers.Contract(addresses.ArcCreditManager, abis.ArcCreditManager, wallet.provider);
        const scoreContract = new ethers.Contract(addresses.ArcScoreRegistry, abis.ArcScoreRegistry, wallet.provider);
        const IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
        const identityContract = new ethers.Contract(IDENTITY_REGISTRY, [
          "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
        ], wallet.provider);

        // Individual resilient fetches
        let depositWei = BigInt(0), principalWei = BigInt(0), debtWei = BigInt(0), limitWei = BigInt(0), scoreWei = BigInt(0), apyBps = BigInt(500), totalRevenueWei = BigInt(0), globalTVLWei = BigInt(0), globalBorrowedWei = BigInt(0), cmLiquidityWei = BigInt(0);

        try { depositWei = await vaultContract.getDeposit(wallet.address); } catch(e) {}
        try { 
          const pos = await vaultContract.positions(wallet.address); 
          principalWei = pos.principal;
        } catch(e) {}
        try { debtWei = await creditContract.getDebt(wallet.address); } catch(e) {}
        try { limitWei = await creditContract.getAvailableCreditLimit(wallet.address); } catch(e) {}
        try { scoreWei = await scoreContract.getScore(wallet.address); } catch(e) {}
        try { apyBps = await vaultContract.getCurrentApy(); } catch(e) {}
        try { totalRevenueWei = await creditContract.totalProtocolRevenue(); } catch(e) {}
        try { globalTVLWei = await vaultContract.totalPrincipal(); } catch(e) {}
        try { globalBorrowedWei = await creditContract.totalBorrowed(); } catch(e) {}
        try { 
          const usdcAddress = addresses.MockUSDC;
          const usdcContract = new ethers.Contract(usdcAddress, abis.MockUSDC, wallet.provider);
          cmLiquidityWei = await usdcContract.balanceOf(addresses.ArcCreditManager); 
        } catch(e) {}

        const apyNum = Number(apyBps) / 100;

        const depositNum = parseFloat(ethers.formatUnits(depositWei, 6));
        const principalNum = parseFloat(ethers.formatUnits(principalWei, 6));
        const debtNum = parseFloat(ethers.formatUnits(debtWei, 6));
        const limitNum = parseFloat(ethers.formatUnits(limitWei, 6));
        const scoreNum = Number(scoreWei);

        const globalTVLNum = parseFloat(ethers.formatUnits(globalTVLWei, 6));
        const globalBorrowedNum = parseFloat(ethers.formatUnits(globalBorrowedWei, 6));
        const cmLiquidityNum = parseFloat(ethers.formatUnits(cmLiquidityWei, 6));
        const totalRevenueNum = parseFloat(ethers.formatUnits(totalRevenueWei, 6));
        
        // GLOBAL TVL re-definition for Hackathon: Total Assets Under Management
        // (Vault Collateral + CreditManager Liquidity + Assets currently out on loan)
        const aggregatedTVL = globalTVLNum + cmLiquidityNum + globalBorrowedNum;
        
        // Capital Efficiency = (Assets Working / Total Assets)
        const capitalEfficiencyNum = aggregatedTVL > 0 ? (globalBorrowedNum / aggregatedTVL) : 0;
        
        // Utilization = (Borrowed / Available Pool)
        const poolCapacity = cmLiquidityNum + globalBorrowedNum;
        const utilizationRate = poolCapacity > 0 ? (globalBorrowedNum / poolCapacity) * 100 : 0;

        // Fetch Global Action Logs (Limit range to avoid RPC timeouts on new chains)
        const blockRange = -2000; 
        const borrowFilter = creditContract.filters.Borrowed();
        const repayFilter = creditContract.filters.Repaid();
        const depositFilter = vaultContract.filters.Deposited();
        const revenueFilter = creditContract.filters.RevenueInjected();

        const [bLogs, rLogs, dLogs, revLogs, currentBlock] = await Promise.all([
          creditContract.queryFilter(borrowFilter, blockRange).catch(() => []),
          creditContract.queryFilter(repayFilter, blockRange).catch(() => []),
          vaultContract.queryFilter(depositFilter, blockRange).catch(() => []),
          creditContract.queryFilter(revenueFilter, blockRange).catch(() => []),
          wallet.provider.getBlockNumber().catch(() => 0),
        ]);

        const getLogTime = (logBlock: number) => {
          if (!currentBlock || logBlock >= currentBlock) return new Date().toLocaleTimeString();
          const secondsAgo = (currentBlock - logBlock) * 2; // ~2s per block on Arc
          return new Date(Date.now() - secondsAgo * 1000).toLocaleTimeString();
        };

        const allLogs: (AgentLogEntry & { blockNumber: number })[] = [
          ...bLogs.map(l => ({ blockNumber: l.blockNumber, time: getLogTime(l.blockNumber), action: `AGENT_LOAN: Disbursed ${ethers.formatUnits((l as any).args.amount, 6)} USDC to ${(l as any).args.user.slice(0, 6)}`, type: 'allocation' as const })),
          ...rLogs.map(l => ({ blockNumber: l.blockNumber, time: getLogTime(l.blockNumber), action: `CAPITAL_RECOVERY: Agent repaid ${ethers.formatUnits((l as any).args.amount, 6)} USDC`, type: 'payment' as const })),
          ...dLogs.map(l => ({ blockNumber: l.blockNumber, time: getLogTime(l.blockNumber), action: `TVL_UPDATE: Liquidity Injection ${ethers.formatUnits((l as any).args.amount, 6)} USDC`, type: 'harvest' as const })),
          ...revLogs.map(l => ({ blockNumber: l.blockNumber, time: getLogTime(l.blockNumber), action: `REVENUE_INGESTION: Protocol earned ${ethers.formatUnits((l as any).args.amount, 6)} USDC`, type: 'payment' as const })),
        ].sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 15);

        // Fetch Agent ID (ERC-8004) from Identity Registry
        let detectedAgentId = state.agentId;
        if (state.agentId === '0') {
          try {
            const filter = identityContract.filters.Transfer(null, wallet.address);
            const logs = await identityContract.queryFilter(filter, -2000); 
            if (logs && logs.length > 0) {
              const lastLog = logs[logs.length - 1] as any;
              if (lastLog.args && lastLog.args.tokenId) {
                detectedAgentId = lastLog.args.tokenId.toString();
              }
            }
          } catch (e) {
            console.warn("Failed to fetch agent ID", e);
          }
        }


          setStateRaw(prev => ({
            ...prev,
            hasDeposited: depositNum > 0 ? true : prev.hasDeposited,
            netWorth: depositNum,
            accumulatedYield: depositNum > principalNum ? depositNum - principalNum : 0,
            currentDebt: debtNum,
            creditLimit: limitNum,
            behavioralScore: scoreNum,
            availableCredit: limitNum - debtNum > 0 ? limitNum - debtNum : 0,
            scoreGrade: scoreNum > 800 ? 'A+' : scoreNum > 600 ? 'B' : 'C',
            agentId: detectedAgentId,
            activeYieldAPY: apyNum,
            activeYieldAPY: apyNum,
            protocolTVL: aggregatedTVL,
            protocolTotalBorrowed: globalBorrowedNum,
            protocolUtilization: utilizationRate,
            protocolRevenue: totalRevenueNum,
            capitalVelocity: capitalEfficiencyNum,
            creditManagerLiquidity: cmLiquidityNum,
            agentLog: allLogs.length > 0 ? allLogs : prev.agentLog
          }));
        } catch (err) {
          console.error("CRITICAL: Failed fetching on-chain data in store context", err);
        }
    };

    fetchData(); // run immediately
    const pollInterval = setInterval(() => {
      tickRef.current += 1;
      fetchData();
      
      // We still update visual sim for "Uptime" and "Last Action" labels 
      // but without warping the actual financial data
      const simUpdates = simulateTick(state, { ...DEFAULT_SIM_CONFIG, yieldAccrual: false, scoreFluctuation: false, logGeneration: false }, tickRef.current);
      setState(simUpdates);
    }, 5000); // 5s for high-frequency demo feedback

    return () => clearInterval(pollInterval);
  }, [state.hasDeposited, wallet.provider, wallet.address]);

  return (
    <StoreContext.Provider value={{ state, setState }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): AppState {
  return useContext(StoreContext).state;
}

export function useStoreDispatch() {
  return useContext(StoreContext).setState;
}
