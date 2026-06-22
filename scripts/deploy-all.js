// 完整部署脚本 - AI-RWA Portfolio Optimizer
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 AI-RWA Portfolio Optimizer");
  console.log("=========================================\n");
  
  // 检查环境变量
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ 请设置 PRIVATE_KEY 环境变量");
    process.exit(1);
  }
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 网络信息:");
  console.log("   名称:", network.name);
  console.log("   Chain ID:", network.chainId);
  console.log("   部署账户:", deployer.address);
  console.log("   账户余额:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");
  
  const deployedContracts = {};
  
  // 1. 部署 SecurityManager
  console.log("1️⃣  部署 SecurityManager...");
  const SecurityManager = await ethers.getContractFactory("SecurityManager");
  const securityManager = await SecurityManager.deploy();
  await securityManager.deployed();
  deployedContracts.SecurityManager = securityManager.address;
  console.log("   ✅ 地址:", securityManager.address);
  
  // 2. 部署 PriceFeed
  console.log("\n2️⃣  部署 PriceFeed...");
  const PriceFeed = await ethers.getContractFactory("PriceFeed");
  const priceFeed = await PriceFeed.deploy();
  await priceFeed.deployed();
  deployedContracts.PriceFeed = priceFeed.address;
  console.log("   ✅ 地址:", priceFeed.address);
  
  // 3. 部署 PortfolioManagerV2
  console.log("\n3️⃣  部署 PortfolioManagerV2...");
  const PortfolioManagerV2 = await ethers.getContractFactory("PortfolioManagerV2");
  const portfolioManager = await PortfolioManagerV2.deploy(priceFeed.address);
  await portfolioManager.deployed();
  deployedContracts.PortfolioManagerV2 = portfolioManager.address;
  console.log("   ✅ 地址:", portfolioManager.address);
  
  // 4. 部署 AIStrategyExecutor
  console.log("\n4️⃣  部署 AIStrategyExecutor...");
  const AIStrategyExecutor = await ethers.getContractFactory("AIStrategyExecutor");
  const aiStrategyExecutor = await AIStrategyExecutor.deploy(portfolioManager.address);
  await aiStrategyExecutor.deployed();
  deployedContracts.AIStrategyExecutor = aiStrategyExecutor.address;
  console.log("   ✅ 地址:", aiStrategyExecutor.address);
  
  // 5. 部署 AutoPayment
  console.log("\n5️⃣  部署 AutoPayment...");
  const AutoPayment = await ethers.getContractFactory("AutoPayment");
  const autoPayment = await AutoPayment.deploy();
  await autoPayment.deployed();
  deployedContracts.AutoPayment = autoPayment.address;
  console.log("   ✅ 地址:", autoPayment.address);
  
  // 6. 部署 MockToken（用于测试）
  console.log("\n6️⃣  部署 MockToken...");
  const MockToken = await ethers.getContractFactory("MockToken");
  
  const xAU = await MockToken.deploy("Tokenized Gold", "xAU", 18);
  await xAU.deployed();
  deployedContracts.xAU = xAU.address;
  console.log("   ✅ xAU:", xAU.address);
  
  const xRE = await MockToken.deploy("Tokenized Real Estate", "xRE", 18);
  await xRE.deployed();
  deployedContracts.xRE = xRE.address;
  console.log("   ✅ xRE:", xRE.address);
  
  const xST = await MockToken.deploy("Tokenized Stocks", "xST", 18);
  await xST.deployed();
  deployedContracts.xST = xST.address;
  console.log("   ✅ xST:", xST.address);
  
  // 7. 配置合约
  console.log("\n⚙️  配置合约...");
  
  // 添加支持的资产
  await portfolioManager.addAsset(xAU.address, "Tokenized Gold", priceFeed.address);
  await portfolioManager.addAsset(xRE.address, "Tokenized Real Estate", priceFeed.address);
  await portfolioManager.addAsset(xST.address, "Tokenized Stocks", priceFeed.address);
  console.log("   ✅ 资产添加完成");
  
  // 设置 AI 服务地址
  await aiStrategyExecutor.setAIService(deployer.address);
  console.log("   ✅ AI 服务地址设置完成");
  
  // 配置安全功能
  await securityManager.setMaxSlippage(100); // 1% 滑点保护
  await securityManager.addOperator(portfolioManager.address);
  await securityManager.addOperator(aiStrategyExecutor.address);
  console.log("   ✅ 安全配置完成");
  
  // 保存部署信息
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: deployedContracts,
    timestamp: new Date().toISOString(),
  };
  
  const deploymentPath = path.join(__dirname, "..", `deployment-${network.name}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 部署信息已保存到:", deploymentPath);
  
  // 输出部署摘要
  console.log("\n=========================================");
  console.log("🎉 部署完成！");
  console.log("=========================================");
  console.log("SecurityManager:", deployedContracts.SecurityManager);
  console.log("PriceFeed:", deployedContracts.PriceFeed);
  console.log("PortfolioManagerV2:", deployedContracts.PortfolioManagerV2);
  console.log("AIStrategyExecutor:", deployedContracts.AIStrategyExecutor);
  console.log("AutoPayment:", deployedContracts.AutoPayment);
  console.log("xAU:", deployedContracts.xAU);
  console.log("xRE:", deployedContracts.xRE);
  console.log("xST:", deployedContracts.xST);
  console.log("=========================================");
  
  return deployedContracts;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });