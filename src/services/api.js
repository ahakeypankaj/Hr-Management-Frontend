import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  // baseURL: 'https://hr-management-backend-2.onrender.com/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠️ No authToken found in localStorage");
  }
  // Don't set Content-Type for FormData, let browser set it with boundary
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  } else {
    console.log("📤 FormData detected, letting browser set Content-Type with boundary");
  }
  
  // Log request details for onboarding/create endpoint
  if (config.url === '/onboard/create') {
    console.log("=== Request Interceptor: /onboard/create ===");
    console.log("Full URL:", `${config.baseURL}${config.url}`);
    console.log("Method:", config.method);
    console.log("Has Authorization:", !!config.headers.Authorization);
    console.log("Content-Type:", config.headers['Content-Type'] || 'multipart/form-data (auto-set by browser)');
  }
  
  return config
})

export default api
