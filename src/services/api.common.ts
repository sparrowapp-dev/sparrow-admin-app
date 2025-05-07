import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { writable } from 'svelte/store';

// Response interface - matches AxiosResponse but with isSuccess added
export interface HttpClientResponseInterface<T = any> extends Omit<AxiosResponse<T>, 'data'> {
  data: T;
  isSuccess: boolean;
}

// Error interface
export interface HttpClientErrorInterface {
  message: string;
  status?: number;
  data?: any;
}

// Default config for axios
const DEFAULT_CONFIG: AxiosRequestConfig = {
  // Vite environment variable access
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
};

// Create HTTP Client class
export class HttpClient {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig = {}) {
    this.instance = axios.create({
      ...DEFAULT_CONFIG,
      ...config,
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Get token from localStorage or other state management
        const token = localStorage.getItem('accessToken');

        // If token exists, add it to the headers
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - we'll handle success manually
    // in each method to properly type the responses
    this.instance.interceptors.response.use((response) => response, this.handleError);
  }

  private handleSuccess<T>(response: AxiosResponse<T>): HttpClientResponseInterface<T> {
    return {
      ...response,
      isSuccess: true,
    };
  }

  private handleError(error: any): Promise<HttpClientErrorInterface> {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorResponse: HttpClientErrorInterface = {
        message: error.response.data?.message || 'Server error',
        status: error.response.status,
        data: error.response.data,
      };

      // Handle specific status codes if needed
      if (error.response.status === 401) {
        // Handle unauthorized - maybe redirect to login
        console.error('Unauthorized access, please login again');
        localStorage.removeItem('token');
        // Optionally redirect to login page
        // window.location.href = '/login';
      }

      return Promise.reject(errorResponse);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({
        message: error.message || 'Unknown error occurred',
      });
    }
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<HttpClientResponseInterface<T>> {
    const response = await this.instance.get<T>(url, config);
    return this.handleSuccess(response);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<HttpClientResponseInterface<T>> {
    const response = await this.instance.post<T>(url, data, config);
    return this.handleSuccess(response);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<HttpClientResponseInterface<T>> {
    const response = await this.instance.put<T>(url, data, config);
    return this.handleSuccess(response);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<HttpClientResponseInterface<T>> {
    const response = await this.instance.delete<T>(url, config);
    return this.handleSuccess(response);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<HttpClientResponseInterface<T>> {
    const response = await this.instance.patch<T>(url, data, config);
    return this.handleSuccess(response);
  }
}

// Create a singleton instance
export const httpClient = new HttpClient();

// Helper function for making requests (used in your service classes)
export const makeRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<HttpClientResponseInterface> => {
  // Check if the endpoint is an absolute URL (starts with http:// or https://)
  const isAbsoluteUrl = /^https?:\/\//i.test(endpoint);

  // If it's an absolute URL, we need to use it directly without baseURL
  const requestConfig: AxiosRequestConfig = {
    ...config,
    ...(isAbsoluteUrl ? { baseURL: '' } : {}),
  };

  switch (method) {
    case 'GET':
      return httpClient.get(endpoint, requestConfig);
    case 'POST':
      return httpClient.post(endpoint, data, requestConfig);
    case 'PUT':
      return httpClient.put(endpoint, data, requestConfig);
    case 'DELETE':
      return httpClient.delete(endpoint, requestConfig);
    case 'PATCH':
      return httpClient.patch(endpoint, data, requestConfig);
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};

export function createQuery<T>(fetchFn: () => Promise<T>) {
  const data = writable<T | null>(null);
  const isFetching = writable(true);
  const isError = writable(false);
  const error = writable<any>(null);

  const refetch = async () => {
    isFetching.set(true);
    isError.set(false);
    error.set(null);

    try {
      const result = await fetchFn();
      data.set(result);
    } catch (err) {
      isError.set(true);
      error.set(err);
    } finally {
      isFetching.set(false);
    }
  };

  // Trigger on first load
  refetch();

  return {
    data,
    isFetching,
    isError,
    error,
    refetch,
  };
}
