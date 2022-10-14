import { types, task } from "hardhat/config";

import { MerkleTree } from "merkletreejs";
import { readAddressList } from "../scripts/contractAddress";
import { getRewardList, transferItem } from "../scripts/rewardList";

import { RewardItem } from "../scripts/rewardList";
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

    const rewardList = getRewardList();
    const stdList = rewardList.map((item: RewardItem) => transferItem(item));
    console.log("Standard list: ", stdList);

    const tree = new MerkleTree(stdList, keccak256, { sort: true });
    const root = tree.getHexRoot();

    const tx = await ppreward.setMerkleRoot(root);
    console.log("Tx details: ", await tx.wait());
  }
);

