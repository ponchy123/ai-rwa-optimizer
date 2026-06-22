from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import json
from dotenv import load_dotenv
import os
import numpy as np
from datetime import datetime, timedelta
import hashlib
import secrets

load_dotenv()

app = FastAPI(title="AI-RWA Portfolio Optimizer API")
security = HTTPBearer()

# 配置
WEB3_PROVIDER = os.getenv("WEB3_PROVIDER", "https://rpc.hashkeychain.net")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")
PORTFOLIO_MANAGER_ADDRESS = os.getenv("PORTFOLIO_MANAGER_ADDRESS", "")

# 模拟数据库
users_db = {}
tokens_db = {}

# 数据模型
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class WalletLogin(BaseModel):
    wallet_address: str
    message: str
    signature: str

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

# 认证函数
def create_token(user_id: str) -> str:
    """创建认证令牌"""
    token = secrets.token_urlsafe(32)
    tokens_db[token] = {
        "user_id": user_id,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(days=7)
    }
    return token

def verify_token(token: str) -> Optional[str]:
    """验证令牌"""
    if token in tokens_db:
        token_data = tokens_db[token]
        if datetime.now() < token_data["expires_at"]:
            return token_data["user_id"]
    return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """获取当前用户"""
    token = credentials.credentials
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="无效的认证令牌")
    return user_id

# 模拟市场数据
def get_mock_market_data(token_addresses: List[str]) -> List[MarketData]:
    mock_data = []
    for i, addr in enumerate(token_addresses):
        mock_data.append(MarketData(
            token_address=addr,
            price=1000 + i * 100,
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
    if risk_level <= 3:
        allocations = [6000, 4000]
    elif risk_level <= 7:
        allocations = [5000, 5000]
    else:
        allocations = [3000, 7000]
    
    if time_horizon < 30:
        allocations = [min(allocations[0] + 1000, 10000), max(allocations[1] - 1000, 0)]
    elif time_horizon > 180:
        allocations = [max(allocations[0] - 1000, 0), min(allocations[1] + 1000, 10000)]
    
    total = sum(allocations)
    if total != 10000:
        diff = 10000 - total
        allocations[0] += diff
    
    expected_return = calculate_expected_return(allocations, market_data, time_horizon)
    risk_score = calculate_risk_score(allocations, market_data)
    
    return {
        "allocations": allocations,
        "expected_return": expected_return,
        "risk_score": risk_score,
        "confidence": 0.85,
        "reasoning": f"基于风险等级{risk_level}和{time_horizon}天投资期限生成"
    }

def calculate_expected_return(
    allocations: List[int],
    market_data: List[MarketData],
    time_horizon: int
) -> float:
    base_return = 0.05
    risk_adjustment = (allocations[1] / 10000) * 0.1
    time_adjustment = time_horizon / 365
    
    expected_annual_return = base_return + risk_adjustment
    expected_return = expected_annual_return * time_adjustment
    
    return round(expected_return * 100, 2)

def calculate_risk_score(allocations: List[int], market_data: List[MarketData]) -> float:
    base_risk = 30
    high_risk_ratio = allocations[1] / 10000 if len(allocations) > 1 else 0
    risk_from_allocation = high_risk_ratio * 40
    volatility_risk = 20
    
    total_risk = base_risk + risk_from_allocation + volatility_risk
    return min(max(total_risk, 0), 100)

# API端点
@app.get("/")
def read_root():
    return {"message": "AI-RWA Portfolio Optimizer API"}

# 认证API
@app.post("/api/auth/register")
async def register(user: UserCreate):
    """用户注册"""
    # 检查用户名是否已存在
    for u in users_db.values():
        if u["username"] == user.username:
            raise HTTPException(status_code=400, detail="用户名已存在")
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="邮箱已存在")
    
    # 创建用户
    user_id = hashlib.sha256(user.username.encode()).hexdigest()[:16]
    users_db[user_id] = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "password": hashlib.sha256(user.password.encode()).hexdigest(),
        "wallet_address": None,
        "created_at": datetime.now().isoformat()
    }
    
    # 创建令牌
    token = create_token(user_id)
    
    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user_id,
            "username": user.username,
            "email": user.email,
            "wallet_address": None
        }
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    """用户登录"""
    for user_id, user_data in users_db.items():
        if user_data["username"] == credentials.username:
            if user_data["password"] == hashlib.sha256(credentials.password.encode()).hexdigest():
                token = create_token(user_id)
                return {
                    "status": "success",
                    "token": token,
                    "user": {
                        "id": user_id,
                        "username": user_data["username"],
                        "email": user_data["email"],
                        "wallet_address": user_data["wallet_address"]
                    }
                }
    
    raise HTTPException(status_code=401, detail="用户名或密码错误")

@app.post("/api/auth/login/wallet")
async def login_with_wallet(wallet_data: WalletLogin):
    """钱包登录"""
    # 在实际应用中，这里应该验证签名
    # 简化处理：直接使用钱包地址作为用户ID
    
    wallet_address = wallet_data.wallet_address.lower()
    
    # 查找或创建用户
    user_id = None
    for uid, user_data in users_db.items():
        if user_data.get("wallet_address") == wallet_address:
            user_id = uid
            break
    
    if not user_id:
        # 创建新用户
        user_id = hashlib.sha256(wallet_address.encode()).hexdigest()[:16]
        users_db[user_id] = {
            "id": user_id,
            "username": f"user_{wallet_address[:8]}",
            "email": None,
            "password": None,
            "wallet_address": wallet_address,
            "created_at": datetime.now().isoformat()
        }
    
    # 创建令牌
    token = create_token(user_id)
    
    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user_id,
            "username": users_db[user_id]["username"],
            "email": users_db[user_id]["email"],
            "wallet_address": wallet_address
        }
    }

@app.get("/api/auth/profile")
async def get_profile(current_user: str = Depends(get_current_user)):
    """获取用户资料"""
    if current_user not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    user_data = users_db[current_user]
    return {
        "status": "success",
        "user": {
            "id": current_user,
            "username": user_data["username"],
            "email": user_data["email"],
            "wallet_address": user_data["wallet_address"],
            "created_at": user_data["created_at"]
        }
    }

@app.put("/api/auth/profile")
async def update_profile(updates: dict, current_user: str = Depends(get_current_user)):
    """更新用户资料"""
    if current_user not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    user_data = users_db[current_user]
    
    # 更新允许的字段
    allowed_fields = ["username", "email", "wallet_address"]
    for field in allowed_fields:
        if field in updates:
            user_data[field] = updates[field]
    
    return {
        "status": "success",
        "user": {
            "id": current_user,
            "username": user_data["username"],
            "email": user_data["email"],
            "wallet_address": user_data["wallet_address"]
        }
    }

# 投资组合API
@app.post("/api/portfolio/create")
async def create_portfolio(portfolio: PortfolioCreate, current_user: str = Depends(get_current_user)):
    """创建投资组合"""
    try:
        if len(portfolio.token_addresses) != len(portfolio.initial_amounts):
            raise HTTPException(status_code=400, detail="Token addresses and amounts length mismatch")
        
        if len(portfolio.token_addresses) != len(portfolio.target_allocations):
            raise HTTPException(status_code=400, detail="Token addresses and allocations length mismatch")
        
        total_allocation = sum(portfolio.target_allocations)
        if total_allocation != 10000:
            raise HTTPException(status_code=400, detail="Total allocation must be 10000")
        
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
async def rebalance_portfolio(request: RebalanceRequest, current_user: str = Depends(get_current_user)):
    """重新平衡投资组合"""
    try:
        return {
            "status": "success",
            "message": "Portfolio rebalance initiated",
            "user_address": request.user_address,
            "new_amounts": request.new_amounts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/strategy")
async def generate_strategy(request: StrategyRequest, current_user: str = Depends(get_current_user)):
    """生成AI投资策略"""
    try:
        mock_tokens = ["0x1234567890123456789012345678901234567890", "0x2345678901234567890123456789012345678901"]
        market_data = get_mock_market_data(mock_tokens)
        
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
async def get_market_data(token_addresses: List[str], current_user: str = Depends(get_current_user)):
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
async def get_portfolio(user_address: str, current_user: str = Depends(get_current_user)):
    """获取用户投资组合"""
    try:
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