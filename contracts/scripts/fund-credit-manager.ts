import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Funding CreditManager with account:", deployer.address);

  // Load addresses
  const addressPath = path.join(__dirname, "../../src/config/contractAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressPath, "utf8"));

  const usdcAddress = addresses.MockUSDC;
  const creditManagerAddress = addresses.ArcCreditManager;

  // Load ABI
  const abiPath = path.join(__dirname, "../../src/config/contractABIs.json");
  const abis = JSON.parse(fs.readFileSync(abiPath, "utf8"));

  const usdc = new ethers.Contract(usdcAddress, abis.MockUSDC, deployer);

  const amount = ethers.parseUnits("10000", 6); // 10,000 USDC

  console.log(`Minting ${ethers.formatUnits(amount, 6)} USDC to deployer...`);
  const mintTx = await usdc.mint(deployer.address, amount);
  await mintTx.wait();

  console.log(`Sending ${ethers.formatUnits(amount, 6)} USDC to CreditManager...`);
  const tx = await usdc.transfer(creditManagerAddress, amount);
  await tx.wait();

  const balance = await usdc.balanceOf(creditManagerAddress);
  console.log("CreditManager funded. Current balance:", ethers.formatUnits(balance, 6), "USDC");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
