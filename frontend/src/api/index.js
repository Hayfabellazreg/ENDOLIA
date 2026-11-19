import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const checkHealth = () => api.get('/health')
export const getUsers = () => api.get('/users')
export const createUser = (data) => api.post('/users', data)

// Endpoints IA YOLOv8
export const analyzeUpload = (formData) => api.post('/analyze/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})

export const analyzeSample = (patientId = 'P001', conf = 0.25) => {
  const params = new URLSearchParams()
  params.append('patient_id', patientId)
  params.append('conf', conf.toString())
  return api.post('/analyze/sample', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export const getAnalysisStatus = (taskId) => api.get(`/status/${taskId}`)
export const getPdfUrl = (taskId) => `/api/pdf/${taskId}`
export const getVideoUrl = (taskId) => `/api/video/${taskId}`

export default api
