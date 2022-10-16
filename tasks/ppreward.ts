import { types, task } from "hardhat/config";

import { MerkleTree } from "merkletreejs";
import { readAddressList } from "../scripts/contractAddress";
import {
  clearMockRewardList,
  getMockRewardListRoot,
} from "../scripts/mockrewardList";
import { getRewardListRoot } from "../scripts/rewardList";

import { PPReward, PPReward__factory } from "../typechain-types";

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
