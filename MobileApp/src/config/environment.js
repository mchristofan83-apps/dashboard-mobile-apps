import Constants from 'expo-constants';

// Mobile App Environment Configuration
// Complete Subdomain Integration

// Development API URL - Local server
const DEV_API_URL = process.env.DEV_API_URL || 'http://localhost:8000/api';

// Production API URL - Cloudflare Worker with subdomain
const PROD_API_URL = process.env.PROD_API_URL || 'https://api.gisconnect.online/api';

// Staging API URL - Staging subdomain
const STAGING_API_URL = process.env.STAGING_API_URL || 'https://staging-api.gisconnect.online/api';

// Fallback API URL - Direct to origin server with subdomain
const FALLBACK_API_URL = process.env.FALLBACK_API_URL || 'https://server.gisconnect.online/api';

// Cloudflare configuration with subdomains
const CLOUDFLARE_CONFIG = {
  enabled: process.env.CLOUDFLARE_ENABLED === 'true',
  domain: process.env.CLOUDFLARE_DOMAIN || 'gisconnect.online',
  workerUrl: 'https://api.gisconnect.online',
  dashboardUrl: 'https://dashboard.gisconnect.online',
  serverUrl: 'https://server.gisconnect.online',
  syncEnabled: process.env.SYNC_ENABLED === 'true',
  syncInterval: parseInt(process.env.SYNC_INTERVAL) || 300000, // 5 minutes
  kvNamespace: 'af106ee16e7941f6a706a004410db88e',
  subdomains: {
    dashboard: 'dashboard.gisconnect.online',
    api: 'api.gisconnect.online',
    server: 'server.gisconnect.online',
    staging: 'staging.gisconnect.online'
  }
};

// Environment detection
const isDevelopment = __DEV__;
const isProduction = !isDevelopment;
const isStaging = process.env.NODE_ENV === 'staging';

// API Endpoints
const API_ENDPOINTS = {
  users: '/users',
  outlets: '/outlets',
  visits: '/visits',
  sync: '/sync',
  health: '/health',
  auth: '/auth'
};

// Current environment configuration
const config = {
  // API Configuration
  apiUrl: isStaging ? STAGING_API_URL : (isDevelopment ? DEV_API_URL : PROD_API_URL),
  fallbackUrl: FALLBACK_API_URL,
  
  // Environment flags
  isDevelopment,
  isProduction,
  isStaging,
  
  // Cloudflare Configuration
  cloudflare: CLOUDFLARE_CONFIG,
  
  // API Endpoints
  endpoints: API_ENDPOINTS,
  
  // Feature flags
  features: {
    cloudflareCaching: !isDevelopment,
    realTimeSync: true,
    offlineMode: true,
    debugging: isDevelopment,
    analytics: !isDevelopment,
    subdomainRouting: !isDevelopment
  },
  
  // App Configuration
  app: {
    name: 'GIS Dashboard Mobile',
    version: '1.0.0',
    buildNumber: Constants.expoConfig?.version || '1.0.0'
  }
};

export default config;

// Helper functions
export const getApiUrl = () => config.apiUrl;
export const getFallbackUrl = () => config.fallbackUrl;
export const getCloudflareUrl = () => config.cloudflare.workerUrl;
export const getDashboardUrl = () => config.cloudflare.dashboardUrl;
export const getServerUrl = () => config.cloudflare.serverUrl;
export const isProductionMode = () => isProduction;
export const isStagingMode = () => isStaging;
export const getEndpoint = (endpoint) => config.apiUrl + config.endpoints[endpoint];

// Export for debugging
if (isDevelopment) {
  console.log('🔧 Mobile App Configuration:', {
    environment: isStaging ? 'staging' : (isDevelopment ? 'development' : 'production'),
    apiUrl: config.apiUrl,
    cloudflareEnabled: config.cloudflare.enabled,
    syncEnabled: config.cloudflare.syncEnabled,
    subdomains: config.cloudflare.subdomains
  });
}