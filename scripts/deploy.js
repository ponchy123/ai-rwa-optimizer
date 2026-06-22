// 部署脚本
const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署 AI-RWA Portfolio Optimizer...");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.getBalance()).toString());
  
  // 1. 部署 PortfolioManager
  console.log("\n1. 部署 PortfolioManager...");
  const PortfolioManager = await ethers.getContractFactory("PortfolioManager");
  const portfolioManager = await PortfolioManager.deploy();
  await portfolioManager.deployed();
  console.log("PortfolioManager 部署地址:", portfolioManager.address);
  
  // 2. 部署 AIStrategyExecutor
  console.log("\n2. 部署 AIStrategyExecutor...");
  const AIStrategyExecutor = await ethers.getContractFactory("AIStrategyExecutor");
  const aiStrategyExecutor = await AIStrategyExecutor.deploy(portfolioManager.address);
  await aiStrategyExecutor.deployed();
  console.log("AIStrategyExecutor 部署地址:", aiStrategyExecutor.address);
  
  // 3. 部署 AutoPayment
  console.log("\n3. 部署 AutoPayment...");
  const AutoPayment = await ethers.getContractFactory("AutoPayment");
  const autoPayment = await AutoPayment.deploy();
  await autoPayment.deployed();
  console.log("AutoPayment 部署地址:", autoPayment.address);
  
  // 4. 部署 MockToken (用于测试)
  console.log("\n4. 部署 MockToken...");
  const MockToken = await ethers.getContractFactory("MockToken");
  
  // 部署代币化黄金 (xAU)
  const xAU = await MockToken.deploy("Tokenized Gold", "xAU", 18);
  await xAU.deployed();
  console.log("xAU 部署地址:", xAU.address);
  
  // 部署代币化房地产 (xRE)
  const xRE = await MockToken.deploy("Tokenized Real Estate", "xRE", 18);
  await xRE.deployed();
  console.log("xRE 部署地址:", xRE.address);
  
  // 部署代币化股票 (xST)
  const xST = await MockToken.deploy("Tokenized Stocks", "xST", 18);
  await xST.deployed();
  console.log("xST 部署地址:", xST.address);
  
  // 5. 添加支持的资产到 PortfolioManager
  console.log("\n5. 添加支持的资产...");
  await portfolioManager.addAsset(xAU.address, "Tokenized Gold");
  await portfolioManager.addAsset(xRE.address, "Tokenized Real Estate");
  await portfolioManager.addAsset(xST.address, "Tokenized Stocks");
  console.log("资产添加完成");
  
  // 6. 设置 AI 服务地址
  console.log("\n6. 设置 AI 服务地址...");
  await aiStrategyExecutor.setAIService(deployer.address); // 暂时使用部署者地址
  console.log("AI 服务地址设置完成");
  
  // 输出部署信息
  console.log("\n=========================================");
  console.log("部署完成！");
  console.log("=========================================");
  console.log("PortfolioManager:", portfolioManager.address);
  console.log("AIStrategyExecutor:", aiStrategyExecutor.address);
  console.log("AutoPayment:", autoPayment.address);
  console.log("xAU:", xAU.address);
  console.log("xRE:", xRE.address);
  console.log("xST:", xST.address);
  console.log("=========================================");
  
  // 保存部署信息到文件
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      PortfolioManager: portfolioManager.address,
      AIStrategyExecutor: aiStrategyExecutor.address,
      AutoPayment: autoPayment.address,
      tokens: {
        xAU: xAU.address,
        xRE: xRE.address,
        xST: xST.address
      }
    },
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("部署信息已保存到 deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });