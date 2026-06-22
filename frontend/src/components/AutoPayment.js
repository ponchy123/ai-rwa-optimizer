import React, { useState, useEffect } from 'react';
import './AutoPayment.css';

function AutoPayment({ account }) {
  const [payments, setPayments] = useState([
    {
      id: '0x1234...',
      payee: '0x5678...',
      token: 'USDT',
      amount: 1000,
      frequency: 2592000, // 30天
      lastPayment: Date.now() - 86400000,
      nextPayment: Date.now() + 2592000000,
      active: true
    },
    {
      id: '0xabcd...',
      payee: '0xef01...',
      token: 'USDC',
      amount: 500,
      frequency: 604800, // 7天
      lastPayment: Date.now() - 432000000,
      nextPayment: Date.now() + 172800000,
      active: true
    }
  ]);
  const [newPayment, setNewPayment] = useState({
    payee: '',
    token: 'USDT',
    amount: 0,
    frequency: 2592000
  });
  const [loading, setLoading] = useState(false);

  const handleCreatePayment = async () => {
    if (!newPayment.payee || newPayment.amount <= 0) {
      alert('请输入有效的支付信息');
      return;
    }

    setLoading(true);
    try {
      // 这里应该调用智能合约
      const payment = {
        id: `0x${Math.random().toString(16).slice(2, 10)}...`,
        payee: newPayment.payee,
        token: newPayment.token,
        amount: newPayment.amount,
        frequency: newPayment.frequency,
        lastPayment: Date.now(),
        nextPayment: Date.now() + newPayment.frequency * 1000,
        active: true
      };

      setPayments([...payments, payment]);
      setNewPayment({ payee: '', token: 'USDT', amount: 0, frequency: 2592000 });
      alert('自动支付创建成功！');
    } catch (error) {
      console.error('创建支付失败:', error);
      alert('创建支付失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = async (paymentId) => {
    if (!window.confirm('确定要取消这个自动支付吗？')) {
      return;
    }

    setLoading(true);
    try {
      // 这里应该调用智能合约
      setPayments(payments.filter(p => p.id !== paymentId));
      alert('自动支付已取消');
    } catch (error) {
      console.error('取消支付失败:', error);
      alert('取消支付失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePayment = async (paymentId) => {
    setLoading(true);
    try {
      // 这里应该调用智能合约
      alert('支付执行成功！');
    } catch (error) {
      console.error('执行支付失败:', error);
      alert('执行支付失败');
    } finally {
      setLoading(false);
    }
  };

  const formatFrequency = (seconds) => {
    if (seconds >= 2592000) {
      return `${seconds / 2592000}个月`;
    } else if (seconds >= 604800) {
      return `${seconds / 604800}周`;
    } else if (seconds >= 86400) {
      return `${seconds / 86400}天`;
    } else {
      return `${seconds / 3600}小时`;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  return (
    <div className="auto-payment">
      <div className="payment-header">
        <h2>自动支付管理</h2>
        <p className="payment-description">
          设置定期自动支付，实现RWA收益的自动分配
        </p>
      </div>

      <div className="payment-content">
        <div className="card">
          <div className="card-title">创建自动支付</div>
          <div className="create-payment-form">
            <div className="form-group">
              <label>收款地址</label>
              <input
                type="text"
                className="input"
                placeholder="0x..."
                value={newPayment.payee}
                onChange={(e) => setNewPayment({ ...newPayment, payee: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>支付代币</label>
                <select
                  className="input"
                  value={newPayment.token}
                  onChange={(e) => setNewPayment({ ...newPayment, token: e.target.value })}
                >
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="DAI">DAI</option>
                </select>
              </div>
              <div className="form-group">
                <label>支付金额</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>支付频率</label>
              <div className="frequency-options">
                <button
                  className={`frequency-btn ${newPayment.frequency === 86400 ? 'active' : ''}`}
                  onClick={() => setNewPayment({ ...newPayment, frequency: 86400 })}
                >
                  每天
                </button>
                <button
                  className={`frequency-btn ${newPayment.frequency === 604800 ? 'active' : ''}`}
                  onClick={() => setNewPayment({ ...newPayment, frequency: 604800 })}
                >
                  每周
                </button>
                <button
                  className={`frequency-btn ${newPayment.frequency === 2592000 ? 'active' : ''}`}
                  onClick={() => setNewPayment({ ...newPayment, frequency: 2592000 })}
                >
                  每月
                </button>
                <button
                  className={`frequency-btn ${newPayment.frequency === 7776000 ? 'active' : ''}`}
                  onClick={() => setNewPayment({ ...newPayment, frequency: 7776000 })}
                >
                  每季度
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCreatePayment}
              disabled={loading}
            >
              {loading ? '创建中...' : '创建自动支付'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">现有自动支付</div>
          <div className="payments-list">
            {payments.length === 0 ? (
              <div className="empty-state">
                <p>暂无自动支付</p>
              </div>
            ) : (
              payments.map((payment, index) => (
                <div key={index} className="payment-item">
                  <div className="payment-info">
                    <div className="payment-address">
                      收款: {payment.payee.slice(0, 6)}...{payment.payee.slice(-4)}
                    </div>
                    <div className="payment-details">
                      <span className="payment-amount">{payment.amount} {payment.token}</span>
                      <span className="payment-frequency">每{formatFrequency(payment.frequency)}</span>
                    </div>
                  </div>
                  <div className="payment-status">
                    <div className={`status-badge ${payment.active ? 'active' : 'inactive'}`}>
                      {payment.active ? '活跃' : '已暂停'}
                    </div>
                    <div className="payment-next">
                      下次支付: {formatDate(payment.nextPayment)}
                    </div>
                  </div>
                  <div className="payment-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleExecutePayment(payment.id)}
                      disabled={loading}
                    >
                      立即执行
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelPayment(payment.id)}
                      disabled={loading}
                    >
                      取消
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">支付统计</div>
          <div className="payment-stats">
            <div className="stat-item">
              <div className="stat-value">{payments.filter(p => p.active).length}</div>
              <div className="stat-label">活跃支付</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                ${payments.reduce((total, p) => total + (p.active ? p.amount : 0), 0).toLocaleString()}
              </div>
              <div className="stat-label">月度总支付</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {payments.filter(p => p.nextPayment <= Date.now() + 86400000).length}
              </div>
              <div className="stat-label">待执行支付</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoPayment;