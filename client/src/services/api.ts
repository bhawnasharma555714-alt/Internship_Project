import axios from "axios";

const api = axios.create({
  baseURL: "https://internship-project-backend-8lwm.onrender.com/api",
  //baseURL: "http://localhost:3000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;