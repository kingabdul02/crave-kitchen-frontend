import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor to handle errors globally
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error: AxiosError) => {
                this.handleResponseError(error);
                return Promise.reject(error);
            }
        );
    }

    private handleResponseError(error: AxiosError) {
        const { response } = error;

        if (!response) {
            toast.error('Network error. Please check your connection.');
            return;
        }

        const { status } = response;

        switch (status) {
            case 401:
                // Unauthorized - clear auth and redirect to login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                toast.error('Session expired. Please log in again.');
                break;
            case 403:
                toast.error('You do not have permission to perform this action.');
                break;
            case 404:
                toast.error('The requested resource was not found.');
                break;
            case 422:
                // Validation errors - let individual components handle these
                break;
            case 500:
                toast.error('Server error. Please try again later.');
                break;
            default:
                toast.error('An unexpected error occurred.');
        }
    }

    // GET request
    async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
        const response = await this.client.get<T>(url, { params });
        return response.data;
    }

    // POST request
    async post<T>(url: string, data?: unknown): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    // PUT request
    async put<T>(url: string, data?: unknown): Promise<T> {
        const response = await this.client.put<T>(url, data);
        return response.data;
    }

    // DELETE request
    async delete<T>(url: string): Promise<T> {
        const response = await this.client.delete<T>(url);
        return response.data;
    }

    // Set auth token
    setAuthToken(token: string) {
        localStorage.setItem('auth_token', token);
    }

    // Clear auth token
    clearAuthToken() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    }

    // Get auth token
    getAuthToken(): string | null {
        return localStorage.getItem('auth_token');
    }
}

export const apiClient = new ApiClient();