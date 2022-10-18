import { types, task } from "hardhat/config";

import { MerkleTree } from "merkletreejs";
import { readAddressList } from "../scripts/contractAddress";
import {
  clearMockRewardList,
  getMockProof,
  getMockRewardListRoot,
} from "../scripts/mockrewardList";
import { getRewardListRoot, getTotalReward } from "../scripts/rewardList";

import {
  MockERC20,
  MockERC20__factory,
  PPReward,
  PPReward__factory,
} from "../typechain-types";

const addressList = readAddressList();

task("setRoot", "Set the merkle root of pp reward contract").setAction(
  async (_, hre) => {
    const { network } = hre;

    const { keccak256 } = hre.ethers.utils;

    const [dev] = await hre.ethers.getSigners();
    console.log("Signer address: ", dev.address);

    const ppreward: PPReward = new PPReward__factory(dev).attach(
      addressList[network.name].PPReward
    );

    let root;
    if (network.name == "avax") {
      root = getRewardListRoot();
    } else root = getMockRewardListRoot();

    console.log("root: ", root);

    const tx = await ppreward.setMerkleRoot(root);
    console.log("Tx details: ", await tx.wait());
  }
);

task("clearMockList", "Clear mock reward list").setAction(async (_, hre) => {
  const { network } = hre;

  const { keccak256 } = hre.ethers.utils;

  const [dev] = await hre.ethers.getSigners();
  console.log("Signer address: ", dev.address);

  clearMockRewardList();
});

task("getMockProof", "Get mock proof").setAction(async (_, hre) => {
  const { network } = hre;

  const address = "0x37360220C2E848FE0A9c386111Dc9926C511D9c8";
  const reward = 1000;

  const proof = getMockProof(address, reward);

  console.log("Proof: ", proof);
});

task("mintDEG", "Mint DEG token").setAction(async (_, hre) => {
  const { network } = hre;

  const [dev] = await hre.ethers.getSigners();
  console.log("Signer address: ", dev.address);

  const ppreward: PPReward = new PPReward__factory(dev).attach(
    addressList[network.name].PPReward
  );

  const deg: MockERC20 = new MockERC20__factory(dev).attach(
    addressList[network.name].MockDEG
  );

  const tx = await deg.mint(
    ppreward.address,
    hre.ethers.utils.parseUnits("1000000", 18)
  );
  console.log("Tx details: ", await tx.wait());
});

task("getTotalReward", "Mint DEG token").setAction(async (_, hre) => {
  const { network } = hre;

  const totalReward = getTotalReward();
  console.log(totalReward);
});
