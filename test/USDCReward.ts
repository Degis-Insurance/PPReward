import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20, USDCReward } from "../typechain-types";

describe("USDCRewardTest", function () {
  let dev: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress;

  let usdc: MockERC20;

  let usdcReward: USDCReward;

  beforeEach(async function () {
    [dev, user1, user2] = await ethers.getSigners();

    const USDC = await ethers.getContractFactory("MockERC20");
    usdc = (await USDC.deploy("mockUSDC", "mockUSDC", 6)) as MockERC20;

    const USDCReward = await ethers.getContractFactory("USDCReward");
    usdcReward = (await USDCReward.deploy(usdc.address)) as USDCReward;
  });

  describe("Deployment", function () {
    it("should have the correct token info", async function () {
      expect(await usdc.name()).to.equal("mockUSDC");
      expect(await usdc.symbol()).to.equal("mockUSDC");
      expect(await usdc.decimals()).to.equal(6);
    });
  });

  describe("SetList", function () {
    it("should be able to set the list", async function () {
      const userList = [dev.address, user1.address, user2.address];
      const amountList = [100, 200, 300];

      await usdcReward.setList(userList, amountList);

      expect(await usdcReward.totalUsers()).to.equal(3);

      expect(await usdcReward.users(0)).to.equal(dev.address);
      expect(await usdcReward.users(1)).to.equal(user1.address);
      expect(await usdcReward.users(2)).to.equal(user2.address);

      expect(await usdcReward.amounts(0)).to.equal(100);
      expect(await usdcReward.amounts(1)).to.equal(200);
      expect(await usdcReward.amounts(2)).to.equal(300);
    });

    it("should be able to remove a user from the list", async function () {
      const userList = [dev.address, user1.address, user2.address];
      const amountList = [100, 200, 300];

      await usdcReward.setList(userList, amountList);

      await usdcReward.removeFromList(0);

      expect(await usdcReward.totalUsers()).to.equal(3);

      expect(await usdcReward.users(0)).to.equal(ethers.constants.AddressZero);
      expect(await usdcReward.users(1)).to.equal(user1.address);
      expect(await usdcReward.users(2)).to.equal(user2.address);

      expect(await usdcReward.amounts(0)).to.equal(0);
      expect(await usdcReward.amounts(1)).to.equal(200);
      expect(await usdcReward.amounts(2)).to.equal(300);
    });
  });

  describe("DistributeReward", function () {
    beforeEach(async function () {
      const userList = [dev.address, user1.address, user2.address];
      const amountList = [100, 200, 300];

      await usdcReward.setList(userList, amountList);

      await usdc.mint(usdcReward.address, 1000);
    });

    it("should be able to distribute reward", async function () {
      await usdcReward.distributeReward();

      // Distribute 600
      expect(await usdc.balanceOf(dev.address)).to.equal(100);
      expect(await usdc.balanceOf(user1.address)).to.equal(200);
      expect(await usdc.balanceOf(user2.address)).to.equal(300);

      // Remain 400
      expect(await usdc.balanceOf(usdcReward.address)).to.equal(400);
    });

    it("should be able to distribute reward after removing a user", async function () {
      await usdcReward.removeFromList(0);

      await usdcReward.distributeReward();

      // Distribute 500
      expect(await usdc.balanceOf(dev.address)).to.equal(0);
      expect(await usdc.balanceOf(user1.address)).to.equal(200);
      expect(await usdc.balanceOf(user2.address)).to.equal(300);

      // Remain 500
      expect(await usdc.balanceOf(usdcReward.address)).to.equal(500);
    });
  });
});
