import api from './api';

export const alertService = {
  getAll: async () => {
    const response = await api.get('/alerts');
    return response.data;
  },

  markRead: async (id) => {
    const response = await api.put(`/alerts/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.put('/alerts/read-all');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },
};

