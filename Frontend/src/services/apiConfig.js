/**
 * Centralized API Config for TradeStream Frontend
 * - On Vercel: uses relative '/api' (same origin serverless functions)
 * - If VITE_API_BASE_URL is set: uses custom backend URL
 */

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl() ? `${getApiBaseUrl()}/api` : '/api';
