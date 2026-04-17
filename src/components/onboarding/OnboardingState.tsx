import React, { useState } from 'react';
import { useStoreDispatch, mockPopulatedState, useStore } from '../../state/store';
import { useWallet } from '../../state/wallet';
import { Panel } from '../panel/Panel';
import { ethers } from 'ethers';

export function OnboardingState() {
  const dispatch = useStoreDispatch();
  const { state } = { state: useStore() }; // Access state
  const { wallet, connect } = useWallet();
  const [txState, setTxState] = useState<'idle' | 'preparing' | 'signing' | 'mining'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [depositAmountStr, setDepositAmountStr] = useState('50');

  const handleDeposit = async () => {
    if (!wallet.connected || !wallet.signer) {
      await connect();
      return;
    }

    try {
      setError(null);
      const usdcAddress = (await import('../../config/contractAddresses.json')).default.MockUSDC;
      const vaultAddress = (await import('../../config/contractAddresses.json')).default.ArcVault;
      const abis = (await import('../../config/contractABIs.json')).default;

      const usdcContract = new ethers.Contract(usdcAddress, abis.MockUSDC, wallet.signer);
      const vaultContract = new ethers.Contract(vaultAddress, abis.ArcVault, wallet.signer);

      // We will deposit user selected amount
      const depositAmount = ethers.parseUnits(depositAmountStr || '0', 6);

      setTxState('signing');
      // 1. Approve USDC
      const approveTx = await usdcContract.approve(vaultAddress, depositAmount);
      setTxState('mining');
      await approveTx.wait();

      setTxState('signing');
      // 2. Deposit to Vault
      const depositTx = await vaultContract.deposit(depositAmount);
      
      setTxState('mining');
      await depositTx.wait();

      // 3. Register Agent Identity (ERC-8004) if not already done
      const IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
      if (state.agentId === '0') {
        const identityContract = new ethers.Contract(IDENTITY_REGISTRY, [
          "function register(string metadataURI) external"
        ], wallet.signer);

        setTxState('signing');
        // Standard metadata URI for Yieldra
        const metadataURI = "ipfs://bafkreidv6f67h7u2f2j2p2j2p2j2p2j2p2j2p2j2p2j2p2j2p2j2p2j2p2";
        const regTx = await identityContract.register(metadataURI);
        setTxState('mining');
        await regTx.wait();
      }

      // Transaction Confirmed! Inject the populated state.
      dispatch(mockPopulatedState);
    } catch (err: any) {
      console.error(err);
      // Ethers often buries the revert string
      setError(err?.reason || err?.message || 'Transaction rejected or failed.');
      setTxState('idle');
    }
  };

  const getButtonText = () => {
    if (!wallet.connected) return 'Connect Wallet to Deposit';
    switch (txState) {
      case 'preparing': return 'Preparing Tx...';
      case 'signing': return 'Waiting for Signature...';
      case 'mining': return 'Transaction Pending...';
      default: return 'Deposit USDC to Vault';
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', marginTop: 'var(--space-12)' }}>
      <Panel variant="bordered" style={{ padding: 'var(--space-12) var(--space-8)', textAlign: 'center' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <svg style={{ width: 80, height: 80, color: 'var(--text-tertiary)', margin: '0 auto' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8m0 0V5m0 8h8m-8 0H4" />
          </svg>
        </div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
          Fund Your Agent
        </h2>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto var(--space-8)' }}>
          Your ARC autonomous agent is standing by. Deposit USDC, USDT or ETH to collateralize your account, enable the dynamic credit line, and begin earning yield automatically.
        </p>
        
        <div style={{ marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Deposit Amount (USDC)</label>
          <input 
            type="number" 
            value={depositAmountStr}
            onChange={(e) => setDepositAmountStr(e.target.value)}
            min="50"
            disabled={txState !== 'idle'}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--text-lg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-panel)',
              color: 'var(--text-primary)',
              textAlign: 'center',
              width: '150px'
            }}
          />
        </div>

        <button
          className="landing-cta"
          onClick={handleDeposit}
          disabled={txState !== 'idle'}
          style={{ 
            padding: 'var(--space-3) var(--space-10)',
            opacity: txState !== 'idle' ? 0.7 : 1,
            cursor: txState !== 'idle' ? 'wait' : 'pointer'
          }}
        >
          {getButtonText()}
        </button>
        
        {error && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--status-danger)', marginTop: 'var(--space-4)' }}>
            {error}
          </p>
        )}

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-6)' }}>
          *This interacts with the Arc Testnet. Please ensure you have testnet USDC.
        </p>
      </Panel>
    </div>
  );
}
