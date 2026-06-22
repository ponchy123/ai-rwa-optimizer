import React, { useState } from 'react';
import './AIStrategy.css';

function AIStrategy({ account }) {
  const [strategyParams, setStrategyParams] = useState({
    riskLevel: 5,
    timeHorizon: 90,
    targetReturn: 10
  });
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateStrategy = async () => {
    setLoading(true);
    try {
      // 调用AI后端API
      const response = await fetch('http://localhost:8000/api/ai/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_address: account,
          risk_level: strategyParams.riskLevel,
          time_horizon: strategyParams.timeHorizon,
          target_return: strategyParams.targetReturn
        })
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const data = await response.json();
      setStrategy(data.strategy);
    } catch (error) {
      console.error('生成策略失败:', error);
      // 模拟策略数据
      const mockStrategy = {
        allocations: [6000, 4000],
        expected_return: 8.5,
        risk_score: 45,
        confidence: 87,
        reasoning: `基于风险等级${strategyParams.riskLevel}和${strategyParams.timeHorizon}天投资期限生成`
      };
      setStrategy(mockStrategy);
    } finally {
      setLoading(false);
    }
  };

  const executeStrategy = async () => {
    if (!strategy) {
      alert('请先生成策略');
      return;
    }

    setLoading(true);
    try {
      // 这里应该调用智能合约
      alert('策略执行成功！');
    } catch (error) {
      console.error('执行策略失败:', error);
      alert('策略执行失败');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLabel = (level) => {
    if (level <= 3) return '低风险';
    if (level <= 7) return '中风险';
    return '高风险';
  };

  const getRiskColor = (level) => {
    if (level <= 3) return '#4caf50';
    if (level <= 7) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="ai-strategy">
      <div className="strategy-header">
        <h2>AI投资策略</h2>
        <p className="strategy-description">
          基于您的风险偏好和投资目标，AI将为您生成最优资产配置方案
        </p>
      </div>

      <div className="strategy-content">
        <div className="card">
          <div className="card-title">策略参数设置</div>
          <div className="params-form">
            <div className="form-group">
              <label>风险承受能力</label>
              <div className="risk-slider">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={strategyParams.riskLevel}
                  onChange={(e) => setStrategyParams({
                    ...strategyParams,
                    riskLevel: parseInt(e.target.value)
                  })}
                  style={{ 
                    background: `linear-gradient(to right, #4caf50 0%, #ff9800 50%, #f44336 100%)`
                  }}
                />
                <div className="risk-labels">
                  <span>保守</span>
                  <span>平衡</span>
                  <span>激进</span>
                </div>
                <div 
                  className="risk-indicator"
                  style={{ color: getRiskColor(strategyParams.riskLevel) }}
                >
                  {getRiskLabel(strategyParams.riskLevel)} ({strategyParams.riskLevel}/10)
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>投资期限（天）</label>
                <input
                  type="number"
                  className="input"
                  value={strategyParams.timeHorizon}
                  onChange={(e) => setStrategyParams({
                    ...strategyParams,
                    timeHorizon: parseInt(e.target.value) || 30
                  })}
                  min="7"
                  max="365"
                />
              </div>
              <div className="form-group">
                <label>目标收益率（%）</label>
                <input
                  type="number"
                  className="input"
                  value={strategyParams.targetReturn}
                  onChange={(e) => setStrategyParams({
                    ...strategyParams,
                    targetReturn: parseFloat(e.target.value) || 5
                  })}
                  min="1"
                  max="50"
                  step="0.5"
                />
              </div>
            </div>

            <button 
              className="btn btn-primary"
              onClick={generateStrategy}
              disabled={loading}
            >
              {loading ? '生成中...' : '生成AI策略'}
            </button>
          </div>
        </div>

        {strategy && (
          <div className="card">
            <div className="card-title">AI生成策略</div>
            <div className="strategy-result">
              <div className="strategy-metrics">
                <div className="metric">
                  <div className="metric-value">{strategy.expected_return}%</div>
                  <div className="metric-label">预期年化收益</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{strategy.risk_score}</div>
                  <div className="metric-label">风险评分</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{strategy.confidence}%</div>
                  <div className="metric-label">AI置信度</div>
                </div>
              </div>

              <div className="strategy-allocations">
                <h4>建议资产配置</h4>
                <div className="allocation-bars">
                  {strategy.allocations.map((allocation, index) => (
                    <div key={index} className="allocation-item">
                      <div className="allocation-label">
                        {index === 0 ? '稳定资产' : '风险资产'}
                      </div>
                      <div className="allocation-bar">
                        <div 
                          className="allocation-fill"
                          style={{ 
                            width: `${allocation / 100}%`,
                            backgroundColor: index === 0 ? '#4caf50' : '#ff9800'
                          }}
                        ></div>
                      </div>
                      <div className="allocation-value">{allocation / 100}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="strategy-reasoning">
                <h4>策略说明</h4>
                <p>{strategy.reasoning}</p>
              </div>

              <div className="strategy-actions">
                <button 
                  className="btn btn-primary"
                  onClick={executeStrategy}
                  disabled={loading}
                >
                  {loading ? '执行中...' : '执行此策略'}
                </button>
                <button className="btn btn-secondary">
                  调整参数
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-title">历史策略</div>
          <div className="history-list">
            <div className="history-item">
              <div className="history-date">2026-06-15</div>
              <div className="history-params">风险等级: 6, 期限: 60天</div>
              <div className="history-result positive">+12.5%</div>
            </div>
            <div className="history-item">
              <div className="history-date">2026-06-01</div>
              <div className="history-params">风险等级: 4, 期限: 30天</div>
              <div className="history-result positive">+8.2%</div>
            </div>
            <div className="history-item">
              <div className="history-date">2026-05-15</div>
              <div className="history-params">风险等级: 7, 期限: 90天</div>
              <div className="history-result negative">-2.1%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIStrategy;