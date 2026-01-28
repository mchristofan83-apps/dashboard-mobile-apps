// Mobile Real-time Service
import io from 'socket.io-client';
import config from '../config/production';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getServerUrl } from '../config/environment';

class MobileRealtimeService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.websocket.maxReconnectAttempts;
    this.eventHandlers = new Map();
    this.subscriptions = new Set();
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(getServerUrl() || config.websocket.url, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✅ Connected to real-time server');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Failed to connect to real-time server:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('🔌 Disconnected from real-time server');
      this.handleReconnect();
    });

    this.socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('✅ Authenticated with real-time server');
        this.subscribeToDefaultEvents();
      } else {
        console.error('❌ Authentication failed:', data.error);
      }
    });

    this.socket.on('data:updated', (data) => {
      this.handleDataUpdate(data);
    });

    this.socket.on('visit:updated', (data) => {
      this.handleVisitUpdate(data);
    });

    this.socket.on('visit:assigned', (data) => {
      this.handleVisitAssigned(data);
    });

    this.socket.on('user:connected', (data) => {
      this.handleUserConnected(data);
    });

    this.socket.on('user:disconnected', (data) => {
      this.handleUserDisconnected(data);
    });

    this.socket.on('sync:required', (data) => {
      this.handleSyncRequired(data);
    });
  }

  subscribeToDefaultEvents() {
    // Subscribe to mobile-specific events
    this.subscribe('data:updated');
    this.subscribe('visit:updated');
    this.subscribe('visit:assigned');
    this.subscribe('user:connected');
    this.subscribe('user:disconnected');
    this.subscribe('sync:required');
  }

  subscribe(event, handler) {
    if (this.socket && this.isConnected) {
      this.socket.on(event, handler || this.handleEvent.bind(this));
      this.subscriptions.add(event);
    }
  }

  unsubscribe(event) {
    if (this.socket) {
      this.socket.off(event);
      this.subscriptions.delete(event);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  handleEvent(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  handleDataUpdate(data) {
    console.log('📊 Data updated:', data);
    this.emit('mobile:data-updated', data);
  }

  handleVisitUpdate(data) {
    console.log('📍 Visit updated:', data);
    this.emit('mobile:visit-updated', data);
  }

  handleVisitAssigned(data) {
    console.log('📍 Visit assigned:', data);
    this.emit('mobile:visit-assigned', data);
  }

  handleUserConnected(data) {
    console.log('👤 User connected:', data);
    this.emit('mobile:user-connected', data);
  }

  handleUserDisconnected(data) {
    console.log('👤 User disconnected:', data);
    this.emit('mobile:user-disconnected', data);
  }

  handleSyncRequired(data) {
    console.log('🔄 Sync required:', data);
    this.emit('mobile:sync-required', data);
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.socket.connect();
      }, config.websocket.reconnectInterval);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event handler management
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions)
    };
  }

  // Mobile-specific methods
  async sendLocationUpdate(location) {
    this.emit('location:update', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: Date.now()
    });
  }

  async sendVisitStatusUpdate(visitId, status, data = {}) {
    this.emit('visit:status-update', {
      visitId,
      status,
      data,
      timestamp: Date.now()
    });
  }

  async sendHeartbeat() {
    this.emit('mobile:heartbeat', {
      timestamp: Date.now(),
      batteryLevel: await this.getBatteryLevel(),
      networkStatus: await this.getNetworkStatus()
    });
  }

  async getBatteryLevel() {
    // Implementation depends on platform
    return 0.8; // Placeholder
  }

  async getNetworkStatus() {
    // Implementation depends on platform
    return 'wifi'; // Placeholder
  }
}

// Create singleton instance
const mobileRealtimeService = new MobileRealtimeService();

export default mobileRealtimeService;
