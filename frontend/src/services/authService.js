import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('taxpal_token', response.data.token);
      localStorage.setItem('taxpal_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('taxpal_token', response.data.token);
      localStorage.setItem('taxpal_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  demoLogin: async () => {
    const response = await api.post('/auth/demo');
    if (response.data.token) {
      localStorage.setItem('taxpal_token', response.data.token);
      localStorage.setItem('taxpal_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('taxpal_token');
      localStorage.removeItem('taxpal_user');
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    if (response.data.user) {
      localStorage.setItem('taxpal_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/reset-password', { token, newPassword });
    return response.data;
  },
};

