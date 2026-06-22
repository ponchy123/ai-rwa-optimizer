// 性能优化配置

// 代码分割配置
export const codeSplittingConfig = {
  // 路由级别代码分割
  routes: {
    Dashboard: () => import('../components/Dashboard'),
    Portfolio: () => import('../components/Portfolio'),
    AIStrategy: () => import('../components/AIStrategy'),
    AutoPayment: () => import('../components/AutoPayment')
  },
  
  // 组件级别代码分割
  components: {
    Charts: () => import('../components/Charts'),
    WalletConnect: () => import('../components/WalletConnect'),
    TransactionStatus: () => import('../components/TransactionStatus')
  }
};

// 缓存配置
export const cacheConfig = {
  // API缓存
  api: {
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 100, // 最大缓存条目数
    storage: 'localStorage'
  },
  
  // 图片缓存
  images: {
    ttl: 24 * 60 * 60 * 1000, // 24小时
    maxSize: 50, // 最大缓存图片数
    storage: 'cacheStorage'
  },
  
  // 数据缓存
  data: {
    ttl: 10 * 60 * 1000, // 10分钟
    maxSize: 200, // 最大缓存数据条目
    storage: 'sessionStorage'
  }
};

// 防抖和节流配置
export const throttleConfig = {
  // 搜索输入防抖
  search: {
    delay: 300,
    maxWait: 1000
  },
  
  // 滚动事件节流
  scroll: {
    delay: 100,
    maxWait: 500
  },
  
  // 窗口调整节流
  resize: {
    delay: 200,
    maxWait: 1000
  },
  
  // API请求节流
  api: {
    delay: 100,
    maxWait: 500
  }
};

// 虚拟列表配置
export const virtualListConfig = {
  // 资产列表
  assetList: {
    itemHeight: 60,
    overscan: 5,
    threshold: 100 // 当项目数超过100时启用虚拟列表
  },
  
  // 交易历史
  transactionHistory: {
    itemHeight: 80,
    overscan: 3,
    threshold: 50
  },
  
  // 价格列表
  priceList: {
    itemHeight: 40,
    overscan: 10,
    threshold: 200
  }
};

// 懒加载配置
export const lazyLoadConfig = {
  // 图片懒加载
  images: {
    rootMargin: '50px',
    threshold: 0.1
  },
  
  // 组件懒加载
  components: {
    rootMargin: '100px',
    threshold: 0.01
  },
  
  // 数据懒加载
  data: {
    pageSize: 20,
    loadMoreThreshold: 100
  }
};

// Web Worker配置
export const workerConfig = {
  // 计算密集型任务
  calculations: {
    maxWorkers: navigator.hardwareConcurrency || 4,
    taskTimeout: 5000
  },
  
  // 数据处理任务
  dataProcessing: {
    maxWorkers: 2,
    taskTimeout: 10000
  }
};

// 内存优化配置
export const memoryConfig = {
  // 最大内存使用限制
  maxMemory: 100 * 1024 * 1024, // 100MB
  
  // 清理策略
  cleanup: {
    interval: 5 * 60 * 1000, // 5分钟检查一次
    threshold: 0.8, // 内存使用超过80%时清理
    preserveRecent: 10 // 保留最近10个条目
  },
  
  // 大数据处理
  bigData: {
    chunkSize: 1000, // 每次处理1000条
    delayBetweenChunks: 10 // 每个块之间延迟10ms
  }
};

// 网络优化配置
export const networkConfig = {
  // 请求重试
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffFactor: 2
  },
  
  // 请求超时
  timeout: {
    connect: 5000,
    request: 30000,
    response: 30000
  },
  
  // 请求合并
  batching: {
    maxBatchSize: 10,
    batchDelay: 50
  },
  
  // 预加载
  prefetch: {
    enabled: true,
    strategy: 'viewport', // 'viewport' | 'hover' | 'idle'
    maxConcurrent: 3
  }
};

// 渲染优化配置
export const renderConfig = {
  // 虚拟化
  virtualization: {
    enabled: true,
    threshold: 50,
    overscan: 5
  },
  
  // 动画
  animation: {
    duration: 300,
    easing: 'ease-out',
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  
  // 批量更新
  batching: {
    enabled: true,
    maxBatchSize: 100
  }
};

// 监控配置
export const monitoringConfig = {
  // 性能监控
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10%采样率
    metrics: ['FCP', 'LCP', 'FID', 'CLS', 'TTFB']
  },
  
  // 错误监控
  error: {
    enabled: true,
    sampleRate: 1.0, // 100%错误捕获
    ignorePatterns: [
      /ResizeObserver loop/,
      /Non-Error promise rejection/
    ]
  },
  
  // 用户行为监控
  userBehavior: {
    enabled: true,
    sampleRate: 0.5, // 50%用户行为采样
    events: ['click', 'scroll', 'input']
  }
};

// 导出所有配置
export default {
  codeSplitting: codeSplittingConfig,
  cache: cacheConfig,
  throttle: throttleConfig,
  virtualList: virtualListConfig,
  lazyLoad: lazyLoadConfig,
  worker: workerConfig,
  memory: memoryConfig,
  network: networkConfig,
  render: renderConfig,
  monitoring: monitoringConfig
};