import axios from 'axios';

// Vite environment variable with a local fallback
export const API_BASE_URL = 
  import.meta.env.FRONTEND_URL || "https://collabconnect1.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;