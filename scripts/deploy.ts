import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const tokenAAddress = "0xYourTokenAAddress";
  const tokenBAddress = "0xYourTokenBAddress";

  const BasicSwap = await ethers.getContractFactory("BasicSwap");
  const basicSwap = await BasicSwap.deploy(tokenAAddress, tokenBAddress);

  await basicSwap.waitForDeployment();
  console.log("BasicSwap deployed to:", await basicSwap.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
