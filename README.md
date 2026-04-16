# 🚀 Yieldra: Autonomous Stablecoin Credit & Yield Engine

**Yieldra** is a next-generation decentralized finance protocol built on the **Arc Network**. It combines real-time on-chain credit scoring with autonomous yield-generation strategies, providing users with a seamless, institutional-grade banking experience in the Web3 era.

## 🌟 Vision

In a world where capital is often fragmented and credit is underutilized, Yieldra acts as the "Autonomous Central Bank" for users. By analyzing behavioral data on-chain, Yieldra grants uncollateralized or under-collateralized credit lines while simultaneously optimizing idle capital through algorithmic vault strategies.

## ✨ Key Features

- **🛡️ Proof of Score:** A proprietary on-chain credit registry that assigns a dynamic financial reputation score (ScoreRegistry) based on user interaction and history.
- **🏦 Algorithmic Vaults:** Automated yield-bearing vaults that leverage Arc Network's sub-second finality to compound returns every few seconds.
- **💳 Dynamic Credit Lines:** Unlock liquidity without selling your assets. Your credit limit scales automatically as your Score improves.
- **⚡ Truth-First Architecture:** Zero mock data. The entire UI is driven by real-time smart contract polling, ensuring 100% transparency.
- **💎 Premium UX:** A sleek, glassmorphic dark-mode interface built for elite DeFi users, featuring live-polling balances and transaction state tracking.

## 🛠️ Tech Stack

- **Blockchain:** Arc Network (Testnet)
- **Smart Contracts:** Solidity 0.8.20 (Hardhat)
- **Frontend:** React + TypeScript + Vite
- **Web3 Integration:** Ethers.js v6
- **Styling:** Vanilla CSS (Custom Design System)

## 🔗 Smart Contract Addresses (Arc Testnet)

| Contract | Address |
| :--- | :--- |
| **Official ARC USDC** | `0x3600000000000000000000000000000000000000` |
| **Yieldra Score Registry** | `0x879dBA1A7205823d9818E281e210c426B0cA0294` |
| **Yieldra Vault** | `0x5D2121687D010dC6b1c7198F7E6646A130247DFc` |
| **Yieldra Credit Manager** | `0x3502fA9c28d96608FA441Eb8C24223fBA8983fe0` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MetaMask or any EIP-1193 compatible wallet
- $ARC tokens (for gas) from the [Arc Faucet](https://faucet.testnet.arc.network)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/yieldra.git
   cd yieldra
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install contract dependencies:**
   ```bash
   cd contracts
   npm install
   ```

4. **Launch Local Development:**
   ```bash
   npm run dev
   ```

---

## 📜 Deployment Logic

The Yieldra ecosystem is designed for the **Arc Network**. To deploy your own instance:

1. Create a `.env` file in the `contracts` directory:
   ```env
   PRIVATE_KEY=your_private_key
   ARC_RPC_URL=https://rpc.testnet.arc.network
   ```

2. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.ts --network arcTestnet
   ```

---

## 🎨 Design Philosophy

Yieldra follows a **Rich Aesthetics** principle:
- **Depth:** Layered panels with subtle shadows and borders.
- **Motion:** Micro-animations for transaction states (Signing, Mining, Success).
- **Clarity:** Real-time data synchronization every 12 seconds via Ethers v6 polling.

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Developed for the Arc Network Hackathon.*
