// 演示脚本 - 展示 AI-RWA Portfolio Optimizer 的使用
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 AI-RWA Portfolio Optimizer 演示");
  console.log("=====================================\n");
  
  // 获取账户
  const [user1, user2] = await ethers.getSigners();
  console.log("用户1:", user1.address);
  console.log("用户2:", user2.address);
  
  // 1. 部署合约
  console.log("\n📦 部署合约...");
  const PortfolioManager = await ethers.getContractFactory("PortfolioManager");
  const portfolioManager = await PortfolioManager.deploy();
  await portfolioManager.deployed();
  
  const MockToken = await ethers.getContractFactory("MockToken");
  const xAU = await MockToken.deploy("Tokenized Gold", "xAU", 18);
  await xAU.deployed();
  
  const xRE = await MockToken.deploy("Tokenized Real Estate", "xRE", 18);
  await xRE.deployed();
  
  // 添加资产
  await portfolioManager.addAsset(xAU.address, "Tokenized Gold");
  await portfolioManager.addAsset(xRE.address, "Tokenized Real Estate");
  
  console.log("✅ 合约部署完成");
  
  // 2. 铸造代币给用户
  console.log("\n💰 铸造代币...");
  await xAU.mint(user1.address, ethers.utils.parseEther("100"));
  await xRE.mint(user1.address, ethers.utils.parseEther("100"));
  console.log("✅ 代币铸造完成");
  
  // 3. 创建投资组合
  console.log("\n📊 创建投资组合...");
  await xAU.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("50"));
  await xRE.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("50"));
  
  await portfolioManager.connect(user1).createPortfolio(
    [xAU.address, xRE.address],
    [ethers.utils.parseEther("50"), ethers.utils.parseEther("50")],
    [5000, 5000] // 50% each
  );
  
  const portfolio = await portfolioManager.getPortfolio(user1.address);
  console.log("✅ 投资组合创建成功");
  console.log("   资产数量:", portfolio.amounts.length);
  console.log("   总价值:", ethers.utils.formatEther(portfolio.totalValue), "USD");
  
  // 4. 模拟AI策略
  console.log("\n🤖 模拟AI策略...");
  const strategy = {
    allocations: [6000, 4000], // 60% xAU, 40% xRE
    expectedReturn: 8.5,
    riskScore: 45,
    confidence: 87
  };
  
  console.log("✅ AI策略生成完成");
  console.log("   建议配置:", strategy.allocations[0]/100, "% xAU,", strategy.allocations[1]/100, "% xRE");
  console.log("   预期收益:", strategy.expectedReturn + "%");
  console.log("   风险评分:", strategy.riskScore);
  console.log("   AI置信度:", strategy.confidence + "%");
  
  // 5. 执行再平衡
  console.log("\n⚖️ 执行再平衡...");
  // 增加授权以支持再平衡
  await xAU.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("100"));
  await xRE.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("100"));
  
  await portfolioManager.connect(user1).rebalance(
    [ethers.utils.parseEther("60"), ethers.utils.parseEther("40")]
  );
  
  const updatedPortfolio = await portfolioManager.getPortfolio(user1.address);
  console.log("✅ 再平衡完成");
  console.log("   新配置:", 
    ethers.utils.formatEther(updatedPortfolio.amounts[0]), "xAU,",
    ethers.utils.formatEther(updatedPortfolio.amounts[1]), "xRE"
  );
  
  // 6. 模拟自动支付
  console.log("\n💸 模拟自动支付...");
  const AutoPayment = await ethers.getContractFactory("AutoPayment");
  const autoPayment = await AutoPayment.deploy();
  await autoPayment.deployed();
  
  // 创建自动支付
  await xAU.connect(user1).approve(autoPayment.address, ethers.utils.parseEther("10"));
  
  const paymentTx = await autoPayment.connect(user1).createPayment(
    user2.address,
    xAU.address,
    ethers.utils.parseEther("1"),
    86400 // 每天
  );
  
  console.log("✅ 自动支付创建成功");
  console.log("   收款人:", user2.address);
  console.log("   金额: 1 xAU");
  console.log("   频率: 每天");
  
  // 7. 总结
  console.log("\n=====================================");
  console.log("🎉 演示完成！");
  console.log("=====================================");
  console.log("核心功能:");
  console.log("1. ✅ 创建投资组合");
  console.log("2. ✅ AI策略生成");
  console.log("3. ✅ 自动再平衡");
  console.log("4. ✅ 自动支付");
  console.log("=====================================");
  console.log("这是一个完整的AI驱动的RWA投资组合管理平台！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });