import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Only set Content-Type for non-FormData requests
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config
})

export default api
