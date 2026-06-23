import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import './Portfolio.css';

function Portfolio() {
  const { account } = useWeb3();
  const [assets, setAssets] = useState([
    { address: '0x1234...', name: '代币化黄金 (xAU)', balance: 5.2, value: 50000 },
    { address: '0x5678...', name: '代币化房地产 (xRE)', balance: 125, value: 37500 },
    { address: '0x9abc...', name: '代币化股票 (xST)', balance: 500, value: 25000 },
    { address: '0xdef0...', name: '稳定币 (USDT)', balance: 12500, value: 12500 }
  ]);
  const [newAsset, setNewAsset] = useState({ address: '', amount: 0, allocation: 0 });
  const [loading, setLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  const handleAddAsset = async () => {
    if (!newAsset.address || newAsset.amount <= 0) {
      alert('请输入有效的资产信息');
      return;
    }

    if (!account) {
      alert('请先连接钱包');
      return;
    }

    setLoading(true);
    setTransactionStatus('pending');
    
    try {
      // 模拟添加资产
      const updatedAssets = [...assets, {
        address: newAsset.address,
        name: `新资产 (${newAsset.address.slice(0, 6)}...)`,
        balance: newAsset.amount,
        value: newAsset.amount * 1000 // 假设价格为1000
      }];
      
      setAssets(updatedAssets);
      setNewAsset({ address: '', amount: 0, allocation: 0 });
      setTransactionStatus('success');
      alert('资产添加成功！');
    } catch (error) {
      console.error('添加资产失败:', error);
      setTransactionStatus('error');
      alert('添加资产失败');
    } finally {
      setLoading(false);
      setTimeout(() => setTransactionStatus(null), 3000);
    }
  };

  const handleRebalance = async () => {
    if (!account) {
      alert('请先连接钱包');
      return;
    }

    setLoading(true);
    setTransactionStatus('pending');
    
    try {
      // 模拟再平衡
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟交易时间
      setTransactionStatus('success');
      alert('投资组合再平衡成功！');
    } catch (error) {
      console.error('再平衡失败:', error);
      setTransactionStatus('error');
      alert('再平衡失败');
    } finally {
      setLoading(false);
      setTimeout(() => setTransactionStatus(null), 3000);
    }
  };

  const calculateTotalValue = () => {
    return assets.reduce((total, asset) => total + asset.value, 0);
  };

  if (!account) {
    return (
      <div className="portfolio">
        <div className="connect-prompt">
          <h2>投资组合管理</h2>
          <p>请连接钱包以管理您的投资组合</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h2>投资组合管理</h2>
        <div className="portfolio-stats">
          <div className="portfolio-stat">
            <span className="stat-label">总资产</span>
            <span className="stat-value">${calculateTotalValue().toLocaleString()}</span>
          </div>
          <div className="portfolio-stat">
            <span className="stat-label">资产数量</span>
            <span className="stat-value">{assets.length}</span>
          </div>
        </div>
      </div>

      {transactionStatus && (
        <div className={`transaction-status ${transactionStatus}`}>
          {transactionStatus === 'pending' && '交易处理中...'}
          {transactionStatus === 'success' && '交易成功！'}
          {transactionStatus === 'error' && '交易失败'}
        </div>
      )}

      <div className="portfolio-content">
        <div className="card">
          <div className="card-title">当前资产</div>
          <div className="asset-table">
            <table className="table">
              <thead>
                <tr>
                  <th>资产</th>
                  <th>余额</th>
                  <th>价值</th>
                  <th>占比</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, index) => (
                  <tr key={index}>
                    <td>
                      <div className="asset-info">
                        <div className="asset-symbol">{asset.name.split('(')[1]?.replace(')', '') || '???'}</div>
                        <div className="asset-name">{asset.name}</div>
                      </div>
                    </td>
                    <td>{asset.balance.toLocaleString()}</td>
                    <td>${asset.value.toLocaleString()}</td>
                    <td>{((asset.value / calculateTotalValue()) * 100).toFixed(1)}%</td>
                    <td>
                      <button className="btn btn-secondary btn-sm">移除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">添加新资产</div>
          <div className="add-asset-form">
            <div className="form-group">
              <label>资产合约地址</label>
              <input
                type="text"
                className="input"
                placeholder="0x..."
                value={newAsset.address}
                onChange={(e) => setNewAsset({ ...newAsset, address: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>数量</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={newAsset.amount}
                  onChange={(e) => setNewAsset({ ...newAsset, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>目标配置比例 (%)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={newAsset.allocation}
                  onChange={(e) => setNewAsset({ ...newAsset, allocation: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleAddAsset}
              disabled={loading}
            >
              {loading ? '添加中...' : '添加资产'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">再平衡操作</div>
          <div className="rebalance-section">
            <p className="rebalance-description">
              根据AI建议调整资产配置比例，优化投资组合表现
            </p>
            <div className="rebalance-actions">
              <button 
                className="btn btn-primary"
                onClick={handleRebalance}
                disabled={loading}
              >
                {loading ? '处理中...' : '执行再平衡'}
              </button>
              <button className="btn btn-secondary">
                查看AI建议
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;