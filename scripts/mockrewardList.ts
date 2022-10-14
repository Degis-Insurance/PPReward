import { ethers } from "hardhat";
import MerkleTree from "merkletreejs";

const fs = require("fs");

export type RewardItem = {
  address: string;
  reward: number;
};

export const getMockRewardList = (): RewardItem[] => {
  const rewardlist = JSON.parse(
    fs.readFileSync("info/mockrewardList.json", "utf-8")
  );

  return rewardlist;
};

export const storeMockRewardList = (rewardList: RewardItem[]) => {
  fs.writeFileSync("info/mockrewardList.json", JSON.stringify(rewardList));
};

export const clearMockRewardList = () => {
  fs.writeFileSync("info/mockrewardList.json", JSON.stringify([]));
};

export const addItemToMockRewardList = (item: RewardItem) => {
  const rewardList = getMockRewardList();
  rewardList.push(item);
  storeMockRewardList(rewardList);
};

export const transferMockItem = (item: RewardItem): string => {
  const { address, reward } = item;

  const checksumAddress = ethers.utils.getAddress(address);

  //   console.log("Checksum address: ", checksumAddress);
  //   console.log("Amount: ", rewardToWei);

  const itemHash: string = ethers.utils.solidityKeccak256(
    ["address", "uint256"],
    [checksumAddress, reward]
  );

  return itemHash;
};

export const getMockRewardListRoot = () => {
  const rewardList = getMockRewardList();
  const stdList = rewardList.map((item: RewardItem) => transferMockItem(item));
  console.log("Standard list: ", stdList);

  const { keccak256 } = ethers.utils;

  const tree = new MerkleTree(stdList, keccak256, { sort: true });
  const root = tree.getHexRoot();

  return root;
};

export const getMockProof = (address: string, reward: number): string[] => {
  const rewardList = getMockRewardList();
  const stdList = rewardList.map((item: RewardItem) => transferMockItem(item));

  const { keccak256 } = ethers.utils;

  const tree = new MerkleTree(stdList, keccak256, { sort: true });

  const proof = tree.getHexProof(transferMockItem({ address, reward }));
  return proof;
};
