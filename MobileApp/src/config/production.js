// Mobile Apps Production Configuration
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
    maxRetries: 3,
    offlineMode: true
  },
  
  // Storage Configuration
  storage: {
    encrypted: true,
    syncEnabled: true,
    cacheSize: 1000,
    backupEnabled: true
  },
  
  // Security Configuration
  security: {
    encryptionKey: 'gis2026-mobile-encryption-key',
    biometricAuth: true,
    sessionTimeout: 3600000, // 1 hour
    autoLock: true
  },
  
  // UI Configuration
  ui: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    animations: true,
    hapticFeedback: true
  },
  
  // Maps Configuration
  maps: {
    provider: 'google',
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    defaultZoom: 15,
    enableLocation: true,
    locationAccuracy: 'high'
  },
  
  // Camera Configuration
  camera: {
    quality: 'high',
    compression: 0.8,
    maxFileSize: 10485760, // 10MB
    supportedFormats: ['jpg', 'png', 'heic']
  },
  
  // Notifications Configuration
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    badge: true,
    channels: {
      visits: 'Visit Updates',
      alerts: 'System Alerts',
      sync: 'Data Sync'
    }
  },
  
  // Feature Flags
  features: {
    realTimeUpdates: true,
    offlineMode: true,
    pushNotifications: true,
    locationTracking: true,
    cameraIntegration: true,
    voiceRecording: true,
    biometricAuth: true,
    dataExport: true,
    advancedAnalytics: true
  },
  
  // Build Configuration
  build: {
    version: '1.0.0',
    buildNumber: 1,
    environment: 'production',
    debug: false,
    minify: true,
    optimize: true
  }
};

export default config;
