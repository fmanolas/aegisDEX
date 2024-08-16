import { ethers } from "hardhat";
import { expect } from "chai";
import { LiquidityPool, YieldFarm, ERC20Mock, ERC20 } from "../typechain-types";

describe("YieldFarm", function () {
  let token1: ERC20Mock;
  let token2: ERC20Mock;
  let rewardToken: ERC20Mock;
  let liquidityPool: LiquidityPool;
  let yieldFarm: YieldFarm;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const ERC20Factory = await ethers.getContractFactory("ERC20Mock");
    token1 = (await ERC20Factory.deploy("Token1", "TK1", 18));
    token2 = (await ERC20Factory.deploy("Token2", "TK2", 18)) ;
    rewardToken = (await ERC20Factory.deploy("RewardToken", "RWD", 18)) ;

    await token1.waitForDeployment();
    await token2.waitForDeployment();
    await rewardToken.waitForDeployment();

    const LiquidityPoolFactory = await ethers.getContractFactory("LiquidityPool");
    liquidityPool = (await LiquidityPoolFactory.deploy(await token1.getAddress(), await token2.getAddress())) as LiquidityPool;
    await liquidityPool.waitForDeployment();

    const YieldFarmFactory = await ethers.getContractFactory("YieldFarm");
    yieldFarm = (await YieldFarmFactory.deploy(await liquidityPool.getAddress(), await rewardToken.getAddress(), 100)) as YieldFarm;
    await yieldFarm.waitForDeployment();

    await token1.mint(await owner.getAddress(), ethers.parseEther("1000"));
    await token2.mint(await owner.getAddress(), ethers.parseEther("1000"));
    await rewardToken.mint(await yieldFarm.getAddress(), ethers.parseEther("1000"));
  });

  it("Should allow staking LP tokens and earning rewards", async function () {
    await token1.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));
    await token2.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));

    await liquidityPool.addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"), await owner.getAddress());
    const lpBalance = await liquidityPool.balanceOf(await owner.getAddress());

    await liquidityPool.approve(await yieldFarm.getAddress(), lpBalance);
    await yieldFarm.stake(lpBalance);

    // Simulate time passing for rewards to accrue
    await ethers.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
    await ethers.provider.send("evm_mine", []); // Mine a new block

    const earned = await yieldFarm.earned(await owner.getAddress());
    expect(earned).to.be.gt(0);
  });

  it("Should allow users to claim rewards", async function () {
    await token1.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));
    await token2.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));

    await liquidityPool.addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"), await owner.getAddress());
    const lpBalance = await liquidityPool.balanceOf(await owner.getAddress());

    await liquidityPool.approve(await yieldFarm.getAddress(), lpBalance);
    await yieldFarm.stake(lpBalance);

    // Simulate time passing for rewards to accrue
    await ethers.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
    await ethers.provider.send("evm_mine", []); // Mine a new block

    await yieldFarm.claimReward();
    const rewardBalance = await rewardToken.balanceOf(await owner.getAddress());
    expect(rewardBalance).to.be.gt(0);
  });

  it("Should allow withdrawing staked LP tokens", async function () {
    await token1.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));
    await token2.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));

    await liquidityPool.addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"), await owner.getAddress());
    const lpBalance = await liquidityPool.balanceOf(await owner.getAddress());

    await liquidityPool.approve(await yieldFarm.getAddress(), lpBalance);
    await yieldFarm.stake(lpBalance);

    // Simulate time passing for rewards to accrue
    await ethers.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
    await ethers.provider.send("evm_mine", []); // Mine a new block

    await yieldFarm.withdraw(lpBalance);
    const remainingStakedBalance = await yieldFarm.stakedBalances(await owner.getAddress());
    expect(remainingStakedBalance).to.equal(0);

    const lpBalanceAfterWithdraw = await liquidityPool.balanceOf(await owner.getAddress());
    expect(lpBalanceAfterWithdraw).to.equal(lpBalance);
  });

  it("Should allow users to exit (unstake all and claim rewards)", async function () {
    await token1.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));
    await token2.approve(await liquidityPool.getAddress(), ethers.parseEther("100"));

    await liquidityPool.addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"), await owner.getAddress());
    const lpBalance = await liquidityPool.balanceOf(await owner.getAddress());

    await liquidityPool.approve(await yieldFarm.getAddress(), lpBalance);
    await yieldFarm.stake(lpBalance);

    // Simulate time passing for rewards to accrue
    await ethers.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
    await ethers.provider.send("evm_mine", []); // Mine a new block

    await yieldFarm.exit();

    const remainingStakedBalance = await yieldFarm.stakedBalances(await owner.getAddress());
    expect(remainingStakedBalance).to.equal(0);

    const rewardBalance = await rewardToken.balanceOf(await owner.getAddress());
    expect(rewardBalance).to.be.gt(0);
  });
});
