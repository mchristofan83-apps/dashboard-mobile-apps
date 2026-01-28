// Mobile API Service
import axios from 'axios';
import config from '../config/production';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { getApiUrl } from '../config/environment';

class APIService {
  constructor() {
    this.client = axios.create({
      baseURL: getApiUrl() || config.api.baseURL,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage and redirect to login
          await AsyncStorage.multiRemove(['token', 'user']);
          Alert.alert('Session Expired', 'Please login again');
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials) {
    try {
      const response = await this.client.post('/api/auth/login', credentials);
      if (response.data.success) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Users
  async getUsers() {
    try {
      const response = await this.client.get('/api/users');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      const response = await this.client.post('/api/users', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await this.client.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Outlets
  async getOutlets() {
    try {
      const response = await this.client.get('/api/outlets');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createOutlet(outletData) {
    try {
      const response = await this.client.post('/api/outlets', outletData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOutlet(id, outletData) {
    try {
      const response = await this.client.put(`/api/outlets/${id}`, outletData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Visits
  async getVisits() {
    try {
      const response = await this.client.get('/api/visits');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyVisits() {
    try {
      const response = await this.client.get('/api/visits/my');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createVisit(visitData) {
    try {
      const response = await this.client.post('/api/visits', visitData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateVisit(id, visitData) {
    try {
      const response = await this.client.put(`/api/visits/${id}`, visitData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkinVisit(id, locationData) {
    try {
      const response = await this.client.post(`/api/visits/${id}/checkin`, locationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkoutVisit(id, locationData, photos) {
    try {
      const formData = new FormData();
      formData.append('location', JSON.stringify(locationData));
      
      if (photos && photos.length > 0) {
        photos.forEach((photo, index) => {
          formData.append(`photo_${index}`, {
            uri: photo.uri,
            type: photo.type,
            name: photo.name
          });
        });
      }

      const response = await this.client.post(`/api/visits/${id}/checkout`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Dashboard
  async getDashboardStats() {
    try {
      const response = await this.client.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyDashboard() {
    try {
      const response = await this.client.get('/api/dashboard/my');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // File upload
  async uploadFile(file, type = 'general') {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name
      });
      formData.append('type', type);

      const response = await this.client.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sync
  async syncData() {
    try {
      const response = await this.client.post('/api/sync');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  handleError(error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Server error',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        status: 0
      };
    } else {
      return {
        success: false,
        message: error.message || 'Unknown error occurred',
        status: 0
      };
    }
  }

  async isOnline() {
    try {
      const response = await this.client.get('/api/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;
