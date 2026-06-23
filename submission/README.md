# AI-RWA Portfolio Optimizer

## 比赛信息

- **比赛**: HSK Chain Horizon Hackathon · Japan
- **赛道**: DeFi + AI
- **奖金池**: 12,000 USDT
- **截止日期**: 2026年7月11日

## 项目简介

AI-RWA Portfolio Optimizer 是一个AI驱动的RWA智能投资组合优化器，帮助用户轻松配置和管理包含真实世界资产（RWA）的智能投资组合。

## 核心功能

1. **智能投资组合创建** - 支持多种RWA资产配置
2. **AI策略生成** - 根据风险偏好自动生成最优策略
3. **自动再平衡** - 根据AI建议自动调整配置
4. **自动支付** - 定期收益分配

## 技术亮点

- **AI+RWA创新结合** - 市场上首个AI驱动的RWA管理平台
- **Chainlink Oracle集成** - 真实价格数据
- **多层安全机制** - 紧急暂停、滑点保护、权限控制
- **完整测试覆盖** - 29个单元测试

## 部署信息

### HSK Chain Testnet

| 合约 | 地址 |
|------|------|
| SecurityManager | `0xF90C5A09403f4657bbED96158A0C50D0Ab911006` |
| PriceFeed | `0x396e354d0d8E3e167f81d4d3b9d541FdAda68218` |
| PortfolioManagerV2 | `0xa38C83f0570d811666C7F7b1aA0a9949D7A49705` |
| AIStrategyExecutor | `0x721C166D3B12E162015eC84906deA98DcBdeE653` |
| AutoPayment | `0xd9Cb22B1748c36CeD59cBdcD5886b5bac3404B2D` |

### 代币合约

| 代币 | 地址 |
|------|------|
| xAU (代币化黄金) | `0x61a8a2B7E528f2cAC46d9A13c788C10fa623efcE` |
| xRE (代币化房地产) | `0x77Ed35e38E80Dc2C04076B9a50663Cc2311b4284` |
| xST (代币化股票) | `0x896447D80358805199d14CCf20bC68f8a81a8C21` |

## 项目结构

```
ai-rwa-optimizer/
├── contracts/          # 8个智能合约
├── test/               # 29个单元测试
├── ai-backend/         # FastAPI后端
├── frontend/           # React前端
├── demo/               # 演示视频和材料
├── docs/               # 文档
└── scripts/            # 部署脚本
```

## 快速启动

```bash
# 1. 安装依赖
npm install
cd frontend && npm install
cd ai-backend && pip install -r requirements.txt

# 2. 启动服务
# AI后端
cd ai-backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000

# 前端
cd frontend && npm start

# 3. 查看Demo视频
# demo/ai-rwa-demo-final.mp4
```

## 获奖优势

1. **创新性** - AI+RWA的独特结合
2. **技术深度** - 完整的智能合约架构
3. **实用性** - 解决真实用户痛点
4. **安全性** - 多层安全机制
5. **市场潜力** - 巨大的RWA市场机会

## 联系方式

- GitHub: https://github.com/ponchy123/ai-rwa-optimizer
- 区块浏览器: https://testnet-explorer.hsk.xyz