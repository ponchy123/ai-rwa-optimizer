// 主网部署脚本
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 AI-RWA Portfolio Optimizer 到 HSK Chain 主网...");
  
  // 检查环境变量
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ 错误: 请设置 PRIVATE_KEY 环境变量");
    process.exit(1);
  }
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📋 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
  
  // 部署合约
  console.log("\n📦 部署合约...");
  
  // 1. 部署 SecurityManager
  console.log("1. 部署 SecurityManager...");
  const SecurityManager = await ethers.getContractFactory("SecurityManager");
  const securityManager = await SecurityManager.deploy();
  await securityManager.deployed();
  console.log("   SecurityManager 部署地址:", securityManager.address);
  
  // 2. 部署 PriceFeed
  console.log("2. 部署 PriceFeed...");
  const PriceFeed = await ethers.getContractFactory("PriceFeed");
  const priceFeed = await PriceFeed.deploy();
  await priceFeed.deployed();
  console.log("   PriceFeed 部署地址:", priceFeed.address);
  
  // 3. 部署 PortfolioManagerV2
  console.log("3. 部署 PortfolioManagerV2...");
  const PortfolioManagerV2 = await ethers.getContractFactory("PortfolioManagerV2");
  const portfolioManager = await PortfolioManagerV2.deploy(priceFeed.address);
  await portfolioManager.deployed();
  console.log("   PortfolioManagerV2 部署地址:", portfolioManager.address);
  
  // 4. 部署 AIStrategyExecutor
  console.log("4. 部署 AIStrategyExecutor...");
  const AIStrategyExecutor = await ethers.getContractFactory("AIStrategyExecutor");
  const aiStrategyExecutor = await AIStrategyExecutor.deploy(portfolioManager.address);
  await aiStrategyExecutor.deployed();
  console.log("   AIStrategyExecutor 部署地址:", aiStrategyExecutor.address);
  
  // 5. 部署 AutoPayment
  console.log("5. 部署 AutoPayment...");
  const AutoPayment = await ethers.getContractFactory("AutoPayment");
  const autoPayment = await AutoPayment.deploy();
  await autoPayment.deployed();
  console.log("   AutoPayment 部署地址:", autoPayment.address);
  
  // 6. 部署 MockToken (用于测试)
  console.log("6. 部署 MockToken...");
  const MockToken = await ethers.getContractFactory("MockToken");
  
  const xAU = await MockToken.deploy("Tokenized Gold", "xAU", 18);
  await xAU.deployed();
  console.log("   xAU 部署地址:", xAU.address);
  
  const xRE = await MockToken.deploy("Tokenized Real Estate", "xRE", 18);
  await xRE.deployed();
  console.log("   xRE 部署地址:", xRE.address);
  
  const xST = await MockToken.deploy("Tokenized Stocks", "xST", 18);
  await xST.deployed();
  console.log("   xST 部署地址:", xST.address);
  
  // 7. 配置合约
  console.log("\n⚙️ 配置合约...");
  
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
    network: "HSK Chain Mainnet",
    chainId: 133,
    deployer: deployer.address,
    contracts: {
      SecurityManager: securityManager.address,
      PriceFeed: priceFeed.address,
      PortfolioManagerV2: portfolioManager.address,
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
  
  // 保存到文件
  const deploymentPath = path.join(__dirname, "..", "deployment-mainnet.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 部署信息已保存到 deployment-mainnet.json");
  
  // 输出部署摘要
  console.log("\n=========================================");
  console.log("🎉 部署完成！");
  console.log("=========================================");
  console.log("SecurityManager:", securityManager.address);
  console.log("PriceFeed:", priceFeed.address);
  console.log("PortfolioManagerV2:", portfolioManager.address);
  console.log("AIStrategyExecutor:", aiStrategyExecutor.address);
  console.log("AutoPayment:", autoPayment.address);
  console.log("xAU:", xAU.address);
  console.log("xRE:", xRE.address);
  console.log("xST:", xST.address);
  console.log("=========================================");
  
  // 验证合约（如果网络支持）
  console.log("\n🔍 验证合约...");
  try {
    await hre.run("verify:verify", {
      address: securityManager.address,
      constructorArguments: []
    });
    console.log("   ✅ SecurityManager 验证成功");
  } catch (error) {
    console.log("   ⚠️ SecurityManager 验证失败:", error.message);
  }
  
  try {
    await hre.run("verify:verify", {
      address: priceFeed.address,
      constructorArguments: []
    });
    console.log("   ✅ PriceFeed 验证成功");
  } catch (error) {
    console.log("   ⚠️ PriceFeed 验证失败:", error.message);
  }
  
  console.log("\n✅ 部署和验证完成！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });