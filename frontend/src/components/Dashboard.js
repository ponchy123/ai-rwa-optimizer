import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import './Dashboard.css';

function Dashboard() {
  const { account, web3, getBalance } = useWeb3();
  const [portfolioData, setPortfolioData] = useState(null);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (account && web3) {
        try {
          // 获取余额
          const userBalance = await getBalance();
          setBalance(userBalance);
          
          // 模拟获取投资组合数据
          const mockData = {
            totalValue: 125000.50,
            dailyChange: 2.35,
            weeklyChange: 5.67,
            assets: [
              { name: '代币化黄金', symbol: 'xAU', amount: 50000, allocation: 40 },
              { name: '代币化房地产', symbol: 'xRE', amount: 37500, allocation: 30 },
              { name: '代币化股票', symbol: 'xST', amount: 25000, allocation: 20 },
              { name: '稳定币', symbol: 'USDT', amount: 12500, allocation: 10 }
            ],
            riskScore: 45,
            aiConfidence: 87
          };
          
          setPortfolioData(mockData);
        } catch (error) {
          console.error('获取数据失败:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [account, web3, getBalance]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="dashboard">
        <div className="connect-prompt">
          <h2>欢迎使用 AI-RWA Portfolio Optimizer</h2>
          <p>请连接钱包以查看您的投资组合</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>投资组合概览</h2>
        <div className="header-info">
          <p className="last-update">最后更新: {new Date().toLocaleString()}</p>
          <p className="wallet-balance">钱包余额: {parseFloat(balance).toFixed(4)} ETH</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">${portfolioData?.totalValue.toLocaleString() || '0'}</div>
          <div className="stat-label">总投资价值</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value positive">+{portfolioData?.dailyChange || 0}%</div>
          <div className="stat-label">24小时收益</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value positive">+{portfolioData?.weeklyChange || 0}%</div>
          <div className="stat-label">7天收益</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">{portfolioData?.aiConfidence || 0}%</div>
          <div className="stat-label">AI置信度</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <div className="card-title">资产配置</div>
          <div className="asset-list">
            {portfolioData?.assets.map((asset, index) => (
              <div key={index} className="asset-item">
                <div className="asset-info">
                  <div className="asset-symbol">{asset.symbol}</div>
                  <div className="asset-name">{asset.name}</div>
                </div>
                <div className="asset-details">
                  <div className="asset-amount">${asset.amount.toLocaleString()}</div>
                  <div className="asset-allocation">{asset.allocation}%</div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${asset.allocation}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">风险评估</div>
          <div className="risk-assessment">
            <div className="risk-score">
              <div className="risk-number">{portfolioData?.riskScore || 0}</div>
              <div className="risk-label">风险评分 (0-100)</div>
            </div>
            <div className="risk-breakdown">
              <div className="risk-item">
                <span className="risk-type">市场风险</span>
                <span className="risk-value">中等</span>
              </div>
              <div className="risk-item">
                <span className="risk-type">流动性风险</span>
                <span className="risk-value">低</span>
              </div>
              <div className="risk-item">
                <span className="risk-type">信用风险</span>
                <span className="risk-value">低</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">AI建议</div>
          <div className="ai-suggestions">
            <div className="suggestion">
              <div className="suggestion-icon">💡</div>
              <div className="suggestion-content">
                <div className="suggestion-title">增加稳定币配置</div>
                <div className="suggestion-text">建议将稳定币配置从10%提高到15%，以降低整体波动性</div>
              </div>
            </div>
            <div className="suggestion">
              <div className="suggestion-icon">⚡</div>
              <div className="suggestion-content">
                <div className="suggestion-title">优化再平衡频率</div>
                <div className="suggestion-text">当前市场波动性较高，建议将再平衡频率从每周调整为每两周</div>
              </div>
            </div>
            <div className="suggestion">
              <div className="suggestion-icon">🎯</div>
              <div className="suggestion-content">
                <div className="suggestion-title">新增资产类别</div>
                <div className="suggestion-text">考虑添加代币化债券以进一步分散风险</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;