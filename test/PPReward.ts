import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20 } from "../typechain-types/contracts/mockERC20.sol/MockERC20";
import {
  MockERC20__factory,
  PPReward,
  PPReward__factory,
} from "../typechain-types";
import { getLatestBlockTimestamp } from "./utils";
import { getRewardListRoot, RewardItem } from "../scripts/rewardList";

import {
  addItemToMockRewardList,
  clearMockRewardList,
  getMockProof,
  getMockRewardList,
  getMockRewardListRoot,
  storeMockRewardList,
} from "../scripts/mockrewardList";

describe("PPRewardTest", function () {
  let dev: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress;

  let deg: MockERC20;

  let ppreward: PPReward;

  const duration = 1000000000;

  let now: number;

  beforeEach(async function () {
    [dev, user1, user2] = await ethers.getSigners();

    deg = await new MockERC20__factory(dev).deploy("mockDEG", "mockDEG", 18);

    // Block timestamp
    now = await getLatestBlockTimestamp(ethers.provider);

    ppreward = await new PPReward__factory(dev).deploy(
      deg.address,
      now + duration
    );

    deg.mint(ppreward.address, ethers.utils.parseEther("1000000"));
  });

  describe("Deployment", function () {
    it("should have the correct deg address", async function () {
      expect(await ppreward.DEG()).to.equal(deg.address);
    });

    it("should have the correct end time stamp", async function () {
      expect(await ppreward.endTimestamp()).to.be.above(0);
      expect(await ppreward.endTimestamp()).to.equal(now + duration);
    });
  });

  describe("Set Root", function () {
    it("should be able to have no root", async function () {
      expect(await ppreward.root()).to.equal(ethers.constants.HashZero);
    });

    // it("should be able to set a new root", async function () {
    //   const root = getRewardListRoot();

    //   await ppreward.setMerkleRoot(root);

    //   expect(await ppreward.root()).to.equal(root);
    // });
  });

  describe("Claim", function () {
    beforeEach(async function () {
      const rewardItem1: RewardItem = {
        address: user1.address,
        reward: 100,
      };

      const rewardItem2: RewardItem = {
        address: user2.address,
        reward: 200,
      };

      addItemToMockRewardList(rewardItem1);
      addItemToMockRewardList(rewardItem2);

      const root = getMockRewardListRoot();
      await ppreward.setMerkleRoot(root);
    });

    it("should be able to claim reward", async function () {
      const proofForUser1 = getMockProof(user1.address, 100);

      await expect(
        ppreward.connect(user1).claim(user1.address, 100, proofForUser1)
      )
        .to.emit(ppreward, "Claim")
        .withArgs(user1.address, 100);

      expect(await deg.balanceOf(user1.address)).to.equal(100);

      const proofForUser2 = getMockProof(user2.address, 200);
      await expect(
        ppreward.connect(user2).claim(user2.address, 200, proofForUser2)
      )
        .to.emit(ppreward, "Claim")
        .withArgs(user2.address, 200);

      expect(await deg.balanceOf(user2.address)).to.equal(200);
    });

    it("should not be able to claim reward with wrong proof", async function () {
      const wrongProofForUser1 = getMockProof(user1.address, 1000);
      const wrongProofForUser2 = getMockProof(user2.address, 2000);

      await expect(
        ppreward.connect(user1).claim(user1.address, 1000, wrongProofForUser1)
      ).to.be.revertedWith("Not in the reward list");

      await expect(
        ppreward.connect(user1).claim(user1.address, 100, wrongProofForUser1)
      ).to.be.revertedWith("Not in the reward list");

      await expect(
        ppreward.connect(user2).claim(user2.address, 2000, wrongProofForUser2)
      ).to.be.revertedWith("Not in the reward list");

      await expect(
        ppreward.connect(user2).claim(user2.address, 200, wrongProofForUser2)
      ).to.be.revertedWith("Not in the reward list");
    });

    it("should not be able to claim reward with wrong parameters", async function () {
      const proof = getMockProof(user1.address, 100);

      await expect(
        ppreward.connect(user1).claim(user1.address, 1000, proof)
      ).to.be.revertedWith("Not in the reward list");

      await expect(
        ppreward.connect(user1).claim(user2.address, 1000, proof)
      ).to.be.revertedWith("Not in the reward list");
    });

    it("should not be able to claim multiple times", async function () {
      const proofForUser1 = getMockProof(user1.address, 100);

      await ppreward.connect(user1).claim(user1.address, 100, proofForUser1);

      await expect(
        ppreward.connect(user1).claim(user1.address, 100, proofForUser1)
      ).to.be.revertedWith("Already Claimed");

      const proofForUser2 = getMockProof(user2.address, 200);

      await ppreward.connect(user2).claim(user2.address, 200, proofForUser2);

      await expect(
        ppreward.connect(user2).claim(user2.address, 200, proofForUser2)
      ).to.be.revertedWith("Already Claimed");
    });

    afterEach(async function () {
      clearMockRewardList();
    });
  });
});
