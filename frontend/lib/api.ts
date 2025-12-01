import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API Service methods
export const shareCertificateAPI = {
  create: (data: any) => api.post('/share-certificate', data),
  getStatus: (ackNo: string) => api.get(`/share-certificate/status/${ackNo}`),
  getAll: () => api.get('/share-certificate'),
  getById: (id: string) => api.get(`/share-certificate/${id}`),
  update: (id: string, data: any) => api.put(`/share-certificate/${id}`, data),
  delete: (id: string) => api.delete(`/share-certificate/${id}`),
};

export const nominationAPI = {
  create: (data: any) => api.post('/nomination', data),
  getStatus: (ackNo: string) => api.get(`/nomination/status/${ackNo}`),
  getAll: () => api.get('/nomination'),
  getById: (id: string) => api.get(`/nomination/${id}`),
  update: (id: string, data: any) => api.put(`/nomination/${id}`, data),
  delete: (id: string) => api.delete(`/nomination/${id}`),
};

export const uploadAPI = {
  upload: (formData: FormData) =>
    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  delete: (key: string) => api.delete('/upload', { data: { key } }),
};

export const adminAPI = {
  login: (data: { username: string; password: string }) =>
    api.post('/admin/login', data),
  getProfile: () => api.get('/admin/profile'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  sendNotification: (data: any) => api.post('/admin/send-notification', data),
  exportShareCertificates: () =>
    api.get('/admin/export/share-certificates', { responseType: 'blob' }),
  exportNominations: () =>
    api.get('/admin/export/nominations', { responseType: 'blob' }),
};
