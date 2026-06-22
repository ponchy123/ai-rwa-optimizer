// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AutoPayment is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct Payment {
        address payer;
        address payee;
        address token;
        uint256 amount;
        uint256 frequency; // 支付频率（秒）
        uint256 lastPayment; // 上次支付时间
        uint256 nextPayment; // 下次支付时间
        bool active; // 是否激活
        bool exists;
    }
    
    mapping(bytes32 => Payment) public payments;
    mapping(address => bytes32[]) public userPayments;
    
    // 事件
    event PaymentCreated(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 frequency
    );
    event PaymentExecuted(
        bytes32 indexed paymentId,
        uint256 executionTime,
        uint256 amount
    );
    event PaymentCancelled(bytes32 indexed paymentId);
    
    // 管理员
    address public admin;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    // 创建自动支付
    function createPayment(
        address _payee,
        address _token,
        uint256 _amount,
        uint256 _frequency
    ) external nonReentrant returns (bytes32) {
        require(_payee != address(0), "Invalid payee");
        require(_token != address(0), "Invalid token");
        require(_amount > 0, "Amount must be > 0");
        require(_frequency >= 1 hours, "Frequency must be >= 1 hour");
        
        // 生成支付ID
        bytes32 paymentId = keccak256(abi.encodePacked(
            msg.sender,
            _payee,
            _token,
            _amount,
            _frequency,
            block.timestamp
        ));
        
        require(!payments[paymentId].exists, "Payment already exists");
        
        // 创建支付
        Payment storage payment = payments[paymentId];
        payment.payer = msg.sender;
        payment.payee = _payee;
        payment.token = _token;
        payment.amount = _amount;
        payment.frequency = _frequency;
        payment.lastPayment = block.timestamp;
        payment.nextPayment = block.timestamp + _frequency;
        payment.active = true;
        payment.exists = true;
        
        userPayments[msg.sender].push(paymentId);
        
        emit PaymentCreated(paymentId, msg.sender, _payee, _amount, _frequency);
        
        return paymentId;
    }
    
    // 执行支付
    function executePayment(bytes32 _paymentId) external nonReentrant {
        Payment storage payment = payments[_paymentId];
        require(payment.exists, "Payment does not exist");
        require(payment.active, "Payment is not active");
        require(block.timestamp >= payment.nextPayment, "Too early for payment");
        
        // 转账
        IERC20(payment.token).safeTransferFrom(
            payment.payer,
            payment.payee,
            payment.amount
        );
        
        // 更新支付状态
        payment.lastPayment = block.timestamp;
        payment.nextPayment = block.timestamp + payment.frequency;
        
        emit PaymentExecuted(_paymentId, block.timestamp, payment.amount);
    }
    
    // 取消支付
    function cancelPayment(bytes32 _paymentId) external {
        Payment storage payment = payments[_paymentId];
        require(payment.exists, "Payment does not exist");
        require(payment.payer == msg.sender, "Not payment payer");
        
        payment.active = false;
        
        emit PaymentCancelled(_paymentId);
    }
    
    // 获取用户的支付列表
    function getUserPayments(address _user) external view returns (bytes32[] memory) {
        return userPayments[_user];
    }
    
    // 获取支付详情
    function getPayment(bytes32 _paymentId) external view returns (
        address payer,
        address payee,
        address token,
        uint256 amount,
        uint256 frequency,
        uint256 lastPayment,
        uint256 nextPayment,
        bool active
    ) {
        Payment storage payment = payments[_paymentId];
        require(payment.exists, "Payment does not exist");
        
        return (
            payment.payer,
            payment.payee,
            payment.token,
            payment.amount,
            payment.frequency,
            payment.lastPayment,
            payment.nextPayment,
            payment.active
        );
    }
    
    // 获取待执行的支付列表
    function getPendingPayments() external pure returns (bytes32[] memory) {
        // 这里简化处理，实际应该遍历所有支付
        // 返回空数组，实际实现需要更复杂的逻辑
        return new bytes32[](0);
    }
    
    // 批量执行支付
    function batchExecutePayments(bytes32[] memory _paymentIds) external nonReentrant {
        for (uint i = 0; i < _paymentIds.length; i++) {
            Payment storage payment = payments[_paymentIds[i]];
            if (payment.exists && payment.active && block.timestamp >= payment.nextPayment) {
                IERC20(payment.token).safeTransferFrom(
                    payment.payer,
                    payment.payee,
                    payment.amount
                );
                
                payment.lastPayment = block.timestamp;
                payment.nextPayment = block.timestamp + payment.frequency;
                
                emit PaymentExecuted(_paymentIds[i], block.timestamp, payment.amount);
            }
        }
    }
}