import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

const api = axios.create({
  baseURL: '/api',             
  withCredentials: false,      
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (config.headers && typeof (config.headers as AxiosHeaders).set === 'function') {
      (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;
    }
  }
  return config;
});

export function registerPilot(data: {
  lastName: string;
  firstName: string;
  middleName?: string;
  email: string;
  phone: string;
  password: string;
}) {
  return api.post<{ token: string; }>('/auth/register', data)
    .then(r => {
      localStorage.setItem('token', r.data.token);
      return r.data;
    });
}

export function loginPilot(loginId: string, password: string) {
  return api.post<{ token: string; }>('/auth/login', { loginId, password })
    .then(r => {
      localStorage.setItem('token', r.data.token);
      return r.data;
    });
}

export function getProfile() {
  return api.get('/auth/me').then(r => r.data);
}

export default api;