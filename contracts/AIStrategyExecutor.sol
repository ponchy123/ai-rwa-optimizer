// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PortfolioManager.sol";

contract AIStrategyExecutor {
    PortfolioManager public portfolioManager;
    
    struct Strategy {
        address user;
        bytes32 strategyHash; // AI策略的哈希
        uint256 riskLevel; // 风险等级 1-10
        uint256 targetReturn; // 目标收益率（基点）
        uint256 executionTime; // 执行时间
        bool executed; // 是否已执行
        bool valid; // 策略是否有效
    }
    
    struct StrategyParams {
        uint256[] allocations; // 资产配置比例
        uint256 riskTolerance; // 风险承受能力
        uint256 timeHorizon; // 投资时间范围（天）
        uint256 minReturn; // 最小期望收益
    }
    
    mapping(bytes32 => Strategy) public strategies;
    mapping(address => bytes32[]) public userStrategies;
    
    // 事件
    event StrategySubmitted(
        address indexed user,
        bytes32 strategyHash,
        uint256 riskLevel,
        uint256 targetReturn
    );
    event StrategyExecuted(
        address indexed user,
        bytes32 strategyHash,
        uint256 executionTime
    );
    
    // 管理员
    address public admin;
    // AI服务地址（可以是链下服务或另一个合约）
    address public aiService;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyAIService() {
        require(msg.sender == aiService, "Only AI service");
        _;
    }
    
    constructor(address _portfolioManager) {
        admin = msg.sender;
        portfolioManager = PortfolioManager(_portfolioManager);
    }
    
    // 设置AI服务地址
    function setAIService(address _aiService) external onlyAdmin {
        aiService = _aiService;
    }
    
    // 提交AI策略
    function submitStrategy(
        bytes32 _strategyHash,
        uint256 _riskLevel,
        uint256 _targetReturn
    ) external {
        require(_riskLevel >= 1 && _riskLevel <= 10, "Invalid risk level");
        require(_targetReturn > 0 && _targetReturn <= 10000, "Invalid target return");
        
        Strategy storage strategy = strategies[_strategyHash];
        require(!strategy.valid, "Strategy already exists");
        
        strategy.user = msg.sender;
        strategy.strategyHash = _strategyHash;
        strategy.riskLevel = _riskLevel;
        strategy.targetReturn = _targetReturn;
        strategy.executionTime = 0;
        strategy.executed = false;
        strategy.valid = true;
        
        userStrategies[msg.sender].push(_strategyHash);
        
        emit StrategySubmitted(msg.sender, _strategyHash, _riskLevel, _targetReturn);
    }
    
    // 执行AI策略
    function executeStrategy(
        bytes32 _strategyHash,
        uint256[] memory _allocations
    ) external {
        Strategy storage strategy = strategies[_strategyHash];
        require(strategy.valid, "Strategy does not exist");
        require(!strategy.executed, "Strategy already executed");
        require(strategy.user == msg.sender, "Not strategy owner");
        
        // 验证配置比例
        uint256 totalAllocation = 0;
        for (uint i = 0; i < _allocations.length; i++) {
            totalAllocation += _allocations[i];
        }
        require(totalAllocation == 10000, "Total allocation must be 10000");
        
        // 获取用户投资组合
        (
            address[] memory tokenAddresses,
            ,
            ,
            uint256 totalValue,
            
        ) = portfolioManager.getPortfolio(msg.sender);
        
        require(_allocations.length == tokenAddresses.length, "Allocation length mismatch");
        
        // 计算新的资产配置
        uint256[] memory newAmounts = new uint256[](tokenAddresses.length);
        for (uint i = 0; i < tokenAddresses.length; i++) {
            newAmounts[i] = (totalValue * _allocations[i]) / 10000;
        }
        
        // 执行再平衡
        portfolioManager.rebalance(newAmounts);
        
        // 更新策略状态
        strategy.executed = true;
        strategy.executionTime = block.timestamp;
        
        emit StrategyExecuted(msg.sender, _strategyHash, block.timestamp);
    }
    
    // 获取用户的策略列表
    function getUserStrategies(address _user) external view returns (bytes32[] memory) {
        return userStrategies[_user];
    }
    
    // 获取策略详情
    function getStrategy(bytes32 _strategyHash) external view returns (
        address user,
        uint256 riskLevel,
        uint256 targetReturn,
        uint256 executionTime,
        bool executed,
        bool valid
    ) {
        Strategy storage strategy = strategies[_strategyHash];
        require(strategy.valid, "Strategy does not exist");
        
        return (
            strategy.user,
            strategy.riskLevel,
            strategy.targetReturn,
            strategy.executionTime,
            strategy.executed,
            strategy.valid
        );
    }
    
    // AI服务更新策略参数（链下AI调用）
    function updateStrategyParams(
        bytes32 _strategyHash,
        uint256 _riskLevel,
        uint256 _targetReturn
    ) external onlyAIService {
        Strategy storage strategy = strategies[_strategyHash];
        require(strategy.valid, "Strategy does not exist");
        require(!strategy.executed, "Strategy already executed");
        
        strategy.riskLevel = _riskLevel;
        strategy.targetReturn = _targetReturn;
    }
}