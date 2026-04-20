const hre = require("hardhat");
async function main() {
  const usdc = await hre.ethers.getContractAt("IERC20", "0x3600000000000000000000000000000000000000");
  const cm = "0x18CD33b9d9B12d0797941EadeE935142cE05f751";
  const bal = await usdc.balanceOf(cm);
  console.log(`LIQUIDITY_CHECK: ${cm} balance is ${hre.ethers.formatUnits(bal, 6)} USDC`);
}
main().catch(console.error);
