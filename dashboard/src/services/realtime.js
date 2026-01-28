// Real-time Updates Service
import io from 'socket.io-client';
import config from '../config/production';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.websocket.maxReconnectAttempts;
    this.eventHandlers = new Map();
    this.subscriptions = new Set();
  }

  async connect(token) {
    try {
      this.socket = io(config.websocket.url, {
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

    this.socket.on('user:connected', (data) => {
      this.handleUserConnected(data);
    });

    this.socket.on('user:disconnected', (data) => {
      this.handleUserDisconnected(data);
    });
  }

  subscribeToDefaultEvents() {
    // Subscribe to dashboard-wide events
    this.subscribe('data:updated');
    this.subscribe('visit:updated');
    this.subscribe('user:connected');
    this.subscribe('user:disconnected');
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
    this.emit('dashboard:data-updated', data);
  }

  handleVisitUpdate(data) {
    console.log('📍 Visit updated:', data);
    this.emit('dashboard:visit-updated', data);
  }

  handleUserConnected(data) {
    console.log('👤 User connected:', data);
    this.emit('dashboard:user-connected', data);
  }

  handleUserDisconnected(data) {
    console.log('👤 User disconnected:', data);
    this.emit('dashboard:user-disconnected', data);
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
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;
