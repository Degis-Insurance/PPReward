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

  if (network.name == "avax") {
    console.log("Deploying Degis Token on AVAX Mainnet");
    return;
  }

  // Deploy degis token contract
  // No constructor args
  const mockDEG = await deploy("MockERC20", {
    contract: "MockERC20",
    from: deployer,
    args: ["MockDEG", "MockDEG", 18],
    log: true,
  });
  addressList[network.name].MockDEG = mockDEG.address;

  // Store the address list after deployment
  storeAddressList(addressList);
};

func.tags = ["MockDEG"];
export default func;
