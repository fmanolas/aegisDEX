import { ethers } from "hardhat";
import { expect } from "chai";
import { LiquidityPool, ERC20, ERC20Mock } from "../typechain-types";

describe("LiquidityPool", function () {
  let token1: ERC20Mock;
  let token2: ERC20Mock;
  let liquidityPool: LiquidityPool;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const ERC20Factory = await ethers.getContractFactory("ERC20Mock");
    token1 = await ERC20Factory.deploy("Token1", "TK1", 18);
    token2 = await ERC20Factory.deploy("Token2", "TK2", 18);

    await token1.waitForDeployment();
    await token2.waitForDeployment();

    const LiquidityPoolFactory = await ethers.getContractFactory("LiquidityPool");
    liquidityPool = await LiquidityPoolFactory.deploy(await token1.getAddress(), await token2.getAddress());

    await liquidityPool.waitForDeployment();

    await token1.mint(owner.address, ethers.parseEther("1000"));
    await token2.mint(owner.address, ethers.parseEther("1000"));
  });

  it("Should add liquidity and mint LP tokens", async function () {
    await token1.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));
    await token2.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));

    await liquidityPool.addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"), owner.address);

    expect(await liquidityPool.balanceOf(owner.address)).to.be.gt(0);
  });

  it("Should allow removing liquidity and returning tokens", async function () {
    await token1.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));
    await token2.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));

    await liquidityPool.addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"), owner.address);
    const lpBalance = await liquidityPool.balanceOf(owner.address);

    await liquidityPool.removeLiquidity(lpBalance, owner.address);

    expect(await token1.balanceOf(owner.address)).to.be.closeTo(ethers.parseEther("1000"), ethers.parseEther("1"));
    expect(await token2.balanceOf(owner.address)).to.be.closeTo(ethers.parseEther("1000"), ethers.parseEther("1"));
  });

  it("Should swap tokens correctly", async function () {
    await token1.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));
    await token2.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));

    await liquidityPool.addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"), owner.address);

    const token2InitialBalance = await token2.balanceOf(addr1.address);

    await token1.transfer(addr1.address, ethers.parseEther("10"));
    await token1.connect(addr1).approve(await liquidityPool.getAddress(), ethers.parseEther("10"));

    await liquidityPool.connect(addr1).swap(await token1.getAddress(), ethers.parseEther("10"), await addr1.getAddress());

    expect(await token2.balanceOf(addr1.address)).to.be.gt(token2InitialBalance);
  });
});
