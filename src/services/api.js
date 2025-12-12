import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  return config
})

export default api
