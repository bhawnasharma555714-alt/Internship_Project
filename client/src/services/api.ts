import axios from 'axios';

// Dynamically fallback to Render backend if VITE_BACKEND_URL is not set
export const API_BASE_URL = 
  import.meta.env.VITE_BACKEND_URL || "https://internship-project-backend-8lwm.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    // Make sure 'token' matches the exact key name used when saving after login
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;