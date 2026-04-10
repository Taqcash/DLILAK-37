import axios, { AxiosInstance } from 'axios';

/**
 * BaseApiService - العميل الأساسي للتعامل مع Cloudflare Worker API
 * (Encapsulation & Singleton)
 */
class BaseApiService {
  protected api: AxiosInstance;
  private static instance: BaseApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // إضافة الـ JWT Token لكل الطلبات لو موجود
    this.api.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  public static getInstance(): BaseApiService {
    if (!BaseApiService.instance) {
      BaseApiService.instance = new BaseApiService();
    }
    return BaseApiService.instance;
  }

  public get client(): AxiosInstance {
    return this.api;
  }
}

export const api = BaseApiService.getInstance().client;
