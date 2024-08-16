import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const Token = await ethers.getContractFactory("LiquidityPool");
    const pool = await Token.deploy("0xToken0Address", "0xToken1Address");

    await pool.waitForDeployment();

    console.log("Liquidity Pool deployed to:",await pool.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
