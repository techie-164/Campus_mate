import axios from 'axios';

const trimTrailingSlash = (value) => value?.replace(/\/$/, '');

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
);

export const SOCKET_SERVER_URL = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL
);

// Use relative path so Vite proxy can forward requests during development
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
