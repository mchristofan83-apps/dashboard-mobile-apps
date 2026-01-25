import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
};

// Dashboard API
export const dashboardAPI = {
  getMyDashboard: () => api.get('/dashboard/my-dashboard'),
  getStats: () => api.get('/dashboard/stats'),
};

// Visit API
export const visitAPI = {
  getMD: () => api.get('/visits/md'),
  getSales: () => api.get('/visits/sales'),
  getByDate: (date, type) => api.get(`/visits/${type}`, { params: { date } }),
  getPlanVisits: (params) => api.get('/visits/plan', { params }),
  submitAbsen: (formData) => api.post('/visits/absen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  submitVisitAction: (formData) => api.post('/visit-actions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Visit Action API
export const visitActionAPI = {
  start: (data) => api.post('/visit-actions/start', data),
  
  checkin: (data) => api.post('/visit-actions/checkin', data),
  
  uploadPhoto: async (uri, photoType, actionId) => {
    const formData = new FormData();
    
    // Create file object from URI
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('photo', {
      uri,
      name: filename,
      type,
    });
    formData.append('photo_type', photoType);
    formData.append('action_id', actionId);
    
    return api.post('/visit-actions/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updateStatus: (data) => api.post('/visit-actions/update-status', data),
  
  checkout: (data) => api.post('/visit-actions/checkout', data),
  
  getAll: () => api.get('/visit-actions'),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
};

// Outlet API
export const outletAPI = {
  getAll: () => api.get('/outlets'),
  getById: (id) => api.get(`/outlets/${id}`),
};

export default api;
