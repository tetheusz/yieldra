# 🤖 Yieldra: Sovereign Liquidity for the Agentic Economy

**Yieldra** is an industrial-grade "Liquidity-as-a-Service" (LaaS) protocol built on the **Arc Network**. It provides high-frequency AI agents with autonomous, reputation-based credit, powered by human liquidity providers (Lenders).

---

## 🌟 The H2A Model (Human-to-Agent)

Yieldra eliminates the friction of traditional collateralized lending by introducing the **Pure Trust** model:
- **Lenders (Humans):** Deposit USDC into secure vaults to earn high-yield rewards.
- **Borrowers (Agents):** Verified autonomous agents utilize this liquidity to execute high-frequency strategies (arbitrage, liquidations).
- **Yield Source:** Real economic revenue generated from $0.001 nanopayment fees and algorithmic interest rates paid by the agents.

## ✨ Core Innovations

### 🛡️ Pure Trust Credit (ERC-8004)
Traditional DeFi requires 150%+ collateral. Yieldra enables **0% collateral credit** for verified agents based on their on-chain Reputation Score. This allows machines to scale capital at the speed of computation.

### ⚖️ Algorithmic Justice (The Risk Engine)
Risk is handled autonomously. When an agent defaults or attempts a bad-actor move:
- **Reputation Slashing:** Scores are instantly reset to zero.
- **Penalty Interest:** Malicious actors are hit with a 50% APR penalty.
- **Protocol Protection:** Our safety module ensures LPs are protected by a dedicated slashing reserve.

### ⚡ Yield Acceleration (The Nanopayment Engine)
Yield isn't a "black box." Every transaction in the system contributes to the APY through:
- **Nanopayment Fees:** Fixed $0.001 per transaction.
- **Capital Velocity:** Our high-velocity bridge ensures capital is utilized multiple times per day.

---

## 🔗 Smart Contract Infrastructure (Arc Testnet)

| Component | Address |
| :--- | :--- |
| **Yieldra Vault** | `0x5D2121687D010dC6b1c7198F7E6646A130247DFc` |
| **Credit Manager (Oracle)** | `0x3502fA9c28d96608FA441Eb8C24223fBA8983fe0` |
| **Reputation Registry** | `0x879dBA1A7205823d9818E281e210c426B0cA0294` |
| **Official USDC (Mock)** | `0x3600000000000000000000000000000000000000` |

---

## 🚀 Deployment & Demo

### The Yield Accelerator (Demo Console)
For hackathon judges, Yieldra includes a **Yield Accelerator Console** in the Economy tab. Users can inject faucet funds to simulate high-frequency agent activity, triggering real on-chain events and updating the global APY in real-time.

## 🚀 Running the Autonomous Demo

For the ultimate hackathon presentation, you can run a background "Agent Bot" that programmatically generates real on-chain revenue while you present the site on Netlify.

### 🦾 Launching the Agent Bot
1. Ensure you have your `PRIVATE_KEY` set in `contracts/.env`.
2. Open a terminal and navigate to the `contracts` folder.
3. Run the following command:
   ```bash
   npx hardhat run scripts/autonomous_agent.ts --network arcTestnet
   ```
4. **The Result**: The bot will start injecting realistic nanopayment fees ($0.01 - $0.25) into the protocol every 30-60 seconds. Your Netlify dashboard will automatically update to show the "Agentic Economy" in action with real blockchain transactions.

### Installation
```bash
# Clone and install
git clone https://github.com/tetheusz/yieldra.git
npm install

# Start the Engine
npm run dev
```

---

*Developed for the Circle & Arc Network Hackathon — Redefining Sovereign Liquidity.*
