import { ethers, artifacts } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const network = await ethers.provider.getNetwork();
  const isLocalhost = network.chainId === 31337n;

  let usdcAddress;
  let usdc;

  // Use Official ARC Testnet USDC (Mock interface but official address)
  usdcAddress = "0x3600000000000000000000000000000000000000";
  usdc = await ethers.getContractAt("MockUSDC", usdcAddress);
  console.log("Using Official Arc USDC at:", usdcAddress);

  // Deploy ScoreRegistry
  const ScoreRegistry = await ethers.getContractFactory("ArcScoreRegistry");
  const scoreRegistry = await ScoreRegistry.deploy();
  await scoreRegistry.waitForDeployment();
  const scoreRegistryAddress = await scoreRegistry.getAddress();
  console.log("ScoreRegistry deployed to:", scoreRegistryAddress);

  // Deploy Vault
  const Vault = await ethers.getContractFactory("ArcVault");
  const vault = await Vault.deploy(usdcAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("ArcVault deployed to:", vaultAddress);

  // Deploy CreditManager
  const CreditManager = await ethers.getContractFactory("ArcCreditManager");
  const creditManager = await CreditManager.deploy(usdcAddress, vaultAddress, scoreRegistryAddress);
  await creditManager.waitForDeployment();
  const creditManagerAddress = await creditManager.getAddress();
  console.log("ArcCreditManager deployed to:", creditManagerAddress);

  console.log("⚠ TESTNET: Please manually send some official USDC to the CreditManager address so it has liquidity to loan!");

  // Give high score and 300 USDC uncollateralized limit to deployer for testing
  const scoreTx = await scoreRegistry.updateScore(deployer.address, 950, ethers.parseUnits('300', 6), 0);
  await scoreTx.wait();
  console.log("Set Score=950 and UnsecuredLimit=300 USDC for deployer");

  // Extract ABIs and addresses to arc-front
  saveFrontendFiles({
    MockUSDC: usdcAddress,
    ArcScoreRegistry: scoreRegistryAddress,
    ArcVault: vaultAddress,
    ArcCreditManager: creditManagerAddress
  });
}

function saveFrontendFiles(addresses: any) {
  const contractsDir = path.join(__dirname, "..", "..", "src", "config");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contractAddresses.json"),
    JSON.stringify(addresses, undefined, 2)
  );

  const MockUSDCArtifact = artifacts.readArtifactSync("MockUSDC");
  const ScoreRegistryArtifact = artifacts.readArtifactSync("ArcScoreRegistry");
  const VaultArtifact = artifacts.readArtifactSync("ArcVault");
  const CreditManagerArtifact = artifacts.readArtifactSync("ArcCreditManager");

  const abis = {
    MockUSDC: MockUSDCArtifact.abi,
    ArcScoreRegistry: ScoreRegistryArtifact.abi,
    ArcVault: VaultArtifact.abi,
    ArcCreditManager: CreditManagerArtifact.abi,
  };

  fs.writeFileSync(
    path.join(contractsDir, "contractABIs.json"),
    JSON.stringify(abis, undefined, 2)
  );
  
  console.log("Addresses and ABIs exported to arc-front/src/config");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
