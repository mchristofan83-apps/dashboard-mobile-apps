// Dashboard Production Configuration
const config = {
  // API Configuration
  api: {
    baseURL: 'https://api.gisconnect.online/api',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000
  },
  
  // WebSocket Configuration
  websocket: {
    url: 'wss://server.gisconnect.online',
    reconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  },
  
  // Real-time Configuration
  realtime: {
    enabled: true,
    syncInterval: 30000,
    batchSize: 50,
    maxRetries: 3
  },
  
  // Monitoring Configuration
  monitoring: {
    enabled: true,
    metricsInterval: 60000,
    errorReporting: true,
    performanceTracking: true
  },
  
  // Analytics Configuration
  analytics: {
    enabled: true,
    trackPageViews: true,
    trackUserActions: true,
    trackPerformance: true
  },
  
  // Security Configuration
  security: {
    csrfProtection: true,
    contentSecurityPolicy: true,
    xssProtection: true
  },
  
  // Cache Configuration
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000
  },
  
  // UI Configuration
  ui: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss'
  },
  
  // Feature Flags
  features: {
    realTimeUpdates: true,
    offlineMode: true,
    pushNotifications: true,
    dataExport: true,
    advancedAnalytics: true,
    userManagement: true,
    systemMonitoring: true
  }
};

export default config;
