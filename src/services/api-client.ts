import { validateEnvironmentVariables } from '../utils/validation';

validateEnvironmentVariables(['VITE_API_URL']);

const API_URL = import.meta.env.VITE_API_URL;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options;
  
  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => 
      url.searchParams.append(key, value)
    );
  }

  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
    credentials: 'include',
  });

  return handleResponse<T>(response);
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  put: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};