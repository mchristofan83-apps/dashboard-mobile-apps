/**
 * Cloudflare-enabled API Service Configuration
 * For React Native Mobile App
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const CLOUDFLARE_API_URL = process.env.REACT_APP_CLOUDFLARE_API_URL || 'https://api.yourdomain.com';
const SYNC_ENABLED = process.env.REACT_APP_SYNC_ENABLED === 'true';
const SYNC_INTERVAL = parseInt(process.env.REACT_APP_SYNC_INTERVAL || '300000'); // 5 minutes

class CloudflareAwareAPI {
  constructor() {
    this.useCloudflare = false;
    this.baseURL = API_BASE_URL;
    this.cloudflareURL = CLOUDFLARE_API_URL;
    this.client = null;
    this.lastSyncTime = 0;
    this.syncInProgress = false;

    this.initialize();
  }

  /**
   * Initialize API client
   */
  initialize() {
    // Try Cloudflare first if configured
    if (CLOUDFLARE_API_URL !== 'https://api.yourdomain.com') {
      this.useCloudflare = true;
      this.baseURL = this.cloudflareURL;
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'mobile-app',
        'X-Client-Version': '1.0.0'
      }
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(async (config) => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        // Store sync time on successful response
        if (SYNC_ENABLED) {
          this.lastSyncTime = Date.now();
        }
        return response;
      },
      async (error) => {
        // Fallback to local server if Cloudflare fails
        if (this.useCloudflare && error.response?.status >= 500) {
          console.warn('Cloudflare API failed, falling back to local server');
          this.useCloudflare = false;
          this.baseURL = API_BASE_URL;
          this.client.defaults.baseURL = this.baseURL;

          // Retry request with local server
          return this.client(error.config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get health status of server and Cloudflare
   */
  async getHealthStatus() {
    try {
      const response = await this.client.get('/api/health');
      return {
        success: true,
        server: 'healthy',
        cloudflareEnabled: response.data.cloudflareEnabled || false,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        server: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Trigger data synchronization
   */
  async triggerSync() {
    if (!SYNC_ENABLED || this.syncInProgress) {
      return { success: false, message: 'Sync not enabled or already in progress' };
    }

    this.syncInProgress = true;

    try {
      const response = await this.client.post('/api/sync/trigger');
      
      // Sync to Cloudflare if using it
      if (this.useCloudflare) {
        await this.client.post('/api/sync/cloudflare').catch(err =>
          console.warn('Could not sync to Cloudflare:', err.message)
        );
      }

      return {
        success: true,
        recordsSynced: response.data.recordsSynced,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Check if sync is needed
   */
  needsSync() {
    if (!SYNC_ENABLED) return false;
    return Date.now() - this.lastSyncTime > SYNC_INTERVAL;
  }

  /**
   * Automatic sync handler (call this periodically)
   */
  async autoSync() {
    if (this.needsSync()) {
      return await this.triggerSync();
    }
    return { success: false, message: 'Sync not needed' };
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    try {
      const response = await this.client.get('/api/sync/cloudflare/status');
      return {
        success: true,
        status: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all data (with caching via Cloudflare)
   */
  async getData(endpoint) {
    try {
      const response = await this.client.get(endpoint);
      
      // Check cache header
      const cacheStatus = response.headers['x-cache-status'];
      if (cacheStatus) {
        console.log(`Cache hit: ${cacheStatus}`);
      }

      return {
        success: true,
        data: response.data,
        cached: cacheStatus === 'HIT',
        cloudflareServed: response.headers['cf-ray'] !== undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send data with sync
   */
  async sendData(endpoint, data, method = 'POST') {
    try {
      const config = {
        method,
        url: endpoint,
        data
      };

      const response = await this.client(config);

      // Trigger background sync
      if (SYNC_ENABLED) {
        this.triggerSync().catch(err =>
          console.warn('Background sync failed:', err.message)
        );
      }

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Switch between Cloudflare and local server
   */
  async switchServer(useCloudflare = true) {
    this.useCloudflare = useCloudflare;
    this.baseURL = useCloudflare ? this.cloudflareURL : API_BASE_URL;
    this.client.defaults.baseURL = this.baseURL;

    console.log(`Switched to ${useCloudflare ? 'Cloudflare' : 'local'} server`);

    // Test connection
    const health = await this.getHealthStatus();
    return health;
  }

  /**
   * Get current server info
   */
  getServerInfo() {
    return {
      currentServer: this.useCloudflare ? 'cloudflare' : 'local',
      baseURL: this.baseURL,
      cloudflareURL: this.cloudflareURL,
      syncEnabled: SYNC_ENABLED,
      syncInterval: SYNC_INTERVAL,
      lastSyncTime: new Date(this.lastSyncTime).toISOString()
    };
  }
}

// Export singleton instance
export default new CloudflareAwareAPI();
