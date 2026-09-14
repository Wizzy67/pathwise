import axios from 'axios';

const RENDER_BACKEND_URL = 'https://pathwise-u2re.onrender.com/api';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    // If running on Vercel or any non-local domain, use the live Render backend
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('172.') || host.startsWith('10.');
    if (!isLocal || host.includes('vercel.app')) {
      return RENDER_BACKEND_URL;
    }
    return `${window.location.protocol}//${host}:5000/api`;
  }
  return RENDER_BACKEND_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
