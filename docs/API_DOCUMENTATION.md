# AI-RWA Portfolio Optimizer API 文档

## 概述

AI-RWA Portfolio Optimizer 是一个AI驱动的RWA智能投资组合优化器，为HSK Chain Horizon Hackathon参赛项目。

## 基础信息

- **Base URL**: `http://localhost:8000`
- **API版本**: v1
- **认证方式**: JWT Bearer Token

## 认证API

### 用户注册

**POST** `/api/auth/register`

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "status": "success",
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "wallet_address": null
  }
}
```

### 用户登录

**POST** `/api/auth/login`

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "status": "success",
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "wallet_address": "string"
  }
}
```

### 钱包登录

**POST** `/api/auth/login/wallet`

**请求体**:
```json
{
  "wallet_address": "0x...",
  "message": "string",
  "signature": "string"
}
```

**响应**:
```json
{
  "status": "success",
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "wallet_address": "0x..."
  }
}
```

### 获取用户资料

**GET** `/api/auth/profile`

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "status": "success",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "wallet_address": "0x...",
    "created_at": "2026-01-01T00:00:00"
  }
}
```

### 更新用户资料

**PUT** `/api/auth/profile`

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "wallet_address": "0x..."
}
```

**响应**:
```json
{
  "status": "success",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "wallet_address": "0x..."
  }
}
```

## 投资组合API

### 创建投资组合

**POST** `/api/portfolio/create`

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "token_addresses": ["0x...", "0x..."],
  "initial_amounts": [1000000, 2000000],
  "target_allocations": [5000, 5000]
}
```

**响应**:
```json
{
  "status": "success",
  "message": "Portfolio creation initiated",
  "portfolio": {
    "token_addresses": ["0x...", "0x..."],
    "initial_amounts": [1000000, 2000000],
    "target_allocations": [5000, 5000]
  }
}
```

### 重新平衡投资组合

**POST** `/api/portfolio/rebalance`

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "user_address": "0x...",
  "new_amounts": [1500000, 1500000]
}
```

**响应**:
```json
{
  "status": "success",
  "message": "Portfolio rebalance initiated",
  "user_address": "0x...",
  "new_amounts": [1500000, 1500000]
}
```

### 获取用户投资组合

**GET** `/api/portfolio/{user_address}`

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "status": "success",
  "portfolio": {
    "user": "0x...",
    "token_addresses": ["0x..."],
    "amounts": [1000000000000000000],
    "target_allocations": [10000],
    "total_value": 1000000000000000000,
    "last_rebalance": 1672531200
  }
}
```

## AI策略API

### 生成AI投资策略

**POST** `/api/ai/strategy`

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "user_address": "0x...",
  "risk_level": 5,
  "time_horizon": 90,
  "target_return": 10.0
}
```

**响应**:
```json
{
  "status": "success",
  "strategy": {
    "allocations": [6000, 4000],
    "expected_return": 8.5,
    "risk_score": 45,
    "confidence": 0.85,
    "reasoning": "基于风险等级5和90天投资期限生成"
  },
  "market_data": [
    {
      "token_address": "0x...",
      "price": 1000.0,
      "volume_24h": 1000000.0,
      "price_change_24h": 2.5
    }
  ]
}
```

## 市场数据API

### 获取市场数据

**GET** `/api/market/data`

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
- `token_addresses`: 代币地址列表（逗号分隔）

**响应**:
```json
{
  "status": "success",
  "data": [
    {
      "token_address": "0x...",
      "price": 1000.0,
      "volume_24h": 1000000.0,
      "price_change_24h": 2.5
    }
  ]
}
```

## 错误响应

### 400 Bad Request
```json
{
  "detail": "错误信息"
}
```

### 401 Unauthorized
```json
{
  "detail": "无效的认证令牌"
}
```

### 404 Not Found
```json
{
  "detail": "资源不存在"
}
```

### 500 Internal Server Error
```json
{
  "detail": "服务器内部错误"
}
```

## 使用示例

### cURL示例

**注册用户**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

**登录**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

**获取投资组合**:
```bash
curl -X GET http://localhost:8000/api/portfolio/0x1234... \
  -H "Authorization: Bearer <token>"
```

**生成AI策略**:
```bash
curl -X POST http://localhost:8000/api/ai/strategy \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"user_address": "0x1234...", "risk_level": 5, "time_horizon": 90, "target_return": 10.0}'
```

## 注意事项

1. 所有需要认证的API都需要在请求头中包含 `Authorization: Bearer <token>`
2. 令牌有效期为7天
3. 钱包登录时，签名验证在开发模式下被跳过
4. 市场数据目前使用模拟数据