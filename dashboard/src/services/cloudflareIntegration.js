/**
 * Cloudflare Integration for Dashboard
 * Real-time sync and caching configuration
 */

import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CLOUDFLARE_ENABLED = import.meta.env.VITE_CLOUDFLARE_ENABLED === 'true';
const SOCKET_IO_URL = import.meta.env.VITE_SOCKET_IO_URL || API_BASE_URL;

class CloudflareIntegration {
  constructor() {
    this.apiClient = null;
    this.socket = null;
    this.authToken = null;
    this.syncActive = false;
    this.cloudflareStatus = {
      enabled: CLOUDFLARE_ENABLED,
      configured: false,
      lastSync: null
    };

    this.initialize();
  }

  /**
   * Initialize API client and Socket.IO connection
   */
  initialize() {
    // Setup API client with interceptors
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'dashboard'
      }
    });

    // Add auth token to requests
    this.apiClient.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses and cache headers
    this.apiClient.interceptors.response.use(
      (response) => {
        // Log cache status
        const cacheStatus = response.headers['x-cache-status'];
        if (cacheStatus) {
          console.log(`[Cache] ${cacheStatus}`, response.config.url);
        }

        // Check Cloudflare headers
        if (response.headers['cf-ray']) {
          console.log(`[Cloudflare] Request served from CDN`);
        }

        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle authentication error
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Setup Socket.IO for real-time sync
    this.setupSocketIO();

    // Verify Cloudflare configuration
    if (CLOUDFLARE_ENABLED) {
      this.verifycloudflareConfig();
    }
  }

  /**
   * Setup Socket.IO connection for real-time updates
   */
  setupSocketIO() {
    try {
      this.socket = io(SOCKET_IO_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: (cb) => {
          const token = this.getAuthToken();
          cb({ token });
        }
      });

      this.socket.on('connect', () => {
        console.log('[Socket.IO] Connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('[Socket.IO] Disconnected');
      });

      this.socket.on('data-sync', (data) => {
        console.log('[Sync] Data received:', data);
        this.handleDataSync(data);
      });

      this.socket.on('error', (error) => {
        console.error('[Socket.IO] Error:', error);
      });
    } catch (error) {
      console.error('[Socket.IO] Setup failed:', error);
    }
  }

  /**
   * Get auth token
   */
  getAuthToken() {
    if (this.authToken) return this.authToken;

    try {
      const stored = localStorage.getItem('authToken');
      if (stored) {
        this.authToken = stored;
        return stored;
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }

    return null;
  }

  /**
   * Set auth token
   */
  setAuthToken(token) {
    this.authToken = token;
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  /**
   * Clear auth
   */
  clearAuth() {
    this.authToken = null;
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  /**
   * Verify Cloudflare configuration
   */
  async verifycloudflareConfig() {
    try {
      const response = await this.apiClient.get('/api/sync/cloudflare/status');
      
      this.cloudflareStatus = {
        enabled: response.data.cloudflareEnabled,
        configured: response.data.cloudflareConfigured,
        lastSync: new Date().toISOString()
      };

      console.log('[Cloudflare] Status:', this.cloudflareStatus);
      return this.cloudflareStatus;
    } catch (error) {
      console.error('[Cloudflare] Configuration check failed:', error.message);
      this.cloudflareStatus.configured = false;
      return this.cloudflareStatus;
    }
  }

  /**
   * Trigger manual sync
   */
  async triggerSync(syncToCloudflare = false) {
    if (this.syncActive) {
      console.warn('[Sync] Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    this.syncActive = true;

    try {
      const endpoint = syncToCloudflare ? '/api/sync/cloudflare' : '/api/sync/trigger';
      const response = await this.apiClient.post(endpoint);

      this.cloudflareStatus.lastSync = new Date().toISOString();

      console.log(`[Sync] Completed:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[Sync] Failed:', error.message);
      return { success: false, error: error.message };
    } finally {
      this.syncActive = false;
    }
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(limit = 50) {
    try {
      const response = await this.apiClient.get('/api/sync/logs', {
        params: { limit }
      });
      return {
        success: true,
        logs: response.data
      };
    } catch (error) {
      console.error('[Sync] Error fetching logs:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Emit data update to be synced
   */
  emitDataUpdate(data) {
    if (this.socket?.connected) {
      this.socket.emit('data-update', data);
      console.log('[Sync] Data update sent:', data);
    } else {
      console.warn('[Sync] Socket not connected, queueing update...');
      this.queueDataUpdate(data);
    }
  }

  /**
   * Queue data update for later sync
   */
  queueDataUpdate(data) {
    try {
      const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
      queue.push({
        data,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('syncQueue', JSON.stringify(queue));
    } catch (error) {
      console.error('Error queueing update:', error);
    }
  }

  /**
   * Process queued updates
   */
  async processQueuedUpdates() {
    try {
      const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
      
      if (queue.length === 0) return;

      console.log(`[Sync] Processing ${queue.length} queued updates`);

      for (const item of queue) {
        this.emitDataUpdate(item.data);
      }

      localStorage.removeItem('syncQueue');
    } catch (error) {
      console.error('Error processing queue:', error);
    }
  }

  /**
   * Handle incoming data sync
   */
  handleDataSync(data) {
    console.log('[Sync] Handling data sync:', data);
    
    // Emit custom event for components to listen
    const event = new CustomEvent('dataSyncReceived', { detail: data });
    window.dispatchEvent(event);
  }

  /**
   * Get Cloudflare status for UI
   */
  getStatus() {
    return {
      cloudflareStatus: this.cloudflareStatus,
      socketConnected: this.socket?.connected || false,
      syncActive: this.syncActive,
      apiBaseURL: API_BASE_URL
    };
  }

  /**
   * Cleanup and disconnect
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Export singleton instance
export default new CloudflareIntegration();
