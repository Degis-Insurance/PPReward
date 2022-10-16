import { ethers } from "ethers";
import MerkleTree from "merkletreejs";

const fs = require("fs");

export type RewardItem = {
  address: string;
  reward: number;
};

export const getRewardList = (): RewardItem[] => {
  const rewardlist = JSON.parse(
    fs.readFileSync("info/rewardlist.json", "utf-8")
  );

  return rewardlist;
};

export const transferItem = (item: RewardItem): string => {
  const { address, reward } = item;

  const checksumAddress = ethers.utils.getAddress(address);
  const rewardToWei = ethers.utils.parseUnits(reward.toString(), "ether");

  //   console.log("Checksum address: ", checksumAddress);
  //   console.log("Amount: ", rewardToWei);

  const itemHash: string = ethers.utils.solidityKeccak256(
    ["address", "uint256"],
    [checksumAddress, rewardToWei]
  );

  return itemHash;
};

export const getRewardListRoot = () => {
  const rewardList = getRewardList();
  const stdList = rewardList.map((item: RewardItem) => transferItem(item));
  console.log("Standard list: ", stdList);

  const { keccak256 } = ethers.utils;

  const tree = new MerkleTree(stdList, keccak256, { sort: true });
  const root = tree.getHexRoot();

  return root;
};

export const getProof = (address: string, reward: number): string[] => {
  const rewardList = getRewardList();
  const stdList = rewardList.map((item: RewardItem) => transferItem(item));

  const { keccak256 } = ethers.utils;

  const tree = new MerkleTree(stdList, keccak256, { sort: true });

  const proof = tree.getHexProof(transferItem({ address, reward }));
  return proof;
};
