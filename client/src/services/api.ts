// import axios from 'axios';

// // Must point to your RENDER backend, NOT Vercel
// export const API_BASE_URL = 
//   import.meta.env.VITE_BACKEND_URL || "https://internship-project-backend-8lwm.onrender.com/api";
// // export const API_BASE_URL = "http://localhost:3000/api";

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;
import axios from 'axios';

// Pointing to your local backend by default for development
export const API_BASE_URL = 
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
// Production Render URL (uncomment when ready to deploy):
// "https://internship-project-backend-8lwm.onrender.com/api";

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