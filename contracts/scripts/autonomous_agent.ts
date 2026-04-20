const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * 🦾 YIELDRA INTELLIGENT AGENT BOT (v2.0)
 * Simulates a full-loop agentic economy:
 * 1. BORROW: Agents take unsecured credit based on reputation.
 * 2. REPAY: Agents return principal + interest to the protocol.
 * 3. INJECT: Agents pay settlement fees (direct revenue).
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("🦾 YIELDRA: INTELLIGENT AGENT BOT v2.0 ACTIVE");
  console.log("Operator:", deployer.address);
  console.log("==================================================");

  const addressesPath = path.join(__dirname, "../../src/config/contractAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  const usdc = await ethers.getContractAt("IERC20", addresses.MockUSDC);
  const creditManager = await ethers.getContractAt("ArcCreditManager", addresses.ArcCreditManager);

  // Initial Approval for Revenue Injection and Repayments
  console.log("Checking permissions...");
  const allowance = await usdc.allowance(deployer.address, addresses.ArcCreditManager);
  if (allowance < ethers.parseUnits("1000000", 6)) {
    const tx = await usdc.approve(addresses.ArcCreditManager, ethers.MaxUint256);
    await tx.wait();
    console.log("✅ Main liquidity approval granted.");
  }

  const agents = ["matrix-core", "neural-flow-01", "lambda-settler", "arb-sentinel"];

  while (true) {
    try {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const actionRoll = Math.random();
      
      // Get current bot state
      const currentDebt = await creditManager.getDebt(deployer.address);
      const debtNum = parseFloat(ethers.formatUnits(currentDebt, 6));

      if (actionRoll < 0.4) {
        // ACTION A: INJECT SETTLEMENT REVENUE (60% weight)
        const rawAmount = (Math.random() * 0.15 + 0.05).toFixed(4);
        const amount = ethers.parseUnits(rawAmount, 6);
        console.log(`[${new Date().toLocaleTimeString()}] 🤖 Agent ${agent}: settling fee: $${rawAmount} USDC`);
        const tx = await creditManager.injectProtocolRevenue(amount);
        await tx.wait();
        console.log(`   ✅ REVENUE INJECTED (TX: ${tx.hash.slice(0, 10)}...)`);

      } else if (actionRoll < 0.7) {
        // ACTION B: BORROW (30% weight)
        if (debtNum < 100) { // Limit bot debt for safety
          const rawAmount = (Math.random() * 20 + 5).toFixed(2);
          const amount = ethers.parseUnits(rawAmount, 6);
          console.log(`[${new Date().toLocaleTimeString()}] 📤 Agent ${agent}: Requesting Loan of $${rawAmount} USDC`);
          const tx = await creditManager.borrow(amount);
          await tx.wait();
          console.log(`   ✅ LOAN DISBURSED (TX: ${tx.hash.slice(0, 10)}...)`);
        } else {
          console.log(`[${new Date().toLocaleTimeString()}] ℹ️ Bot debt limit reached ($${debtNum}). Skipping borrow.`);
        }

      } else {
        // ACTION C: REPAY (10% weight or if debt is high)
        if (debtNum > 0) {
          const rawAmount = (Math.random() * 10 + 2).toFixed(2);
          let amount = ethers.parseUnits(rawAmount, 6);
          if (amount > currentDebt) amount = currentDebt;

          console.log(`[${new Date().toLocaleTimeString()}] 📥 Agent ${agent}: Repaying $${ethers.formatUnits(amount, 6)} USDC (Int+Prin)`);
          const tx = await creditManager.repay(amount);
          await tx.wait();
          console.log(`   ✅ DEBT SETTLED (TX: ${tx.hash.slice(0, 10)}...)`);
        } else {
          console.log(`[${new Date().toLocaleTimeString()}] ℹ️ No debt to repay. Skipping.`);
        }
      }

      // Interval: 10-15 minutes (Sustainability logic)
      const waitTime = Math.floor(Math.random() * 300000) + 600000;
      console.log(`   ⏳ Cool-down: ${Math.round(waitTime / 60000)} minutes...\n`);
      await new Promise(r => setTimeout(r, waitTime));

    } catch (err) {
      console.error("❌ Agent error:", err.message);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

main().catch(console.error);
