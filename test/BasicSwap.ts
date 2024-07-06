import { ethers } from "hardhat";
import { expect } from "chai";
import { BasicSwap, ERC20Mock } from "../typechain-types";

describe("BasicSwap", function () {
  let tokenA: ERC20Mock;
  let tokenB: ERC20Mock;
  let basicSwap: BasicSwap;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy mock ERC20 tokens
    const Token = await ethers.getContractFactory("ERC20Mock");
    tokenA = await Token.deploy("Token A", "TKA", 1000000) as ERC20Mock;
    tokenB = await Token.deploy("Token B", "TKB", 1000000) as ERC20Mock;

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    // Deploy BasicSwap contract
    const BasicSwapFactory = await ethers.getContractFactory("BasicSwap");
    basicSwap = await BasicSwapFactory.deploy(await tokenA.getAddress(), await  tokenB.getAddress()) as BasicSwap;

    await basicSwap.waitForDeployment();

    // Transfer tokens to addr1 for testing
    await tokenA.transfer(addr1.address, 10000);
    await tokenB.transfer(addr1.address, 10000);

    // Provide initial liquidity from owner
    await tokenA.connect(owner).approve(await basicSwap.getAddress(), 500000);
    await tokenB.connect(owner).approve(await basicSwap.getAddress(), 500000);
    await basicSwap.connect(owner).provideLiquidity(500000, 500000);
  });

  it("should allow swapping tokens", async function () {
    // Approve tokens
    await tokenA.connect(addr1).approve(await basicSwap.getAddress(), 1000);
    
    // Swap tokens
    await expect(basicSwap.connect(addr1).swap(await tokenA.getAddress(), 1000))
      .to.emit(basicSwap, "Swap")
      .withArgs(await addr1.getAddress(),await tokenA.getAddress(), await tokenB.getAddress(), 1000, 995); // considering a 0.3% fee

    // Check balances
    expect(await tokenA.balanceOf(addr1.address)).to.equal(9000);
    expect(await tokenB.balanceOf(addr1.address)).to.equal(10995);
  });

  it("should allow providing liquidity", async function () {
    await tokenA.connect(addr1).approve(await basicSwap.getAddress(), 1000);
    await tokenB.connect(addr1).approve(await basicSwap.getAddress(), 1000);

    await expect(basicSwap.connect(addr1).provideLiquidity(1000, 1000))
      .to.emit(basicSwap, "LiquidityProvided")
      .withArgs(addr1.address, 1000, 1000);

    expect(await tokenA.balanceOf(await basicSwap.getAddress())).to.equal(501000);
    expect(await tokenB.balanceOf(await basicSwap.getAddress())).to.equal(501000);
  });

  it("should allow removing liquidity", async function () {
    await tokenA.connect(addr1).approve(await basicSwap.getAddress(), 1000);
    await tokenB.connect(addr1).approve(await basicSwap.getAddress(), 1000);

    await basicSwap.connect(addr1).provideLiquidity(1000, 1000);

    await expect(basicSwap.connect(addr1).removeLiquidity(500, 500))
      .to.emit(basicSwap, "LiquidityRemoved")
      .withArgs(addr1.address, 500, 500);

    expect(await tokenA.balanceOf(await basicSwap.getAddress())).to.equal(501000 - 500);
    expect(await tokenB.balanceOf(await basicSwap.getAddress())).to.equal(501000 - 500);
  });
});
