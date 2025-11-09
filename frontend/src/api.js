import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5000/api' })

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
