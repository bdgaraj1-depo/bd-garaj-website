import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
  verify: () => apiClient.get('/auth/verify'),
  register: (username, password) => apiClient.post('/auth/register', { username, password }),
};

// Appointments API
export const appointmentsAPI = {
  create: (data) => apiClient.post('/appointments', data),
  getAll: () => apiClient.get('/appointments'),
  getOne: (id) => apiClient.get(`/appointments/${id}`),
  update: (id, data) => apiClient.put(`/appointments/${id}`, data),
  delete: (id) => apiClient.delete(`/appointments/${id}`),
};

// Blog API
export const blogAPI = {
  getAll: () => apiClient.get('/blog'),
  getOne: (id) => apiClient.get(`/blog/${id}`),
  create: (data) => apiClient.post('/blog', data),
  update: (id, data) => apiClient.put(`/blog/${id}`, data),
  delete: (id) => apiClient.delete(`/blog/${id}`),
};

// Services API
export const servicesAPI = {
  getAll: () => apiClient.get('/services'),
  create: (data) => apiClient.post('/services', data),
  update: (id, data) => apiClient.put(`/services/${id}`, data),
  delete: (id) => apiClient.delete(`/services/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/upload/service-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Features API (Neden BD Garaj)
export const featuresAPI = {
  getAll: () => apiClient.get('/features'),
  create: (data) => apiClient.post('/features', data),
  update: (id, data) => apiClient.put(`/features/${id}`, data),
  delete: (id) => apiClient.delete(`/features/${id}`),
};

// Testimonials API (Müşteri Yorumları)
export const testimonialsAPI = {
  getAll: () => apiClient.get('/testimonials'),
  create: (data) => apiClient.post('/testimonials', data),
  update: (id, data) => apiClient.put(`/testimonials/${id}`, data),
  delete: (id) => apiClient.delete(`/testimonials/${id}`),
};

// FAQs API
export const faqsAPI = {
  getAll: () => apiClient.get('/faqs'),
  create: (data) => apiClient.post('/faqs', data),
  update: (id, data) => apiClient.put(`/faqs/${id}`, data),
  delete: (id) => apiClient.delete(`/faqs/${id}`),
};

// Contact Info API
export const contactAPI = {
  get: () => apiClient.get('/contact-info'),
  update: (data) => apiClient.put('/contact-info', data),
};

// CTA Section API
export const ctaAPI = {
  get: () => apiClient.get('/cta-section'),
  update: (data) => apiClient.put('/cta-section', data),
};

// Products API (OTO-MOTO Alım Satım)
export const productsAPI = {
  getAll: (category = null, status = null) => {
    const params = {};
    if (category) params.category = category;
    if (status) params.status = status;
    return apiClient.get('/products', { params });
  },
  getOne: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/upload/product-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default apiClient;
