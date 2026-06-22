# AI-RWA Portfolio Optimizer

AI驱动的RWA智能投资组合优化器 - HSK Chain Horizon Hackathon参赛项目

## 项目概述

这是一个结合AI和DeFi的创新平台，帮助用户轻松配置和管理包含真实世界资产（RWA）的智能投资组合。

### 核心特性

- **AI驱动策略生成** - 根据风险偏好自动生成最优资产配置
- **RWA资产支持** - 支持代币化的黄金、房地产、股票
- **自动再平衡** - AI根据市场变化自动调整配置
- **安全可靠** - 多层安全机制保护用户资产

## 技术架构

```
┌─────────────────────────────────────────────────┐
│                  用户界面 (React)                │
├─────────────────────────────────────────────────┤
│                AI决策引擎 (FastAPI)              │
├─────────────────────────────────────────────────┤
│              智能合约层 (HSK Chain)              │
│  PortfolioManager │ AIStrategyExecutor │ AutoPay │
├─────────────────────────────────────────────────┤
│              数据层 (Chainlink Oracle)           │
└─────────────────────────────────────────────────┘
```

## 快速开始

### 1. 安装依赖

```bash
# 智能合约
npm install

# 前端
cd frontend && npm install

# AI后端
cd ai-backend && pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入你的配置
```

### 3. 编译和测试

```bash
npx hardhat compile
npx hardhat test
```

### 4. 启动服务

```bash
# AI后端
cd ai-backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# 前端
cd frontend
npm start
```

### 5. 部署合约

```bash
npx hardhat run scripts/deploy-all.js --network hskTestnet
```

## API文档

启动AI后端后访问: http://localhost:8000/docs

### 主要端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/login/wallet` | POST | 钱包登录 |
| `/api/portfolio/create` | POST | 创建投资组合 |
| `/api/portfolio/rebalance` | POST | 再平衡 |
| `/api/ai/strategy` | POST | AI策略生成 |
| `/api/market/data` | GET | 市场数据 |

## 智能合约

- **PortfolioManagerV2** - 投资组合管理
- **AIStrategyExecutor** - AI策略执行
- **AutoPayment** - 自动支付
- **SecurityManager** - 安全管理
- **PriceFeed** - Chainlink价格预言机

## 项目结构

```
ai-rwa-optimizer/
├── contracts/          # 智能合约
├── test/               # 测试
├── scripts/            # 部署脚本
├── ai-backend/         # AI后端
├── frontend/           # React前端
├── docs/               # 文档
└── demo/               # 演示
```

## 获奖优势

1. **创新性** - AI+RWA的独特结合
2. **技术深度** - 完整的智能合约架构
3. **实用性** - 解决真实用户痛点
4. **安全性** - 多层安全机制

## 联系方式

- GitHub: [项目仓库]
- 邮箱: [联系邮箱]

## 许可证

MIT License