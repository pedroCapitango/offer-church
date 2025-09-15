import axios, { AxiosResponse } from 'axios';
import { AuthResponse, User, Payment, PaginatedResponse, FinancialSummary } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    address?: string;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<{ user: User }> = await api.get('/auth/me');
    return response.data.user;
  },

  async updateProfile(userData: {
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<User> {
    const response: AxiosResponse<{ user: User }> = await api.put('/auth/profile', userData);
    return response.data.user;
  },
};

export const paymentService = {
  async submitPayment(formData: FormData): Promise<Payment> {
    const response: AxiosResponse<{ payment: Payment }> = await api.post('/payments/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.payment;
  },

  async getMyPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const response: AxiosResponse<{
      payments: Payment[];
      totalPages: number;
      currentPage: number;
      total: number;
    }> = await api.get('/payments/my-payments', { params });
    return {
      items: response.data.payments,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      total: response.data.total,
    };
  },

  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    memberName?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const response: AxiosResponse<{
      payments: Payment[];
      totalPages: number;
      currentPage: number;
      total: number;
    }> = await api.get('/payments', { params });
    return {
      items: response.data.payments,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      total: response.data.total,
    };
  },

  async validatePayment(paymentId: string, data: {
    status: 'validated' | 'rejected';
    validationNotes?: string;
  }): Promise<Payment> {
    const response: AxiosResponse<{ payment: Payment }> = await api.put(`/payments/${paymentId}/validate`, data);
    return response.data.payment;
  },

  async getPaymentDetails(paymentId: string): Promise<Payment> {
    const response: AxiosResponse<{ payment: Payment }> = await api.get(`/payments/${paymentId}`);
    return response.data.payment;
  },

  async downloadReceipt(paymentId: string): Promise<any> {
    const response = await api.get(`/payments/${paymentId}/receipt`);
    return response.data;
  },
};

export const reportService = {
  async getFinancialSummary(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<FinancialSummary> {
    const response: AxiosResponse<FinancialSummary> = await api.get('/reports/financial-summary', { params });
    return response.data;
  },

  async getMemberContributions(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any> {
    const response = await api.get('/reports/member-contributions', { params });
    return response.data;
  },

  async getPaymentStatus(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const response = await api.get('/reports/payment-status', { params });
    return response.data;
  },

  async getDashboardStats(): Promise<any> {
    const response = await api.get('/reports/dashboard-stats');
    return response.data;
  },
};

export default api;