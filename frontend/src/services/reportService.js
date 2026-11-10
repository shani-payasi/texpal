import api from './api';

export const reportService = {
  generate: async (data) => {
    const response = await api.post('/reports/generate', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  getDownloadUrl: (id) => {
    return `/api/reports/${id}/download`;
  },
};

