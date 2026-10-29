import api from './client';

export const bookingsApi = {
  createBooking: async (routeId, travelDate) => {
    const response = await api.post('/bookings/', {
      route_id: routeId,
      travel_date: travelDate,
    });
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  getAllBookings: async () => {
    const response = await api.get('/admin/bookings');
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },

  scanQR: async (qrToken) => {
    const response = await api.post('/bookings/scan', {
      qr_token: qrToken,
    });
    return response.data;
  },
};

