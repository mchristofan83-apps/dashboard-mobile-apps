// Dashboard Environment Configuration
// Complete Subdomain Integration

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const isStaging = import.meta.env.MODE === 'staging';

// Check if running locally (override for local development)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const useLocalApi = isLocalhost || import.meta.env.VITE_USE_LOCAL_API === 'true';

// API Configuration
const DEV_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PROD_API_URL = import.meta.env.VITE_API_URL || 'https://api.gisconnect.online';
const STAGING_API_URL = 'https://staging-api.gisconnect.online';

// Dashboard URLs
const DASHBOARD_URLS = {
  development: 'http://localhost:5173',
  production: 'https://dashboard.gisconnect.online',
  staging: 'https://staging.gisconnect.online'
};

// Server URLs
const SERVER_URLS = {
  development: 'http://localhost:8000',
  production: 'https://server.gisconnect.online',
  staging: 'https://staging-server.gisconnect.online'
};

// Cloudflare Configuration
const CLOUDFLARE_CONFIG = {
  enabled: !isDevelopment,
  domain: 'gisconnect.online',
  workerUrl: 'https://api.gisconnect.online',
  pagesUrl: 'https://dashboard.gisconnect.online',
  serverUrl: 'https://server.gisconnect.online',
  kvNamespace: 'af106ee16e7941f6a706a004410db88e',
  subdomains: {
    dashboard: 'dashboard.gisconnect.online',
    api: 'api.gisconnect.online',
    server: 'server.gisconnect.online',
    staging: 'staging.gisconnect.online'
  }
};

// Current environment configuration
const config = {
  // API Configuration - Use localhost if running locally
  apiUrl: useLocalApi ? DEV_API_URL : (isStaging ? STAGING_API_URL : (isDevelopment ? DEV_API_URL : PROD_API_URL)),
  
  // Dashboard URL
  dashboardUrl: isStaging ? DASHBOARD_URLS.staging : (isDevelopment ? DASHBOARD_URLS.development : DASHBOARD_URLS.production),
  
  // Server URL
  serverUrl: useLocalApi ? SERVER_URLS.development : (isStaging ? SERVER_URLS.staging : (isDevelopment ? SERVER_URLS.development : SERVER_URLS.production)),
  
  // Cloudflare Configuration
  cloudflare: CLOUDFLARE_CONFIG,
  
  // Environment flags
  isDevelopment,
  isProduction,
  isStaging,
  
  // Feature flags
  features: {
    cloudflareCaching: !isDevelopment,
    realTimeSync: true,
    analytics: !isDevelopment,
    debugging: isDevelopment,
    kvStorage: !isDevelopment,
    subdomainRouting: !isDevelopment
  }
};

export default config;

// Helper functions
export const getApiUrl = () => config.apiUrl;
export const getDashboardUrl = () => config.dashboardUrl;
export const getServerUrl = () => config.serverUrl;
export const getCloudflareUrl = () => config.cloudflare.workerUrl;
export const isProductionMode = () => isProduction;
export const isStagingMode = () => isStaging;

// Export for debugging
if (isDevelopment || useLocalApi) {
  console.log('🔧 Dashboard Configuration:', {
    environment: isStaging ? 'staging' : (isDevelopment ? 'development' : 'production'),
    isLocalhost,
    useLocalApi,
    apiUrl: config.apiUrl,
    dashboardUrl: config.dashboardUrl,
    serverUrl: config.serverUrl,
    cloudflareEnabled: config.cloudflare.enabled,
    subdomains: config.cloudflare.subdomains
  });
}