require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // HSK Chain测试网
    hskTestnet: {
      url: process.env.WEB3_PROVIDER || "https://rpc.hashkeychain.net",
      chainId: parseInt(process.env.CHAIN_ID || "133"),
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length > 10 
        ? [process.env.PRIVATE_KEY] 
        : [],
      gas: 2100000,
      gasPrice: 1000000000,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};