const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const userAddress = "0x95ce5e60d5b5d7d91f24d36be44f07a161961628";
  
  const addressesPath = "c:\\Users\\Ghaxt\\Desktop\\arc-front\\src\\config\\contractAddresses.json";
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  
  const usdc = await hre.ethers.getContractAt("MockUSDC", addresses.MockUSDC);
  
  console.log("Recovering funds for public launch...");
  
  // Mint 30k to Deployer (to refill bot)
  const mintDeployer = await usdc.mint(deployer.address, hre.ethers.parseUnits("30000", 6));
  await mintDeployer.wait();
  console.log("✅ Minted 30,000 USDC to Deployer");

  // Mint 1k to User (for testing)
  const mintUser = await usdc.mint(userAddress, hre.ethers.parseUnits("1000", 6));
  await mintUser.wait();
  console.log("✅ Minted 1,000 USDC to User:", userAddress);
}

main().catch(console.error);
