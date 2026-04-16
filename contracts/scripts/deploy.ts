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

  if (isLocalhost) {
    // Deploy MockUSDC locally
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    usdcAddress = await usdc.getAddress();
    console.log("MockUSDC deployed to:", usdcAddress);
  } else {
    // Use Official ARC Testnet USDC
    usdcAddress = "0x3600000000000000000000000000000000000000";
    usdc = await ethers.getContractAt("MockUSDC", usdcAddress);
    console.log("Using Official Arc USDC at:", usdcAddress);
  }

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

  // Transfer some USDC to CreditManager to fund loans (only Localhost)
  if (isLocalhost) {
    const mintTx = await usdc.mint(creditManagerAddress, ethers.parseUnits('1000000', 6));
    await mintTx.wait();
    console.log("Funded CreditManager with 1M Mock USDC");

    // Transfer some USDC to our local deployer for testing in metamask
    const mintDeployer = await usdc.mint(deployer.address, ethers.parseUnits('50000', 6));
    await mintDeployer.wait();
    console.log("Funded deployer/tester with 50K Mock USDC");
  } else {
    console.log("⚠ TESTNET: Please manually send some official USDC to the CreditManager address so it has liquidity to loan!");
  }

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
