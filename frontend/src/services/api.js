import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Metrics API
export const metricsAPI = {
  getCurrent: () => api.get('/metrics/current'),
  getSystemInfo: () => api.get('/metrics/system-info')
};

// Logs API
export const logsAPI = {
  getAccess: (limit = 50) => api.get(`/logs/access?limit=${limit}`),
  getErrors: (limit = 20) => api.get(`/logs/errors?limit=${limit}`),
  getStats: () => api.get('/logs/stats')
};

// Deployment API
export const deploymentAPI = {
  getCurrent: () => api.get('/deployment/current'),
  getHistory: () => api.get('/deployment/history'),
  getHealth: () => api.get('/deployment/health'),
  update: (data) => api.post('/deployment/update', data)
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
