const addresses = require('../../src/config/contractAddresses.json');
const abis = require('../../src/config/contractABIs.json');

async function main() {
  const [signer] = await ethers.getSigners();
  const user = '0x95ce5e60d5b5d7d91f24d36be44f07a161961628';
  
  const credit = await ethers.getContractAt(abis.ArcCreditManager, addresses.ArcCreditManager);
  const vault = await ethers.getContractAt(abis.ArcVault, addresses.ArcVault);
  const usdc = await ethers.getContractAt(abis.MockUSDC, addresses.MockUSDC);

  console.log('--- ON-CHAIN AUDIT ---');
  console.log('User Address:', user);
  try {
    const balance = await usdc.balanceOf(user);
    console.log('User USDC Balance:', ethers.formatUnits(balance, 6));
    
    const allowance = await usdc.allowance(user, addresses.ArcVault);
    console.log('Allowance for Vault:', ethers.formatUnits(allowance, 6));

    const totalRevenue = await credit.totalProtocolRevenue();
    console.log('Protocol Revenue:', ethers.formatUnits(totalRevenue, 6));

    const totalBorrowed = await credit.totalBorrowed();
    console.log('Total Borrowed:', ethers.formatUnits(totalBorrowed, 6));

    const vaultTVL = await usdc.balanceOf(addresses.ArcVault);
    console.log('Vault TVL:', ethers.formatUnits(vaultTVL, 6));
  } catch (e) {
    console.log('Error fetching data:', e.message);
  }
}

main().catch(console.error);
