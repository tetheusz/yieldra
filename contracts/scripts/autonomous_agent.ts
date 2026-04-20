const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * 🦾 YIELDRA: NANOPAYMENT & MULTI-STATE AGENT v2.2
 * Optimized for the "Agentic Economy on Arc" Hackathon.
 * - Handles sub-cent nanopayments (<= $0.01) [MANDATORY RULE]
 * - Handles legacy/high-value settlements (up to $0.30)
 * - Accelerated frequency to hit 50+ on-chain transactions fast.
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("🦾 YIELDRA: NANOPAYMENT AGENT v2.2 ACTIVE");
  console.log("Target: ARC Testnet (Official USDC)");
  console.log("==================================================");

  const addressesPath = path.join(__dirname, "../../src/config/contractAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  const usdc = await ethers.getContractAt("IERC20", addresses.MockUSDC);
  const creditManager = await ethers.getContractAt("ArcCreditManager", addresses.ArcCreditManager);

  // Stats to track our goals
  let txCount = 0;

  const agents = ["matrix-core", "neural-flow-01", "lambda-settler", "arb-sentinel", "vision-node"];

  while (true) {
    try {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const actionRoll = Math.random();
      
      // Get current bot state
      const currentDebt = await creditManager.getDebt(deployer.address);
      const debtNum = parseFloat(ethers.formatUnits(currentDebt, 6));

      if (actionRoll < 0.6) {
        // ACTION A: SETTLEMENT REVENUE
        // We want a mix: 80% Nanopayments (to win hackathon), 20% Legacy High Fees
        const isNanopayment = Math.random() < 0.8;
        let rawAmount;
        
        if (isNanopayment) {
            // Range: $0.0001 to $0.0100 (Official Nanopayment)
            rawAmount = (Math.random() * 0.0099 + 0.0001).toFixed(4);
        } else {
            // Range: $0.01 to $0.30 (Legacy Settlement)
            rawAmount = (Math.random() * 0.29 + 0.01).toFixed(3);
        }

        const amount = ethers.parseUnits(rawAmount, 6);
        const tag = isNanopayment ? "[💎 NANOPAYMENT]" : "[🏢 LEGACY_FEE] ";
        
        console.log(`[${new Date().toLocaleTimeString()}] 🤖 ${tag} Agent ${agent} settling: $${rawAmount} USDC`);
        const tx = await creditManager.injectProtocolRevenue(amount);
        await tx.wait();
        txCount++;
        console.log(`   ✅ SETTLED (Count: ${txCount}/50) | TX: ${tx.hash.slice(0, 10)}...`);

      } else if (actionRoll < 0.8) {
        // ACTION B: BORROW
        if (debtNum < 150) {
          const rawAmount = (Math.random() * 20 + 5).toFixed(2);
          const amount = ethers.parseUnits(rawAmount, 6);
          console.log(`[${new Date().toLocaleTimeString()}] 📤 [AGENT_LOAN] Requesting $${rawAmount} USDC...`);
          const tx = await creditManager.borrow(amount);
          await tx.wait();
          txCount++;
          console.log(`   ✅ DISBURSED (Count: ${txCount}/50) | TX: ${tx.hash.slice(0, 10)}...`);
        }

      } else {
        // ACTION C: REPAY
        if (debtNum > 0) {
          const rawAmount = (Math.random() * 10 + 2).toFixed(2);
          let amount = ethers.parseUnits(rawAmount, 6);
          if (amount > currentDebt) amount = currentDebt;

          console.log(`[${new Date().toLocaleTimeString()}] 📥 [CAPITAL_RECOVERY] Repaying $${ethers.formatUnits(amount, 6)} USDC...`);
          const tx = await creditManager.repay(amount);
          await tx.wait();
          txCount++;
          console.log(`   ✅ REPAID (Count: ${txCount}/50) | TX: ${tx.hash.slice(0, 10)}...`);
        }
      }

      // ACCELERATED MODE: 1-3 minutes to hit the 50 tx goal quickly
      const waitTime = Math.floor(Math.random() * 120000) + 60000;
      console.log(`   ⏳ Cooldown: ${Math.round(waitTime / 1000)}s...\n`);
      await new Promise(r => setTimeout(r, waitTime));

    } catch (err) {
      console.error("❌ Agent error:", err.message);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

main().catch(console.error);
