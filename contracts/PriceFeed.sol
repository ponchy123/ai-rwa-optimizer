// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title PriceFeed
 * @notice Chainlink价格预言机集成合约
 * @dev 提供真实世界资产的价格数据
 */
contract PriceFeed {
    struct PriceData {
        address feedAddress;
        string name;
        uint8 decimals;
        bool isActive;
    }
    
    mapping(address => PriceData) public priceFeeds;
    address[] public supportedFeeds;
    mapping(address => bool) public isSupportedFeed;
    
    // 事件
    event PriceFeedAdded(address indexed feedAddress, string name, uint8 decimals);
    event PriceFeedUpdated(address indexed feedAddress, bool isActive);
    event PriceDataRequested(address indexed feedAddress, uint256 price, uint256 timestamp);
    
    // 管理员
    address public admin;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @notice 添加价格预言机
     * @param _feedAddress Chainlink价格预言机地址
     * @param _name 资产名称
     * @param _decimals 价格精度
     */
    function addPriceFeed(
        address _feedAddress,
        string memory _name,
        uint8 _decimals
    ) external onlyAdmin {
        require(!isSupportedFeed[_feedAddress], "Feed already supported");
        
        priceFeeds[_feedAddress] = PriceData({
            feedAddress: _feedAddress,
            name: _name,
            decimals: _decimals,
            isActive: true
        });
        
        supportedFeeds.push(_feedAddress);
        isSupportedFeed[_feedAddress] = true;
        
        emit PriceFeedAdded(_feedAddress, _name, _decimals);
    }
    
    /**
     * @notice 获取最新价格
     * @param _feedAddress 价格预言机地址
     * @return price 最新价格
     * @return timestamp 价格时间戳
     */
    function getLatestPrice(address _feedAddress) external view returns (
        uint256 price,
        uint256 timestamp
    ) {
        require(isSupportedFeed[_feedAddress], "Feed not supported");
        require(priceFeeds[_feedAddress].isActive, "Feed not active");
        
        AggregatorV3Interface feed = AggregatorV3Interface(_feedAddress);
        
        (
            ,
            ,
            price,
            ,
            timestamp
        ) = feed.latestRoundData();
        
        // 验证价格有效性
        require(price > 0, "Invalid price");
        require(timestamp > 0, "Invalid timestamp");
        
        return (price, timestamp);
    }
    
    /**
     * @notice 获取多个资产的价格
     * @param _feedAddresses 价格预言机地址数组
     * @return prices 价格数组
     * @return timestamps 时间戳数组
     */
    function getMultiplePrices(address[] memory _feedAddresses) external view returns (
        uint256[] memory prices,
        uint256[] memory timestamps
    ) {
        prices = new uint256[](_feedAddresses.length);
        timestamps = new uint256[](_feedAddresses.length);
        
        for (uint i = 0; i < _feedAddresses.length; i++) {
            if (isSupportedFeed[_feedAddresses[i]] && priceFeeds[_feedAddresses[i]].isActive) {
                AggregatorV3Interface feed = AggregatorV3Interface(_feedAddresses[i]);
                
                (
                    ,
                    ,
                    prices[i],
                    ,
                    timestamps[i]
                ) = feed.latestRoundData();
            } else {
                prices[i] = 0;
                timestamps[i] = 0;
            }
        }
        
        return (prices, timestamps);
    }
    
    /**
     * @notice 检查价格是否过期
     * @param _feedAddress 价格预言机地址
     * @param _maxAge 最大有效期（秒）
     * @return isFresh 价格是否新鲜
     */
    function isPriceFresh(address _feedAddress, uint256 _maxAge) external view returns (bool isFresh) {
        if (!isSupportedFeed[_feedAddress] || !priceFeeds[_feedAddress].isActive) {
            return false;
        }
        
        AggregatorV3Interface feed = AggregatorV3Interface(_feedAddress);
        
        (
            ,
            ,
            ,
            ,
            uint256 timestamp
        ) = feed.latestRoundData();
        
        return (block.timestamp - timestamp) <= _maxAge;
    }
    
    /**
     * @notice 激活/停用价格预言机
     * @param _feedAddress 价格预言机地址
     * @param _isActive 是否激活
     */
    function togglePriceFeed(address _feedAddress, bool _isActive) external onlyAdmin {
        require(isSupportedFeed[_feedAddress], "Feed not supported");
        
        priceFeeds[_feedAddress].isActive = _isActive;
        
        emit PriceFeedUpdated(_feedAddress, _isActive);
    }
    
    /**
     * @notice 获取支持的预言机列表
     * @return feeds 预言机地址数组
     */
    function getSupportedFeeds() external view returns (address[] memory) {
        return supportedFeeds;
    }
    
    /**
     * @notice 获取预言机信息
     * @param _feedAddress 价格预言机地址
     * @return name 资产名称
     * @return decimals 价格精度
     * @return isActive 是否激活
     */
    function getFeedInfo(address _feedAddress) external view returns (
        string memory name,
        uint8 decimals,
        bool isActive
    ) {
        require(isSupportedFeed[_feedAddress], "Feed not supported");
        
        PriceData storage feedData = priceFeeds[_feedAddress];
        return (feedData.name, feedData.decimals, feedData.isActive);
    }
}