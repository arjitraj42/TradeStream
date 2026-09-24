import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderService = {
  /**
   * Submit Buy/Sell order to POST /api/orders
   * @param {Object} orderPayload { symbol, companyName, side: 'BUY'|'SELL', orderType: 'LIMIT'|'MARKET', price: number, quantity: number }
   */
  async placeOrder(orderPayload) {
    try {
      const response = await api.post('/orders', orderPayload);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to place order';
      throw new Error(errorMsg);
    }
  },

  /**
   * Fetch current market context for live stock metrics
   */
  async getMarketContext() {
    try {
      const response = await api.get('/context');
      return response.data;
    } catch (error) {
      console.warn('Using fallback context:', error.message);
      return {
        success: true,
        data: {
          currentPrice: 105.20,
          previousPrice: 102.73,
          priceChangePercent: 2.4,
        },
      };
    }
  },
};
