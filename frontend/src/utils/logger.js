// 日志记录工具
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

class Logger {
  constructor(level = LOG_LEVELS.INFO) {
    this.level = level;
    this.logs = [];
    this.maxLogs = 1000;
  }
  
  // 格式化日志
  formatLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level),
      message,
      data,
      stack: level >= LOG_LEVELS.ERROR ? new Error().stack : undefined
    };
    
    return logEntry;
  }
  
  // 添加日志
  addLog(logEntry) {
    this.logs.push(logEntry);
    
    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // 根据级别输出到控制台
    switch (logEntry.level) {
      case 'DEBUG':
        console.debug(`[${logEntry.timestamp}] ${logEntry.message}`, logEntry.data);
        break;
      case 'INFO':
        console.info(`[${logEntry.timestamp}] ${logEntry.message}`, logEntry.data);
        break;
      case 'WARN':
        console.warn(`[${logEntry.timestamp}] ${logEntry.message}`, logEntry.data);
        break;
      case 'ERROR':
      case 'FATAL':
        console.error(`[${logEntry.timestamp}] ${logEntry.message}`, logEntry.data);
        break;
      default:
        console.log(`[${logEntry.timestamp}] ${logEntry.message}`, logEntry.data);
    }
    
    return logEntry;
  }
  
  // 调试日志
  debug(message, data = null) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      return this.addLog(this.formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  }
  
  // 信息日志
  info(message, data = null) {
    if (this.level <= LOG_LEVELS.INFO) {
      return this.addLog(this.formatLog(LOG_LEVELS.INFO, message, data));
    }
  }
  
  // 警告日志
  warn(message, data = null) {
    if (this.level <= LOG_LEVELS.WARN) {
      return this.addLog(this.formatLog(LOG_LEVELS.WARN, message, data));
    }
  }
  
  // 错误日志
  error(message, data = null) {
    if (this.level <= LOG_LEVELS.ERROR) {
      return this.addLog(this.formatLog(LOG_LEVELS.ERROR, message, data));
    }
  }
  
  // 致命错误日志
  fatal(message, data = null) {
    return this.addLog(this.formatLog(LOG_LEVELS.FATAL, message, data));
  }
  
  // 获取日志
  getLogs(level = null, limit = 100) {
    let filteredLogs = this.logs;
    
    if (level !== null) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(-limit);
  }
  
  // 清除日志
  clearLogs() {
    this.logs = [];
  }
  
  // 导出日志
  exportLogs(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }
    
    if (format === 'csv') {
      const headers = 'timestamp,level,message,data\n';
      const rows = this.logs.map(log => 
        `${log.timestamp},${log.level},"${log.message}","${JSON.stringify(log.data)}"`
      ).join('\n');
      
      return headers + rows;
    }
    
    return this.logs.map(log => 
      `[${log.timestamp}] ${log.level}: ${log.message}`
    ).join('\n');
  }
  
  // 发送日志到服务器
  async sendLogs(endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logs: this.logs,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        this.clearLogs();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('发送日志失败:', error);
      return false;
    }
  }
}

// 创建默认日志实例
const logger = new Logger(LOG_LEVELS.INFO);

// 性能日志
export const performanceLogger = {
  // 开始计时
  start: (label) => {
    const startTime = performance.now();
    logger.debug(`Performance start: ${label}`);
    
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        logger.info(`Performance ${label}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  },
  
  // 测量函数执行时间
  measure: async (label, fn) => {
    const timer = performanceLogger.start(label);
    try {
      const result = await fn();
      timer.end();
      return result;
    } catch (error) {
      timer.end();
      throw error;
    }
  }
};

// 用户行为日志
export const userLogger = {
  // 记录用户操作
  logAction: (action, data = {}) => {
    logger.info(`User action: ${action}`, {
      ...data,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });
  },
  
  // 记录页面访问
  logPageView: (page) => {
    logger.info(`Page view: ${page}`, {
      url: window.location.href,
      referrer: document.referrer
    });
  },
  
  // 记录错误
  logError: (error, context = {}) => {
    logger.error(`User error: ${error.message}`, {
      ...context,
      stack: error.stack
    });
  }
};

// API日志
export const apiLogger = {
  // 记录API请求
  logRequest: (method, url, data = null) => {
    logger.debug(`API Request: ${method} ${url}`, data);
  },
  
  // 记录API响应
  logResponse: (method, url, status, data = null) => {
    if (status >= 400) {
      logger.error(`API Response: ${method} ${url} - ${status}`, data);
    } else {
      logger.debug(`API Response: ${method} ${url} - ${status}`, data);
    }
  },
  
  // 记录API错误
  logError: (method, url, error) => {
    logger.error(`API Error: ${method} ${url}`, {
      message: error.message,
      stack: error.stack
    });
  }
};

export default logger;