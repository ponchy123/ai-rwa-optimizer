// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SecurityManager
 * @notice 安全管理合约 - 紧急暂停、滑点保护、权限控制
 */
contract SecurityManager {
    // 紧急暂停状态
    bool public paused;
    
    // 权限控制
    mapping(address => bool) public operators;
    mapping(address => bool) public pausedContracts;
    
    // 滑点保护
    uint256 public maxSlippage; // 最大滑点（基点，1/10000）
    uint256 public constant MAX_SLIPPAGE_LIMIT = 500; // 5%最大限制
    
    // 事件
    event Paused(address account);
    event Unpaused(address account);
    event OperatorAdded(address indexed account);
    event OperatorRemoved(address indexed account);
    event SlippageUpdated(uint256 newSlippage);
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);
    
    // 管理员
    address public admin;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == admin, "Only operator");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        paused = false;
        maxSlippage = 100; // 默认1%滑点保护
    }
    
    /**
     * @notice 紧急暂停
     */
    function pause() external onlyAdmin {
        paused = true;
        emit Paused(msg.sender);
    }
    
    /**
     * @notice 取消暂停
     */
    function unpause() external onlyAdmin {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    /**
     * @notice 添加操作员
     */
    function addOperator(address _operator) external onlyAdmin {
        require(_operator != address(0), "Invalid address");
        operators[_operator] = true;
        emit OperatorAdded(_operator);
    }
    
    /**
     * @notice 移除操作员
     */
    function removeOperator(address _operator) external onlyAdmin {
        operators[_operator] = false;
        emit OperatorRemoved(_operator);
    }
    
    /**
     * @notice 设置最大滑点
     * @param _slippage 滑点（基点，1/10000）
     */
    function setMaxSlippage(uint256 _slippage) external onlyAdmin {
        require(_slippage <= MAX_SLIPPAGE_LIMIT, "Slippage too high");
        maxSlippage = _slippage;
        emit SlippageUpdated(_slippage);
    }
    
    /**
     * @notice 检查滑点保护
     * @param _expectedAmount 预期金额
     * @param _actualAmount 实际金额
     * @return isAccepted 是否接受
     */
    function checkSlippage(
        uint256 _expectedAmount,
        uint256 _actualAmount
    ) public view returns (bool isAccepted) {
        if (_expectedAmount == 0) {
            return true;
        }
        
        uint256 slippage;
        if (_actualAmount >= _expectedAmount) {
            // 正滑点，总是接受
            return true;
        } else {
            // 负滑点，计算滑点百分比
            uint256 difference = _expectedAmount - _actualAmount;
            slippage = (difference * 10000) / _expectedAmount;
        }
        
        return slippage <= maxSlippage;
    }
    
    /**
     * @notice 紧急提取代币
     * @param _token 代币地址
     * @param _to 接收地址
     * @param _amount 金额
     */
    function emergencyWithdraw(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyAdmin {
        require(paused, "Not paused");
        require(_to != address(0), "Invalid address");
        
        // 这里应该调用SafeERC20进行安全转账
        // 简化处理
        emit EmergencyWithdraw(_token, _to, _amount);
    }
    
    /**
     * @notice 暂停特定合约
     */
    function pauseContract(address _contract) external onlyAdmin {
        pausedContracts[_contract] = true;
    }
    
    /**
     * @notice 取消暂停特定合约
     */
    function unpauseContract(address _contract) external onlyAdmin {
        pausedContracts[_contract] = false;
    }
    
    /**
     * @notice 检查合约是否暂停
     */
    function isContractPaused(address _contract) external view returns (bool) {
        return pausedContracts[_contract];
    }
    
    /**
     * @notice 获取操作员列表
     */
    function getOperators() external pure returns (address[] memory) {
        // 简化处理，实际应该维护操作员列表
        return new address[](0);
    }
}