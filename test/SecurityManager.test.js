const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecurityManager", function () {
  let securityManager;
  let owner;
  let operator;
  let user1;

  beforeEach(async function () {
    [owner, operator, user1] = await ethers.getSigners();
    
    // 部署SecurityManager
    const SecurityManager = await ethers.getContractFactory("SecurityManager");
    securityManager = await SecurityManager.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await securityManager.admin()).to.equal(owner.address);
    });

    it("Should not be paused initially", async function () {
      expect(await securityManager.paused()).to.be.false;
    });

    it("Should have default slippage", async function () {
      expect(await securityManager.maxSlippage()).to.equal(100);
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause the contract", async function () {
      await securityManager.pause();
      expect(await securityManager.paused()).to.be.true;
    });

    it("Should unpause the contract", async function () {
      await securityManager.pause();
      await securityManager.unpause();
      expect(await securityManager.paused()).to.be.false;
    });

    it("Should revert if non-admin tries to pause", async function () {
      await expect(
        securityManager.connect(user1).pause()
      ).to.be.revertedWith("Only admin");
    });

    it("Should revert if non-admin tries to unpause", async function () {
      await securityManager.pause();
      await expect(
        securityManager.connect(user1).unpause()
      ).to.be.revertedWith("Only admin");
    });
  });

  describe("Operator Management", function () {
    it("Should add operator", async function () {
      await securityManager.addOperator(operator.address);
      expect(await securityManager.operators(operator.address)).to.be.true;
    });

    it("Should remove operator", async function () {
      await securityManager.addOperator(operator.address);
      await securityManager.removeOperator(operator.address);
      expect(await securityManager.operators(operator.address)).to.be.false;
    });

    it("Should revert if non-admin tries to add operator", async function () {
      await expect(
        securityManager.connect(user1).addOperator(operator.address)
      ).to.be.revertedWith("Only admin");
    });
  });

  describe("Slippage Protection", function () {
    it("Should set max slippage", async function () {
      await securityManager.setMaxSlippage(200);
      expect(await securityManager.maxSlippage()).to.equal(200);
    });

    it("Should revert if slippage too high", async function () {
      await expect(
        securityManager.setMaxSlippage(600)
      ).to.be.revertedWith("Slippage too high");
    });

    it("Should check slippage correctly", async function () {
      // 正滑点，总是接受
      expect(await securityManager.checkSlippage(100, 110)).to.be.true;
      
      // 负滑点在限制内
      expect(await securityManager.checkSlippage(100, 99)).to.be.true;
      
      // 负滑点超出限制
      expect(await securityManager.checkSlippage(100, 90)).to.be.false;
    });
  });

  describe("Emergency Functions", function () {
    it("Should pause contract", async function () {
      await securityManager.pauseContract(operator.address);
      expect(await securityManager.isContractPaused(operator.address)).to.be.true;
    });

    it("Should unpause contract", async function () {
      await securityManager.pauseContract(operator.address);
      await securityManager.unpauseContract(operator.address);
      expect(await securityManager.isContractPaused(operator.address)).to.be.false;
    });
  });
});