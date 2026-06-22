// 错误处理工具
export class AppError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class Web3Error extends AppError {
  constructor(message, details = null) {
    super(message, 'WEB3_ERROR', details);
    this.name = 'Web3Error';
  }
}

export class APIError extends AppError {
  constructor(message, status, details = null) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(message, field, details = null) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// 错误处理器
export const errorHandler = {
  // 处理Web3错误
  handleWeb3Error: (error) => {
    console.error('Web3 Error:', error);
    
    if (error.code === 4001) {
      return new Web3Error('用户拒绝了交易', { originalError: error });
    }
    
    if (error.code === -32603) {
      return new Web3Error('交易失败：Gas不足', { originalError: error });
    }
    
    return new Web3Error('Web3连接错误', { originalError: error });
  },
  
  // 处理API错误
  handleAPIError: (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        return new APIError('认证失败', status, { originalError: error });
      }
      
      if (status === 403) {
        return new APIError('权限不足', status, { originalError: error });
      }
      
      if (status === 404) {
        return new APIError('资源不存在', status, { originalError: error });
      }
      
      if (status === 500) {
        return new APIError('服务器错误', status, { originalError: error });
      }
      
      return new APIError(data.message || 'API请求失败', status, { originalError: error });
    }
    
    return new APIError('网络请求失败', 0, { originalError: error });
  },
  
  // 处理验证错误
  handleValidationError: (field, message) => {
    return new ValidationError(message, field);
  },
  
  // 显示错误消息
  showError: (error, showToast = true) => {
    const message = error.message || '发生未知错误';
    
    if (showToast) {
      // 这里可以集成toast通知库
      console.error('Error:', message);
    }
    
    return message;
  },
  
  // 记录错误
  logError: (error, context = {}) => {
    const errorLog = {
      message: error.message,
      code: error.code,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    console.error('Error Log:', errorLog);
    
    // 这里可以发送到错误监控服务
    //例如: Sentry, LogRocket等
  }
};

// 错误边界组件
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    errorHandler.logError(error, { errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>出错了</h2>
          <p>{this.state.error?.message || '发生未知错误'}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default errorHandler;