import api from './api';

export const taxService = {
  calculate: async (data) => {
    const response = await api.post('/tax/calculate', data);
    return response.data;
  },

  getEstimates: async () => {
    const response = await api.get('/tax/estimates');
    return response.data;
  },

  getEstimateById: async (id) => {
    const response = await api.get(`/tax/estimates/${id}`);
    return response.data;
  },

  getProfiles: async () => {
    const response = await api.get('/tax/profiles');
    return response.data;
  },

  getCalendar: async (country, year) => {
    const params = {};
    if (country) params.country = country;
    if (year) params.year = year;
    const response = await api.get('/tax/calendar', { params });
    return response.data;
  },
};

