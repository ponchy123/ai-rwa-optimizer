// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PortfolioManager is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct Asset {
        address tokenAddress;
        string name;
        uint8 decimals;
        address priceFeed; // Chainlink价格预言机地址
    }
    
    struct Portfolio {
        address user;
        Asset[] assets;
        uint256[] amounts; // 用户持有的各资产数量
        uint256[] targetAllocations; // 目标配置比例（基点，1/10000）
        uint256 totalValue; // 投资组合总价值（USDT计价）
        uint256 lastRebalance; // 上次再平衡时间
        bool exists;
    }
    
    mapping(address => Portfolio) public portfolios;
    address[] public supportedAssets;
    mapping(address => bool) public isSupportedAsset;
    
    // 事件
    event PortfolioCreated(address indexed user, uint256 assetCount);
    event PortfolioRebalanced(address indexed user, uint256 totalValue);
    event AssetAdded(address indexed asset, string name);
    
    // 管理员
    address public admin;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    // 添加支持的资产
    function addAsset(
        address _tokenAddress,
        string memory _name
    ) external onlyAdmin {
        require(!isSupportedAsset[_tokenAddress], "Asset already supported");
        
        supportedAssets.push(_tokenAddress);
        isSupportedAsset[_tokenAddress] = true;
        
        emit AssetAdded(_tokenAddress, _name);
    }
    
    // 创建投资组合
    function createPortfolio(
        address[] memory _tokenAddresses,
        uint256[] memory _initialAmounts,
        uint256[] memory _targetAllocations
    ) external nonReentrant {
        require(!portfolios[msg.sender].exists, "Portfolio already exists");
        require(_tokenAddresses.length == _initialAmounts.length, "Length mismatch");
        require(_tokenAddresses.length == _targetAllocations.length, "Length mismatch");
        
        // 验证目标配置比例总和为10000（100%）
        uint256 totalAllocation = 0;
        for (uint i = 0; i < _targetAllocations.length; i++) {
            totalAllocation += _targetAllocations[i];
        }
        require(totalAllocation == 10000, "Total allocation must be 10000");
        
        // 验证资产支持
        for (uint i = 0; i < _tokenAddresses.length; i++) {
            require(isSupportedAsset[_tokenAddresses[i]], "Asset not supported");
        }
        
        // 转移资产到合约
        for (uint i = 0; i < _tokenAddresses.length; i++) {
            if (_initialAmounts[i] > 0) {
                IERC20(_tokenAddresses[i]).safeTransferFrom(
                    msg.sender,
                    address(this),
                    _initialAmounts[i]
                );
            }
        }
        
        // 创建投资组合
        Portfolio storage portfolio = portfolios[msg.sender];
        portfolio.user = msg.sender;
        portfolio.amounts = _initialAmounts;
        portfolio.targetAllocations = _targetAllocations;
        portfolio.lastRebalance = block.timestamp;
        portfolio.exists = true;
        
        // 逐个设置资产
        for (uint i = 0; i < _tokenAddresses.length; i++) {
            portfolio.assets.push(Asset({
                tokenAddress: _tokenAddresses[i],
                name: "",
                decimals: 18,
                priceFeed: address(0)
            }));
        }
        
        // 计算初始总价值
        portfolio.totalValue = calculatePortfolioValue(msg.sender);
        
        emit PortfolioCreated(msg.sender, _tokenAddresses.length);
    }
    
    // 计算投资组合价值
    function calculatePortfolioValue(address _user) public view returns (uint256) {
        Portfolio storage portfolio = portfolios[_user];
        require(portfolio.exists, "Portfolio does not exist");
        
        uint256 totalValue = 0;
        for (uint i = 0; i < portfolio.assets.length; i++) {
            if (portfolio.amounts[i] > 0) {
                // 这里简化处理，实际应该从Chainlink获取价格
                // 假设所有资产都以USDT计价
                totalValue += portfolio.amounts[i];
            }
        }
        return totalValue;
    }
    
    // 再平衡投资组合
    function rebalance(
        uint256[] memory _newAmounts
    ) external nonReentrant {
        Portfolio storage portfolio = portfolios[msg.sender];
        require(portfolio.exists, "Portfolio does not exist");
        require(_newAmounts.length == portfolio.assets.length, "Length mismatch");
        
        // 计算需要转移的资产差额
        for (uint i = 0; i < portfolio.assets.length; i++) {
            if (_newAmounts[i] > portfolio.amounts[i]) {
                // 需要转入资产
                uint256 diff = _newAmounts[i] - portfolio.amounts[i];
                IERC20(portfolio.assets[i].tokenAddress).safeTransferFrom(
                    msg.sender,
                    address(this),
                    diff
                );
            } else if (_newAmounts[i] < portfolio.amounts[i]) {
                // 需要转出资产
                uint256 diff = portfolio.amounts[i] - _newAmounts[i];
                IERC20(portfolio.assets[i].tokenAddress).safeTransfer(
                    msg.sender,
                    diff
                );
            }
        }
        
        // 更新投资组合
        portfolio.amounts = _newAmounts;
        portfolio.totalValue = calculatePortfolioValue(msg.sender);
        portfolio.lastRebalance = block.timestamp;
        
        emit PortfolioRebalanced(msg.sender, portfolio.totalValue);
    }
    
    // 获取投资组合信息
    function getPortfolio(address _user) external view returns (
        address[] memory tokenAddresses,
        uint256[] memory amounts,
        uint256[] memory targetAllocations,
        uint256 totalValue,
        uint256 lastRebalance
    ) {
        Portfolio storage portfolio = portfolios[_user];
        require(portfolio.exists, "Portfolio does not exist");
        
        tokenAddresses = new address[](portfolio.assets.length);
        for (uint i = 0; i < portfolio.assets.length; i++) {
            tokenAddresses[i] = portfolio.assets[i].tokenAddress;
        }
        
        amounts = portfolio.amounts;
        targetAllocations = portfolio.targetAllocations;
        totalValue = portfolio.totalValue;
        lastRebalance = portfolio.lastRebalance;
    }
    
    // 获取支持的资产列表
    function getSupportedAssets() external view returns (address[] memory) {
        return supportedAssets;
    }
}