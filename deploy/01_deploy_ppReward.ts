import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { readAddressList, storeAddressList } from "../scripts/contractAddress";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, save, getArtifact } = deployments;

  network.name = network.name == "hardhat" ? "localhost" : network.name;

  const { deployer } = await getNamedAccounts();

  // Read address list from local file
  const addressList = readAddressList();

  const degAddress =
    network.name == "avax"
      ? addressList[network.name].DegisToken
      : addressList[network.name].MockDEG;

  const duration = 3600 * 24 * 60;

  // Deploy degis token contract
  // No constructor args
  const ppreward = await deploy("PPReward", {
    contract: "PPReward",
    from: deployer,
    args: [degAddress, duration],
    log: true,
  });
  addressList[network.name].PPReward = ppreward.address;

  // Store the address list after deployment
  storeAddressList(addressList);
};

func.tags = ["PPReward"];
export default func;
