import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const RENDER_BACKEND_URL = 'https://pathwise-u2re.onrender.com/api';
const LOCAL_WIFI_BACKEND_URL = 'http://172.20.10.7:5000/api';

const getBaseUrl = () => {
  // Check if user specified a custom API endpoint in settings/localStorage
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem('custom_api_url') : null;
  if (customUrl) return customUrl;

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // When running inside native mobile app (Capacitor Android/iOS)
  if (Capacitor.isNativePlatform()) {
    // Default to the online cloud backend
    return RENDER_BACKEND_URL;
  }

  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    const isTunnel = host.includes('loca.lt') || host.includes('trycloudflare') || host.includes('ngrok') || host.includes('pinggy');
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('172.') || host.startsWith('10.');
    
    if (isLocal || isTunnel) {
      return '/api';
    }

    if (host.includes('vercel.app')) {
      return RENDER_BACKEND_URL;
    }
    return '/api';
  }
  return RENDER_BACKEND_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(`[PathWise API] Active backend target: ${getBaseUrl()}`);

// Interceptor to add auth token and log outgoing calls
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📡 [API Call] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
  return config;
});

// Response logger
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Success] ${response.status} from ${response.config.url}`);
    return response;
  },
  async (error) => {
    const config = error.config;
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';

    if (isNetworkError && config) {
      const url = config.url || '';
      console.warn(`[PathWise Mobile] Network unavailable for ${url}. Checking offline fallback...`);

      // Fallback 1: Careers Catalog (Lazy load JSON to avoid bundling overhead)
      if (url.includes('/data/careers')) {
        try {
          const { default: fallbackCareers } = await import('../data/fallbackCareers.json');
          return { data: fallbackCareers, status: 200, statusText: 'OK (Offline Cache)', headers: {}, config };
        } catch (e) {
          console.error('[PathWise] Failed to load offline careers', e);
        }
      }

      // Fallback 2: Quiz Results
      if (url.includes('/quiz/results') && config.method === 'get') {
        const cachedUser = JSON.parse(localStorage.getItem('userProfile') || 'null');
        if (cachedUser) {
          return {
            data: {
              matches: cachedUser?.quizResults || [
                { careerId: 'c_se', id: 'c_se', score: 96 },
                { careerId: 'c_ds', id: 'c_ds', score: 92 },
                { careerId: 'c_cyber', id: 'c_cyber', score: 88 }
              ],
              hollandCode: cachedUser?.hollandCode || 'IRC',
              hollandLabel: cachedUser?.hollandLabel || 'Investigative · Realistic · Conventional',
              riasecScores: cachedUser?.riasecScores || { R: 78, I: 94, A: 50, S: 58, E: 68, C: 84 },
              lastQuizDate: cachedUser?.lastQuizDate || new Date().toISOString()
            },
            status: 200,
            statusText: 'OK (Offline Cache)',
            headers: {},
            config
          };
        }
      }

      // Fallback 3: Submitting Quiz Results
      if (url.includes('/quiz/results') && config.method === 'post') {
        const matches = [
          { careerId: 'c_se', id: 'c_se', score: 96 },
          { careerId: 'c_ds', id: 'c_ds', score: 92 },
          { careerId: 'c_cyber', id: 'c_cyber', score: 88 }
        ];
        return {
          data: {
            matches,
            hollandCode: 'IRC',
            hollandLabel: 'Investigative · Realistic · Conventional',
            riasecScores: { R: 78, I: 94, A: 50, S: 58, E: 68, C: 84 }
          },
          status: 200,
          statusText: 'OK (Offline Handled)',
          headers: {},
          config
        };
      }

      // Fallback 4: Current User Profile / Auth Me (Only return if actually cached in storage!)
      if (url.includes('/auth/me') || url.includes('/users/profile')) {
        const cachedUser = JSON.parse(localStorage.getItem('userProfile') || 'null');
        const token = localStorage.getItem('token');
        if (token && cachedUser) {
          return { data: cachedUser, status: 200, statusText: 'OK (Offline Cache)', headers: {}, config };
        }
      }

      // Fallback 5: AI Advisor Chat
      if (url.includes('/gemini/chat')) {
        return {
          data: {
            reply: "Hello! As your PathWise DELSU Academic Advisor, I recommend focusing on your departmental core courses and career assessment results. In offline mode, your RIASEC recommendations remain accessible on your dashboard!"
          },
          status: 200,
          statusText: 'OK (Offline Intelligence)',
          headers: {},
          config
        };
      }
    }

    return Promise.reject(error);
  }
);

export { RENDER_BACKEND_URL, LOCAL_WIFI_BACKEND_URL };
export default api;
