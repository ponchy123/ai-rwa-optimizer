from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from dotenv import load_dotenv
import os
import numpy as np
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI(title="AI-RWA Portfolio Optimizer API")

# 配置
WEB3_PROVIDER = os.getenv("WEB3_PROVIDER", "https://rpc.hashkeychain.net")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")
PORTFOLIO_MANAGER_ADDRESS = os.getenv("PORTFOLIO_MANAGER_ADDRESS", "")

# 数据模型
class PortfolioCreate(BaseModel):
    token_addresses: List[str]
    initial_amounts: List[int]
    target_allocations: List[int]

class RebalanceRequest(BaseModel):
    user_address: str
    new_amounts: List[int]

class StrategyRequest(BaseModel):
    user_address: str
    risk_level: int  # 1-10
    time_horizon: int  # 天数
    target_return: float  # 目标收益率

class MarketData(BaseModel):
    token_address: str
    price: float
    volume_24h: float
    price_change_24h: float

# 模拟市场数据（实际应该从Oracle获取）
def get_mock_market_data(token_addresses: List[str]) -> List[MarketData]:
    mock_data = []
    for i, addr in enumerate(token_addresses):
        mock_data.append(MarketData(
            token_address=addr,
            price=1000 + i * 100,  # 模拟价格
            volume_24h=1000000 + i * 100000,
            price_change_24h=np.random.uniform(-5, 5)
        ))
    return mock_data

# AI策略生成
def generate_ai_strategy(
    risk_level: int,
    time_horizon: int,
    target_return: float,
    market_data: List[MarketData]
) -> dict:
    """
    AI策略生成逻辑
    根据风险偏好、时间范围和目标收益生成资产配置建议
    """
    # 简化的AI逻辑
    # 实际应该使用机器学习模型
    
    # 根据风险等级调整配置
    if risk_level <= 3:  # 低风险
        # 偏向稳定资产
        allocations = [6000, 4000]  # 60% 稳定币, 40% 其他
    elif risk_level <= 7:  # 中风险
        # 平衡配置
        allocations = [5000, 5000]
    else:  # 高风险
        # 偏向高收益资产
        allocations = [3000, 7000]
    
    # 根据时间范围调整
    if time_horizon < 30:  # 短期
        # 更保守
        allocations = [min(allocations[0] + 1000, 10000), max(allocations[1] - 1000, 0)]
    elif time_horizon > 180:  # 长期
        # 更激进
        allocations = [max(allocations[0] - 1000, 0), min(allocations[1] + 1000, 10000)]
    
    # 确保总和为10000
    total = sum(allocations)
    if total != 10000:
        diff = 10000 - total
        allocations[0] += diff
    
    # 计算预期收益
    expected_return = calculate_expected_return(allocations, market_data, time_horizon)
    
    # 计算风险指标
    risk_score = calculate_risk_score(allocations, market_data)
    
    return {
        "allocations": allocations,
        "expected_return": expected_return,
        "risk_score": risk_score,
        "confidence": 0.85,  # 模拟置信度
        "reasoning": f"基于风险等级{risk_level}和{time_horizon}天投资期限生成"
    }

def calculate_expected_return(
    allocations: List[int],
    market_data: List[MarketData],
    time_horizon: int
) -> float:
    """计算预期收益"""
    # 简化计算
    base_return = 0.05  # 基础年化收益5%
    
    # 根据配置调整
    risk_adjustment = (allocations[1] / 10000) * 0.1  # 高风险资产比例影响
    
    # 时间调整
    time_adjustment = time_horizon / 365
    
    expected_annual_return = base_return + risk_adjustment
    expected_return = expected_annual_return * time_adjustment
    
    return round(expected_return * 100, 2)  # 转换为百分比

def calculate_risk_score(allocations: List[int], market_data: List[MarketData]) -> float:
    """计算风险评分 (0-100)"""
    # 基础风险
    base_risk = 30
    
    # 高风险资产比例
    high_risk_ratio = allocations[1] / 10000 if len(allocations) > 1 else 0
    risk_from_allocation = high_risk_ratio * 40
    
    # 市场波动性（模拟）
    volatility_risk = 20
    
    total_risk = base_risk + risk_from_allocation + volatility_risk
    
    return min(max(total_risk, 0), 100)

# API端点
@app.get("/")
def read_root():
    return {"message": "AI-RWA Portfolio Optimizer API"}

@app.post("/api/portfolio/create")
async def create_portfolio(portfolio: PortfolioCreate):
    """创建投资组合"""
    try:
        # 验证输入
        if len(portfolio.token_addresses) != len(portfolio.initial_amounts):
            raise HTTPException(status_code=400, detail="Token addresses and amounts length mismatch")
        
        if len(portfolio.token_addresses) != len(portfolio.target_allocations):
            raise HTTPException(status_code=400, detail="Token addresses and allocations length mismatch")
        
        # 验证配置总和
        total_allocation = sum(portfolio.target_allocations)
        if total_allocation != 10000:
            raise HTTPException(status_code=400, detail="Total allocation must be 10000")
        
        # 这里应该调用智能合约
        # 实际实现需要签名和发送交易
        
        return {
            "status": "success",
            "message": "Portfolio creation initiated",
            "portfolio": {
                "token_addresses": portfolio.token_addresses,
                "initial_amounts": portfolio.initial_amounts,
                "target_allocations": portfolio.target_allocations
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/rebalance")
async def rebalance_portfolio(request: RebalanceRequest):
    """重新平衡投资组合"""
    try:
        # 这里应该调用智能合约
        return {
            "status": "success",
            "message": "Portfolio rebalance initiated",
            "user_address": request.user_address,
            "new_amounts": request.new_amounts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/strategy")
async def generate_strategy(request: StrategyRequest):
    """生成AI投资策略"""
    try:
        # 获取市场数据（模拟）
        mock_tokens = ["0x1234567890123456789012345678901234567890", "0x2345678901234567890123456789012345678901"]
        market_data = get_mock_market_data(mock_tokens)
        
        # 生成策略
        strategy = generate_ai_strategy(
            risk_level=request.risk_level,
            time_horizon=request.time_horizon,
            target_return=request.target_return,
            market_data=market_data
        )
        
        return {
            "status": "success",
            "strategy": strategy,
            "market_data": [data.dict() for data in market_data]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/data")
async def get_market_data(token_addresses: List[str]):
    """获取市场数据"""
    try:
        market_data = get_mock_market_data(token_addresses)
        return {
            "status": "success",
            "data": [data.dict() for data in market_data]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/{user_address}")
async def get_portfolio(user_address: str):
    """获取用户投资组合"""
    try:
        # 这里应该从智能合约获取数据
        # 模拟返回数据
        return {
            "status": "success",
            "portfolio": {
                "user": user_address,
                "token_addresses": ["0x1234567890123456789012345678901234567890"],
                "amounts": [1000000000000000000],
                "target_allocations": [10000],
                "total_value": 1000000000000000000,
                "last_rebalance": int(datetime.now().timestamp())
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)