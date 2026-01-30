import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://regional-officer-backend.onrender.com');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/api/login', { username, password });
    return response.data;
  }
};

// Cases API
export const casesAPI = {
  getAll: async () => {
    const response = await api.get('/api/cases');
    return response.data;
  },
  
  create: async (caseData) => {
    const response = await api.post('/api/cases', caseData);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/api/cases/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/cases/${id}`);
    return response.data;
  }
};

// Hospitals API
export const hospitalsAPI = {
  getAll: async () => {
    const response = await api.get('/api/hospitals');
    return response.data;
  },
  
  create: async (hospitalData) => {
    const response = await api.post('/api/hospitals', hospitalData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/hospitals/${id}`);
    return response.data;
  }
};

// Meetings API
export const meetingsAPI = {
  getAll: async () => {
    const response = await api.get('/api/meetings');
    return response.data;
  },
  
  create: async (meetingData) => {
    const response = await api.post('/api/meetings', meetingData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/meetings/${id}`);
    return response.data;
  }
};

// Documents API
export const documentsAPI = {
  getAll: async () => {
    const response = await api.get('/api/documents');
    return response.data;
  },
  
  create: async (documentData) => {
    const response = await api.post('/api/documents', documentData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/documents/${id}`);
    return response.data;
  }
};

// Team Updates API
export const teamUpdatesAPI = {
  getAll: async () => {
    const response = await api.get('/api/team-updates');
    return response.data;
  },
  
  create: async (message) => {
    const response = await api.post('/api/team-updates', { message });
    return response.data;
  }
};

export default api;