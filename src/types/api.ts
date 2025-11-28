// Authentication Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        user: User;
        token: string;
    };
    message: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

// Customer Types
export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    created_at: string;
    updated_at: string;
    total_orders?: number;
    total_spent?: number;
}

export interface CustomerCreateRequest {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface CustomerStats {
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    last_order_date: string | null;
    payment_methods: Record<string, number>;
    order_statuses: Record<string, number>;
    monthly_spending: Array<{
        month: string;
        amount: number;
    }>;
}

// Item Types
export interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    stock_quantity: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ItemCreateRequest {
    name: string;
    description: string;
    price: number;
    category: string;
    stock_quantity: number;
    is_active: boolean;
}

export interface ItemAvailability {
    id: number;
    available: boolean;
    requested_quantity: number;
    available_quantity: number;
}

// Order Types
export type OrderStatus = 'pending' | 'processed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'digital_wallet';
export type DiscountType = 'percentage' | 'fixed';

export interface OrderItem {
    id?: number;
    item_id: number;
    quantity: number;
    unit_price: number;
    subtotal?: number;
    item?: Item;
}

export interface Order {
    id: number;
    order_number: string;
    customer_id: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    is_settled: boolean;
    subtotal: number;
    discount_type: DiscountType | null;
    discount_value: number;
    discount_amount: number;
    total_amount: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    order_items: OrderItem[];
    payments?: Payment[];
}



export interface OrderCreateRequest {
    customer_id: number;
    items: Array<{
        item_id: number;
        quantity: number;
        unit_price: number;
    }>;
    discount_type?: DiscountType;
    discount_value?: number;
    notes?: string;
}

export interface OrderSummary {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    orders_by_status: Record<OrderStatus, number>;
    orders_by_payment_status: Record<PaymentStatus, number>;
    revenue_trend: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
}

// Payment Types
export interface Payment {
    id: number;
    order_id: number;
    amount: number;
    payment_method: PaymentMethod;
    payment_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    order?: {
        id: number;
        order_number: string;
        customer_name: string;
        total_amount: number;
    };
}

export interface PaymentCreateRequest {
    amount: number;
    payment_method: PaymentMethod;
    notes?: string;
    payment_date: string;
}

export interface PaymentSummary {
    total_paid: number;
    total_due: number;
    payment_count: number;
    payments_by_method: Record<PaymentMethod, number>;
}

// Dashboard Types
export interface DashboardData {
    current_period: {
        orders: {
            total: number;
            pending: number;
            processed: number;
            completed: number;
            cancelled: number;
        };
        revenue: {
            total: number;
            paid: number;
            pending: number;
            settled: number;
            unsettled: number;
            average_order_value: number;
        };
        payments: {
            total_amount: number;
            count: number;
        };
        customers: {
            all: number;
            new: number;
            active: number;
        };
    };
    previous_period: {
        orders: {
            total: number;
            pending: number;
            processed: number;
            completed: number;
            cancelled: number;
        };
        revenue: {
            total: number;
            paid: number;
            pending: number;
            settled: number;
            unsettled: number;
            average_order_value: number;
        };
        payments: {
            total_amount: number;
            count: number;
        };
        customers: {
            new: number;
            active: number;
        };
    };
    trends: {
        orders: {
            total: number;
            pending: number;
            completed: number;
        };
        revenue: {
            total: number;
            settled: number;
            unsettled: number;
            average_order_value: number;
        };
        customers: {
            new: number;
            active: number;
        };
    };
    charts_data: {
        labels: string[];
        orders: number[];
        revenue: number[];
    };
    last_updated: string;
}

export interface RecentActivity {
    id: number;
    type: 'order_created' | 'order_updated' | 'payment_received' | 'customer_created' | 'item_updated';
    description: string;
    user_id: number;
    created_at: string;
    data: Record<string, unknown>;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

// Query Parameters
export interface CustomerFilters extends Record<string, unknown> {
    page?: number;
    per_page?: number;
    search?: string;
    has_orders?: boolean;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    min_orders?: number;
    max_orders?: number;
    min_spent?: number;
    max_spent?: number;
    payment_status?: PaymentStatus;
    order_status?: OrderStatus;
    created_from?: string;
    created_to?: string;
    sort_by?: 'name' | 'email' | 'created_at' | 'total_orders' | 'total_spent';
    sort_order?: 'asc' | 'desc';
}

export interface ItemFilters extends Record<string, unknown> {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    is_active?: boolean;
    min_price?: number;
    max_price?: number;
    min_stock?: number;
    max_stock?: number;
    sort_by?: 'name' | 'price' | 'category' | 'stock_quantity' | 'created_at';
    sort_order?: 'asc' | 'desc';
}

export interface OrderFilters extends Record<string, unknown> {
    page?: number;
    per_page?: number;
    search?: string;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    customer_id?: number;
    min_amount?: number;
    max_amount?: number;
    from_date?: string; // Deprecated
    to_date?: string; // Deprecated
    date_from?: string;
    date_to?: string;
    sort_by?: 'order_number' | 'total_amount' | 'created_at' | 'status';
    sort_order?: 'asc' | 'desc';
}

// Search Types
export interface GlobalSearchResult {
    customers: Customer[];
    items: Item[];
    orders: Order[];
}

export interface SearchSuggestion {
    id: number;
    type: 'customer' | 'item' | 'order';
    title: string;
    subtitle?: string;
}

// Error Logging Types
export interface ErrorLog {
    message: string;
    level: 'error' | 'warning' | 'info' | 'debug';
    context?: Record<string, unknown>;
}