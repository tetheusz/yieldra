const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * 🦾 YIELDRA AUTONOMOUS AGENT BOT
 * This script runs in the background and injects "Real Agent Revenue" 
 * into the protocol on the Arc Testnet.
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("🦾 YIELDRA: AUTONOMOUS AGENT BOT INITIALIZED");
  console.log("Account:", deployer.address);
  console.log("==================================================");

  // Read addresses dynamically from the project config
  const addressesPath = path.join(__dirname, "../../src/config/contractAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  const USDC_ADDR = addresses.MockUSDC;
  const CREDIT_MANAGER_ADDR = addresses.ArcCreditManager;

  const usdc = await ethers.getContractAt("IERC20", USDC_ADDR);
  const creditManager = await ethers.getContractAt("ArcCreditManager", CREDIT_MANAGER_ADDR);

  console.log("Using CreditManager at:", CREDIT_MANAGER_ADDR);

  console.log("Checking allowance...");
  const allowance = await usdc.allowance(deployer.address, CREDIT_MANAGER_ADDR);
  
  if (allowance < ethers.parseUnits("1000000", 6)) {
    console.log("Approving CreditManager to spend USDC...");
    const approveTx = await usdc.approve(CREDIT_MANAGER_ADDR, ethers.MaxUint256);
    await approveTx.wait();
    console.log("✅ Allowance established.");
  } else {
    console.log("✅ Allowance already sufficient.");
  }

  // AGENT LIST for logs
  const agents = ["matrix-01", "neural-node-alpha", "lambda-9", "arc-arb-bot", "liquidity-sentinel"];

  console.log("\n🚀 Autopilot Active. Simulating high-frequency agent traffic...");

  while (true) {
    try {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      
      // Inject small realistic revenue (0.01 - 0.25 USDC)
      const rawAmount = (Math.random() * 0.24 + 0.01).toFixed(3);
      const amount = ethers.parseUnits(rawAmount, 6);

      console.log(`[${new Date().toLocaleTimeString()}] 🤖 Agent ${agent} settling settlement fee: $${rawAmount} USDC...`);

      const tx = await creditManager.injectProtocolRevenue(amount);
      await tx.wait();

      console.log(`   ✅ On-chain Settlement Success! TX: ${tx.hash}\n`);

      // Wait 30-60 seconds before next injection
      const waitTime = Math.floor(Math.random() * 20000) + 20000; // Faster for the first run
      await new Promise(r => setTimeout(r, waitTime));

    } catch (err) {
      console.error("❌ Settlement Error:", err.message);
      await new Promise(r => setTimeout(r, 5000)); // Cool down
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
