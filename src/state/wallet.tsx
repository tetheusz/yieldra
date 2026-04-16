/* ============================================
   WALLET CONTEXT
   Real Web3 Connection using ethers v6
   ============================================ */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers';

export interface WalletState {
  connected: boolean;
  address: string | null;
  shortAddress: string | null;
  networkName: string;
  chainId: bigint | null;
  balance: number; // Native token balance (ETH/etc)
  connecting: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  error: string | null;
}

interface WalletContextValue {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const initialWallet: WalletState = {
  connected: false,
  address: null,
  shortAddress: null,
  networkName: 'Unsupported',
  chainId: null,
  balance: 0,
  connecting: false,
  provider: null,
  signer: null,
  error: null
};

const WalletContext = createContext<WalletContextValue>({
  wallet: initialWallet,
  connect: async () => {},
  disconnect: () => {},
});

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(initialWallet);

  // Sync state with connected provider
  const syncProviderState = useCallback(async (provider: BrowserProvider) => {
    try {
      const accounts = await provider.send("eth_accounts", []);
      if (accounts.length === 0) {
        setWallet(initialWallet);
        return;
      }

      const address = accounts[0];
      const signer = await provider.getSigner(address);
      const network = await provider.getNetwork();
      
      // Get native balance
      const balanceWei = await provider.getBalance(address);
      const balanceEth = parseFloat(ethers.formatEther(balanceWei));

      setWallet(prev => ({
        ...prev,
        connected: true,
        address,
        shortAddress: shortenAddress(address),
        networkName: network.name !== 'unknown' ? network.name : `Chain ${network.chainId}`,
        chainId: network.chainId,
        balance: balanceEth,
        provider,
        signer,
        error: null,
        connecting: false
      }));
    } catch (err: any) {
      console.error("Failed to sync wallet state", err);
      setWallet(prev => ({ ...prev, error: err.message, connecting: false }));
    }
  }, []);

  const connect = useCallback(async () => {
    setWallet(prev => ({ ...prev, connecting: true, error: null }));

    if (!window.ethereum) {
      setWallet(prev => ({ ...prev, connecting: false, error: 'No wallet plugin found (e.g., MetaMask).' }));
      alert('Please install MetaMask or another Web3 extension.');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      await provider.send("eth_requestAccounts", []);
      await syncProviderState(provider);
    } catch (err: any) {
      console.error("Connection failed", err);
      setWallet(prev => ({ ...prev, connecting: false, error: err.message }));
    }
  }, [syncProviderState]);

  const disconnect = useCallback(() => {
    // Cannot programmatically force-disconnect EIP-1193, 
    // but we can clear local state so the app looks disconnected.
    setWallet(initialWallet);
  }, []);

  // Set up event listeners for account / chain swaps
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect(); // User locked wallet or removed site
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        syncProviderState(provider);
      }
    };

    const handleChainChanged = () => {
      // Best practice is to refresh on chain change
      window.location.reload();
    };

    // Auto-connect if already authorized
    const initIfAuthorized = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const accounts = await provider.send("eth_accounts", []);
      if (accounts && accounts.length > 0) {
        syncProviderState(provider);
      }
    };

    initIfAuthorized();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [syncProviderState, disconnect]);

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}

// Add typing for window.ethereum
declare global {
  interface Window {
    ethereum?: import('ethers').Eip1193Provider & {
      on: (event: string, cb: any) => void;
      removeListener: (event: string, cb: any) => void;
    };
  }
}
