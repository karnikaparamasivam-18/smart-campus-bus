import api from './client';

export const routesApi = {
  getRoutes: async () => {
    const response = await api.get('/routes/');
    return response.data;
  },

  getRouteById: async (id) => {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  },

  createRoute: async (routeData) => {
    const response = await api.post('/routes/', routeData);
    return response.data;
  },

  updateRoute: async (id, routeData) => {
    const response = await api.put(`/routes/${id}`, routeData);
    return response.data;
  },

  deleteRoute: async (id) => {
    const response = await api.delete(`/routes/${id}`);
    return response.data;
  },
};

