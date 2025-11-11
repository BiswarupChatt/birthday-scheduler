// src/api/axiosConfig.js
import axios from "axios";

let currentToken = null; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// exported helper for Jotai → Axios sync
export const setAxiosAuthToken = (token) => {
  currentToken = token;
};

export default api;
