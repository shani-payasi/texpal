import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject token from localStorage if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taxpal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 on protected route, clear user session
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRequest && window.location.pathname !== '/login') {
        localStorage.removeItem('taxpal_token');
        localStorage.removeItem('taxpal_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

