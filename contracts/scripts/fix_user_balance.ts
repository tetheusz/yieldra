const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const correctAddress = "0x95CeF771ECf1E5a87D849fA4FAbef845bC5FF628"; // Corrected from user's last message
  
  const addressesPath = "c:\\Users\\Ghaxt\\Desktop\\arc-front\\src\\config\\contractAddresses.json";
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  
  const usdc = await hre.ethers.getContractAt("MockUSDC", addresses.MockUSDC);
  
  console.log("URGENT: Minting recovery funds to the correct user address...");
  
  const mintTx = await usdc.mint(correctAddress, hre.ethers.parseUnits("50000", 6));
  await mintTx.wait();
  
  console.log("✅ Successfully minted 50,000 USDC to:", correctAddress);
  console.log("   Token Address:", addresses.MockUSDC);
}

main().catch(console.error);
