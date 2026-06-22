const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PortfolioManager", function () {
  let portfolioManager;
  let owner;
  let user1;
  let token1;
  let token2;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    // 部署模拟ERC20代币
    const MockToken = await ethers.getContractFactory("MockToken");
    token1 = await MockToken.deploy("Token1", "TK1", 18);
    token2 = await MockToken.deploy("Token2", "TK2", 18);
    
    // 部署PortfolioManager
    const PortfolioManager = await ethers.getContractFactory("PortfolioManager");
    portfolioManager = await PortfolioManager.deploy();
    
    // 添加支持的资产
    await portfolioManager.addAsset(token1.address, "Token1");
    await portfolioManager.addAsset(token2.address, "Token2");
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await portfolioManager.admin()).to.equal(owner.address);
    });

    it("Should add supported assets", async function () {
      expect(await portfolioManager.isSupportedAsset(token1.address)).to.be.true;
      expect(await portfolioManager.isSupportedAsset(token2.address)).to.be.true;
    });
  });

  describe("Portfolio Creation", function () {
    it("Should create a portfolio", async function () {
      // 给用户1一些代币
      await token1.mint(user1.address, ethers.utils.parseEther("100"));
      await token2.mint(user1.address, ethers.utils.parseEther("100"));
      
      // 用户1批准合约转移代币
      await token1.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("50"));
      await token2.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("50"));
      
      // 创建投资组合
      await portfolioManager.connect(user1).createPortfolio(
        [token1.address, token2.address],
        [ethers.utils.parseEther("50"), ethers.utils.parseEther("50")],
        [5000, 5000] // 50% each
      );
      
      // 验证投资组合创建成功
      const portfolio = await portfolioManager.getPortfolio(user1.address);
      expect(portfolio.tokenAddresses[0]).to.equal(token1.address);
      expect(portfolio.tokenAddresses[1]).to.equal(token2.address);
      expect(portfolio.amounts[0]).to.equal(ethers.utils.parseEther("50"));
      expect(portfolio.amounts[1]).to.equal(ethers.utils.parseEther("50"));
      expect(portfolio.targetAllocations[0]).to.equal(5000);
      expect(portfolio.targetAllocations[1]).to.equal(5000);
    });

    it("Should fail if portfolio already exists", async function () {
      await token1.mint(user1.address, ethers.utils.parseEther("100"));
      await token1.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("50"));
      
      await portfolioManager.connect(user1).createPortfolio(
        [token1.address],
        [ethers.utils.parseEther("50")],
        [10000]
      );
      
      await expect(
        portfolioManager.connect(user1).createPortfolio(
          [token1.address],
          [ethers.utils.parseEther("50")],
          [10000]
        )
      ).to.be.revertedWith("Portfolio already exists");
    });

    it("Should fail if allocation sum is not 10000", async function () {
      await token1.mint(user1.address, ethers.utils.parseEther("100"));
      await token1.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("50"));
      
      await expect(
        portfolioManager.connect(user1).createPortfolio(
          [token1.address],
          [ethers.utils.parseEther("50")],
          [6000] // 60% instead of 100%
        )
      ).to.be.revertedWith("Total allocation must be 10000");
    });
  });

  describe("Portfolio Rebalance", function () {
    it("Should rebalance portfolio", async function () {
      // 给用户1一些代币
      await token1.mint(user1.address, ethers.utils.parseEther("100"));
      await token2.mint(user1.address, ethers.utils.parseEther("100"));
      
      // 用户1批准合约转移代币
      await token1.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("100"));
      await token2.connect(user1).approve(portfolioManager.address, ethers.utils.parseEther("100"));
      
      // 创建投资组合
      await portfolioManager.connect(user1).createPortfolio(
        [token1.address, token2.address],
        [ethers.utils.parseEther("50"), ethers.utils.parseEther("50")],
        [5000, 5000]
      );
      
      // 再平衡：调整为60% token1, 40% token2
      await portfolioManager.connect(user1).rebalance(
        [ethers.utils.parseEther("60"), ethers.utils.parseEther("40")]
      );
      
      // 验证再平衡成功
      const portfolio = await portfolioManager.getPortfolio(user1.address);
      expect(portfolio.amounts[0]).to.equal(ethers.utils.parseEther("60"));
      expect(portfolio.amounts[1]).to.equal(ethers.utils.parseEther("40"));
    });
  });
});