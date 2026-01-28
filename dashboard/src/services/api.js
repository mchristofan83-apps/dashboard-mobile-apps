import axios from 'axios';
import config from '../config/environment.js';

// Force localhost for local development
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost ? 'http://localhost:8000' : config.apiUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

// Debug: Log the API URL being used
console.log('🔗 API Service Configuration:', {
  isLocalhost,
  API_URL,
  hostname: window.location.hostname
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors and token cleanup
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Handle rate limiting errors
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded, please try again later');
      // Don't redirect on rate limiting, just let the component handle it
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  getUsers: () => api.get('/api/auth/users'),
  createUser: (data) => api.post('/api/auth/users', data),
  updateUser: (id, data) => api.put(`/api/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/auth/users/${id}`),
};

export const userAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
  uploadExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/users/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const outletAPI = {
  getAll: () => api.get('/api/outlets'),
  getById: (id) => api.get(`/api/outlets/${id}`),
  create: (data) => api.post('/api/outlets', data),
  update: (id, data) => api.put(`/api/outlets/${id}`, data),
  delete: (id) => api.delete(`/api/outlets/${id}`),
  uploadExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/outlets/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const visitAPI = {
  getMD: () => api.get('/api/visits/md'),
  getSales: () => api.get('/api/visits/sales'),
  createMD: (data) => api.post('/api/visits/md', data),
  createSales: (data) => api.post('/api/visits/sales', data),
  updateMD: (id, data) => api.put(`/api/visits/md/${id}`, data),
  updateSales: (id, data) => api.put(`/api/visits/sales/${id}`, data),
  deleteMD: (id) => api.delete(`/api/visits/md/${id}`),
  deleteSales: (id) => api.delete(`/api/visits/sales/${id}`),
  uploadMDExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/visits/md/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadSalesExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/visits/sales/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const visitActionAPI = {
  start: (data) => api.post('/api/visit-actions/start', data),
  checkin: (data) => api.post('/api/visit-actions/checkin', data),
  uploadPhoto: (file, type, actionId) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('photo_type', type);
    formData.append('action_id', actionId);
    return api.post('/api/visit-actions/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateStatus: (data) => api.post('/api/visit-actions/update-status', data),
  checkout: (data) => api.post('/api/visit-actions/checkout', data),
  getAll: () => api.get('/api/visit-actions'),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getMyDashboard: () => api.get('/api/dashboard/my-dashboard'),
};

export const reportAPI = {
  getDaily: (params) => api.get('/api/reports/daily', { params }),
  export: (params) => api.get('/api/reports/export', { params, responseType: 'blob' }),
  getSummary: (params) => api.get('/api/reports/summary', { params }),
};

export default api;
