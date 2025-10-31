import { apiClient } from '../lib/api-client';
import type {
    LoginRequest,
    LoginResponse,
    User,
    Customer,
    CustomerCreateRequest,
    CustomerStats,
    CustomerFilters,
    Item,
    ItemCreateRequest,
    ItemFilters,
    Order,
    OrderCreateRequest,
    OrderFilters,
    OrderSummary,
    Payment,
    PaymentCreateRequest,
    PaymentSummary,
    DashboardData,
    RecentActivity,
    GlobalSearchResult,
    SearchSuggestion,
    ErrorLog,
    ApiResponse,
    PaginatedResponse,
    ItemAvailability,
} from '../types/api';

// Authentication API
export const authApi = {
    login: (data: LoginRequest): Promise<LoginResponse> =>
        apiClient.post('/auth/login', data),

    getCurrentUser: (): Promise<ApiResponse<User>> =>
        apiClient.get('/auth/me'),

    logout: (): Promise<ApiResponse<{ message: string }>> =>
        apiClient.post('/auth/logout'),

    getUser: (): Promise<User> =>
        apiClient.get('/user'),
};

// Customer API
export const customerApi = {
    getAll: (filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> =>
        apiClient.get('/admin/customers', filters),

    getById: (id: number): Promise<ApiResponse<Customer>> =>
        apiClient.get(`/admin/customers/${id}`),

    create: (data: CustomerCreateRequest): Promise<ApiResponse<Customer>> =>
        apiClient.post('/admin/customers', data),

    update: (id: number, data: CustomerCreateRequest): Promise<ApiResponse<Customer>> =>
        apiClient.put(`/admin/customers/${id}`, data),

    delete: (id: number): Promise<ApiResponse<{ message: string }>> =>
        apiClient.delete(`/admin/customers/${id}`),

    softDelete: (id: number): Promise<ApiResponse<{ message: string }>> =>
        apiClient.delete(`/admin/customers/${id}/soft-delete`),

    getStatistics: (id: number): Promise<ApiResponse<CustomerStats>> =>
        apiClient.get(`/admin/customers/${id}/statistics`),

    search: (params: {
        query: string;
        has_orders?: boolean;
        min_spent?: number;
        max_spent?: number;
    }): Promise<PaginatedResponse<Customer>> =>
        apiClient.get('/admin/search/customers', params),
};

// Item API
export const itemApi = {
    getAll: (filters?: ItemFilters): Promise<PaginatedResponse<Item>> =>
        apiClient.get('/admin/items', filters),

    getById: (id: number): Promise<ApiResponse<Item>> =>
        apiClient.get(`/admin/items/${id}`),

    create: (data: ItemCreateRequest): Promise<ApiResponse<Item>> =>
        apiClient.post('/admin/items', data),

    update: (id: number, data: ItemCreateRequest): Promise<ApiResponse<Item>> =>
        apiClient.put(`/admin/items/${id}`, data),

    delete: (id: number): Promise<ApiResponse<{ message: string }>> =>
        apiClient.delete(`/admin/items/${id}`),

    getCategories: (): Promise<ApiResponse<string[]>> =>
        apiClient.get('/admin/items-categories'),

    updateStock: (id: number, data: {
        stock_quantity: number;
        operation: 'set' | 'add' | 'subtract';
    }): Promise<ApiResponse<Item>> =>
        apiClient.put(`/admin/items/${id}/stock`, data),

    checkAvailability: (items: Array<{ id: number; quantity: number }>): Promise<ApiResponse<ItemAvailability[]>> =>
        apiClient.post('/admin/items/check-availability', { items }),

    getLowStock: (threshold?: number): Promise<ApiResponse<Item[]>> =>
        apiClient.get('/admin/items-low-stock', { threshold }),

    search: (params: {
        query: string;
        category?: string;
        min_price?: number;
        max_price?: number;
    }): Promise<PaginatedResponse<Item>> =>
        apiClient.get('/admin/search/items', params),
};

// Order API
export const orderApi = {
    getAll: (filters?: OrderFilters): Promise<PaginatedResponse<Order>> =>
        apiClient.get('/admin/orders', filters),

    getById: (id: number): Promise<ApiResponse<Order>> =>
        apiClient.get(`/admin/orders/${id}`),

    create: (data: OrderCreateRequest): Promise<ApiResponse<Order>> =>
        apiClient.post('/admin/orders', data),

    update: (id: number, data: OrderCreateRequest): Promise<ApiResponse<Order>> =>
        apiClient.put(`/admin/orders/${id}`, data),

    delete: (id: number): Promise<ApiResponse<{ message: string }>> =>
        apiClient.delete(`/admin/orders/${id}`),

    getSummary: (params?: {
        period?: 'day' | 'week' | 'month' | 'year';
        status?: string;
        from_date?: string;
        to_date?: string;
    }): Promise<ApiResponse<OrderSummary>> =>
        apiClient.get('/admin/orders-summary', params),

    updateStatus: (id: number, data: {
        status: string;
        notes?: string;
    }): Promise<ApiResponse<Order>> => apiClient.put(`/admin/orders/${id}/status`, data),

    updatePaymentStatus: (id: number, data: {
        payment_status: string;
        notes?: string;
    }): Promise<ApiResponse<Order>> =>
        apiClient.put(`/admin/orders/${id}/payment-status`, data),

    updateSettled: (id: number, data: {
        is_settled: boolean;
    }): Promise<ApiResponse<Order>> =>
        apiClient.put(`/admin/orders/${id}/settled`, data),

    search: (params: {
        query: string;
        customer_id?: number;
        status?: string;
        from_date?: string;
        to_date?: string;
    }): Promise<PaginatedResponse<Order>> =>
        apiClient.get('/admin/search/orders', params),
};

// Payment API
export const paymentApi = {
    getOrderPayments: (orderId: number): Promise<ApiResponse<Payment[]>> =>
        apiClient.get(`/admin/orders/${orderId}/payments`),

    getPayment: (orderId: number, paymentId: number): Promise<ApiResponse<Payment>> =>
        apiClient.get(`/admin/orders/${orderId}/payments/${paymentId}`),

    create: (orderId: number, data: PaymentCreateRequest): Promise<ApiResponse<Payment>> =>
        apiClient.post(`/admin/orders/${orderId}/payments`, data),

    update: (orderId: number, paymentId: number, data: PaymentCreateRequest): Promise<ApiResponse<Payment>> =>
        apiClient.put(`/admin/orders/${orderId}/payments/${paymentId}`, data),

    delete: (orderId: number, paymentId: number): Promise<ApiResponse<{ message: string }>> =>
        apiClient.delete(`/admin/orders/${orderId}/payments/${paymentId}`),

    getSummary: (orderId: number): Promise<ApiResponse<PaymentSummary>> =>
        apiClient.get(`/admin/orders/${orderId}/payments/summary`),
};

// Dashboard API
export const dashboardApi = {
    getData: (): Promise<ApiResponse<DashboardData>> =>
        apiClient.get('/admin/dashboard'),

    getRecentActivity: (limit?: number): Promise<ApiResponse<RecentActivity[]>> =>
        apiClient.get('/admin/dashboard/recent-activity', { limit }),
};

// Search API
export const searchApi = {
    global: (params: {
        query: string;
        limit?: number;
    }): Promise<ApiResponse<GlobalSearchResult>> =>
        apiClient.get('/admin/search/global', params),

    suggestions: (params: {
        query: string;
        type?: 'items' | 'customers' | 'orders' | 'all';
    }): Promise<ApiResponse<SearchSuggestion[]>> =>
        apiClient.get('/admin/search/suggestions', params),
};

// Error Logging API
export const errorApi = {
    log: (data: ErrorLog): Promise<ApiResponse<{ message: string }>> =>
        apiClient.post('/admin/errors', data),

    logBatch: (errors: ErrorLog[]): Promise<ApiResponse<{ message: string }>> =>
        apiClient.post('/admin/errors/batch', { errors }),

    getStats: (params?: {
        period?: 'day' | 'week' | 'month' | 'year';
        level?: string;
    }): Promise<ApiResponse<{
        total_errors: number;
        errors_by_level: Record<string, number>;
        errors_by_day: Array<{ date: string; count: number }>;
    }>> =>
        apiClient.get('/admin/errors/stats', params),

    logPublic: (data: ErrorLog): Promise<ApiResponse<{ message: string }>> =>
        apiClient.post('/errors/public', data),

    healthCheck: (): Promise<ApiResponse<{
        status: string;
        timestamp: string;
        version: string;
    }>> =>
        apiClient.get('/errors/health'),
};