/**
 * Centralized API Config for TradeStream Frontend
 * Automatically connects to VITE_API_BASE_URL (Vercel Env Var)
 * or defaults seamlessly to https://tradestream-w1ys.onrender.com
 */

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  return 'https://tradestream-w1ys.onrender.com';
};

export const API_BASE_URL = `${getApiBaseUrl()}/api`;
