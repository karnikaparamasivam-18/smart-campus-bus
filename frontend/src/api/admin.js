import api from './client';

export const adminApi = {
  getSummary: async () => {
    const response = await api.get('/admin/reports/summary');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
};
