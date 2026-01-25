import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getUsers: () => api.get('/auth/users'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  uploadExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const outletAPI = {
  getAll: () => api.get('/outlets'),
  getById: (id) => api.get(`/outlets/${id}`),
  create: (data) => api.post('/outlets', data),
  update: (id, data) => api.put(`/outlets/${id}`, data),
  delete: (id) => api.delete(`/outlets/${id}`),
  uploadExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/outlets/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const visitAPI = {
  getMD: () => api.get('/visits/md'),
  getSales: () => api.get('/visits/sales'),
  createMD: (data) => api.post('/visits/md', data),
  createSales: (data) => api.post('/visits/sales', data),
  updateMD: (id, data) => api.put(`/visits/md/${id}`, data),
  updateSales: (id, data) => api.put(`/visits/sales/${id}`, data),
  deleteMD: (id) => api.delete(`/visits/md/${id}`),
  deleteSales: (id) => api.delete(`/visits/sales/${id}`),
};

export const visitActionAPI = {
  start: (data) => api.post('/visit-actions/start', data),
  checkin: (data) => api.post('/visit-actions/checkin', data),
  uploadPhoto: (file, type, actionId) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('photo_type', type);
    formData.append('action_id', actionId);
    return api.post('/visit-actions/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateStatus: (data) => api.post('/visit-actions/update-status', data),
  checkout: (data) => api.post('/visit-actions/checkout', data),
  getAll: () => api.get('/visit-actions'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getMyDashboard: () => api.get('/dashboard/my-dashboard'),
};

export const reportAPI = {
  getDaily: (params) => api.get('/reports/daily', { params }),
  export: (params) => api.get('/reports/export', { params, responseType: 'blob' }),
  getSummary: (params) => api.get('/reports/summary', { params }),
};

export default api;
