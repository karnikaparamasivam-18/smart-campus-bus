import api from './client';

export const paymentsApi = {
  createOrder: async (bookingId) => {
    const response = await api.post('/payments/create-order', {
      booking_id: bookingId,
    });
    return response.data;
  },

  verifyPayment: async (verifyData) => {
    const response = await api.post('/payments/verify', verifyData);
    return response.data;
  },
};
