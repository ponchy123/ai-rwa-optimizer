import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import './Header.css';

function Header({ activeTab, setActiveTab }) {
  const { account, connectWallet, disconnectWallet, isConnecting, networkId } = useWeb3();
  
  const navItems = [
    { id: 'dashboard', label: '仪表盘' },
    { id: 'portfolio', label: '投资组合' },
    { id: 'ai-strategy', label: 'AI策略' },
    { id: 'auto-payment', label: '自动支付' }
  ];

  const getNetworkName = (id) => {
    switch (id) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli';
      case 11155111: return 'Sepolia';
      case 133: return 'HSK Chain';
      default: return 'Unknown';
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>AI-RWA Optimizer</h1>
          <span className="subtitle">智能投资组合优化器</span>
        </div>
        
        <nav className="nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="wallet-section">
          {account ? (
            <div className="wallet-info">
              <div className="wallet-details">
                <span className="wallet-address">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                {networkId && (
                  <span className="network-badge">
                    {getNetworkName(networkId)}
                  </span>
                )}
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={disconnectWallet}
              >
                断开
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? '连接中...' : '连接钱包'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;