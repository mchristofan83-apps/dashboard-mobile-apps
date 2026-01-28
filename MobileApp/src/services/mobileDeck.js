// Mobile Deck Service - Real-time Dashboard Integration
import io from 'socket.io-client';
import { getApiUrl, getServerUrl } from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

class MobileDeckService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.dashboardData = new Map();
    this.realtimeListeners = new Set();
    this.syncInterval = null;
    this.lastSyncTime = null;
  }

  async initialize() {
    try {
      await this.connectToServer();
      await this.connectToDashboard();
      this.startRealtimeSync();
      console.log('🚀 Mobile Deck initialized successfully');
    } catch (error) {
      console.error('❌ Mobile Deck initialization failed:', error);
      throw error;
    }
  }

  async connectToServer() {
    const token = await AsyncStorage.getItem('authToken');
    const serverUrl = getServerUrl();
    
    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server connection timeout'));
      }, 10000);

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        console.log('✅ Connected to server:', serverUrl);
        
        // Setup real-time event handlers
        this.setupServerEventHandlers();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.error('❌ Server connection failed:', error);
        reject(error);
      });
    });
  }

  async connectToDashboard() {
    const apiUrl = getApiUrl();
    const token = await AsyncStorage.getItem('authToken');
    
    try {
      // Test dashboard API connectivity
      const response = await fetch(`${apiUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Connected to dashboard API:', apiUrl);
        await this.syncDashboardData();
      } else {
        throw new Error(`Dashboard API error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Dashboard connection failed:', error);
      throw error;
    }
  }

  setupServerEventHandlers() {
    // Real-time data updates
    this.socket.on('data:update', (data) => {
      this.handleDataUpdate(data);
    });

    // Visit updates
    this.socket.on('visit:update', (visitData) => {
      this.handleVisitUpdate(visitData);
    });

    // User updates
    this.socket.on('user:update', (userData) => {
      this.handleUserUpdate(userData);
    });

    // Outlet updates
    this.socket.on('outlet:update', (outletData) => {
      this.handleOutletUpdate(outletData);
    });

    // Sync status
    this.socket.on('sync:status', (status) => {
      this.handleSyncStatus(status);
    });

    // Connection status
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('⚠️ Disconnected from server');
    });

    this.socket.on('reconnect', () => {
      this.isConnected = true;
      console.log('🔄 Reconnected to server');
      this.syncDashboardData();
    });
  }

  async syncDashboardData() {
    try {
      const apiUrl = getApiUrl();
      const token = await AsyncStorage.getItem('authToken');
      
      // Sync all dashboard data
      const endpoints = [
        '/users',
        '/outlets', 
        '/visits',
        '/sync/status'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${apiUrl}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            this.dashboardData.set(endpoint, data);
            console.log(`📊 Synced ${endpoint}:`, data.length || 'items');
          }
        } catch (error) {
          console.error(`❌ Failed to sync ${endpoint}:`, error);
        }
      }

      this.lastSyncTime = new Date();
      this.notifyListeners('sync:complete', { timestamp: this.lastSyncTime });
      
    } catch (error) {
      console.error('❌ Dashboard sync failed:', error);
      throw error;
    }
  }

  startRealtimeSync() {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Start periodic sync every 30 seconds
    this.syncInterval = setInterval(async () => {
      if (this.isConnected) {
        try {
          await this.syncDashboardData();
        } catch (error) {
          console.error('❌ Periodic sync failed:', error);
        }
      }
    }, 30000);
  }

  handleDataUpdate(data) {
    console.log('📈 Data update received:', data);
    this.dashboardData.set('data:update', data);
    this.notifyListeners('data:update', data);
  }

  handleVisitUpdate(visitData) {
    console.log('📍 Visit update received:', visitData);
    this.dashboardData.set('visit:update', visitData);
    this.notifyListeners('visit:update', visitData);
  }

  handleUserUpdate(userData) {
    console.log('👤 User update received:', userData);
    this.dashboardData.set('user:update', userData);
    this.notifyListeners('user:update', userData);
  }

  handleOutletUpdate(outletData) {
    console.log('🏪 Outlet update received:', outletData);
    this.dashboardData.set('outlet:update', outletData);
    this.notifyListeners('outlet:update', outletData);
  }

  handleSyncStatus(status) {
    console.log('🔄 Sync status:', status);
    this.dashboardData.set('sync:status', status);
    this.notifyListeners('sync:status', status);
  }

  // Event listener management
  addEventListener(event, callback) {
    const listener = { event, callback };
    this.realtimeListeners.add(listener);
    return () => this.realtimeListeners.delete(listener);
  }

  notifyListeners(event, data) {
    this.realtimeListeners.forEach(listener => {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error(`❌ Error in listener for ${event}:`, error);
        }
      }
    });
  }

  // Data access methods
  getUsers() {
    return this.dashboardData.get('/users') || [];
  }

  getOutlets() {
    return this.dashboardData.get('/outlets') || [];
  }

  getVisits() {
    return this.dashboardData.get('/visits') || [];
  }

  getSyncStatus() {
    return this.dashboardData.get('/sync/status') || {};
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      lastSyncTime: this.lastSyncTime,
      serverUrl: getServerUrl(),
      apiUrl: getApiUrl()
    };
  }

  // Manual sync methods
  async forceSync() {
    if (this.isConnected) {
      await this.syncDashboardData();
    } else {
      throw new Error('Not connected to server');
    }
  }

  async refreshData(endpoint) {
    try {
      const apiUrl = getApiUrl();
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.dashboardData.set(endpoint, data);
        this.notifyListeners('data:refresh', { endpoint, data });
        return data;
      } else {
        throw new Error(`Failed to refresh ${endpoint}: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Failed to refresh ${endpoint}:`, error);
      throw error;
    }
  }

  // Cleanup
  disconnect() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.realtimeListeners.clear();
    console.log('🔌 Mobile Deck disconnected');
  }
}

// Singleton instance
const mobileDeckService = new MobileDeckService();

export default mobileDeckService;
