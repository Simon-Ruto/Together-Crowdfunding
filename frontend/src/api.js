import axios from 'axios'

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const API = axios.create({ baseURL: API_BASE_URL })

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

API.interceptors.response.use(null, error => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token')
    // optional: redirect to login
    try { window.location.href = '/login' } catch(e){}
  }
  return Promise.reject(error)
})

export default API
