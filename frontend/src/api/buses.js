import api from './client';

export const busesApi = {
  getBuses: async () => {
    const response = await api.get('/buses/');
    return response.data;
  },

  createBus: async (busData) => {
    const response = await api.post('/buses/', busData);
    return response.data;
  },

  updateBus: async (busId, busData) => {
    const response = await api.put(`/buses/${busId}`, busData);
    return response.data;
  },

  deleteBus: async (busId) => {
    const response = await api.delete(`/buses/${busId}`);
    return response.data;
  },
};

