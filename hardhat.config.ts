import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      // forking: {
      //   url: "https://eth-mainnet.alchemyapi.io/v2/bWpjNreAv-0V7abTFwp_FTDoFYAl9JGt",
      // },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    fuji: {
      url: process.env.FUJI_URL || "",
      accounts: {
        mnemonic:
          process.env.PHRASE_FUJI !== undefined ? process.env.PHRASE_FUJI : "",
        count: 20,
      },
      timeout: 60000,
    },
    avax: {
      url: process.env.AVAX_URL || "",
      accounts: {
        mnemonic:
          process.env.PHRASE_AVAX !== undefined ? process.env.PHRASE_AVAX : "",
        count: 20,
      },
      // gasPrice: 120000000000,
    },
    avaxTest: {
      url: process.env.AVAX_URL || "",
      accounts: {
        mnemonic:
          process.env.PHRASE_FUJI !== undefined ? process.env.PHRASE_FUJI : "",
        count: 20,
      },
    },
  },
};

export default config;
