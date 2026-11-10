import api from './api';

export const userService = {
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    if (response.data.user) {
      localStorage.setItem('taxpal_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/users/change-password', data);
    return response.data;
  },
};

