import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  ShoppingCart,
  AlertCircle,
  Filter,
  X,
  RefreshCw,
  Edit,
  CheckCircle,
  MoreVertical,
  CreditCard,
} from 'lucide-react';
import { orderApi, paymentApi } from '../services/api';
import type { Order, OrderCreateRequest, OrderFilters, OrderStatus, PaymentCreateRequest } from '../types/api';
import { OrderModal } from '../components/OrderModal';
import { PaymentModal } from '../components/PaymentModal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { OrderStatusDialog } from '../components/OrderStatusDialog';
import { OrderSettlementDialog } from '../components/OrderSettlementDialog';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useToast } from '../components/Toast';

export const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<OrderFilters>({
    per_page: 15,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

  // Fetch orders
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', currentPage, search, filters],
    queryFn: async () => {
      const params: OrderFilters = {
        ...filters,
        page: currentPage,
        search: search || undefined,
      };
      const response = await orderApi.getAll(params);
      return response;
    },
    staleTime: 0,
    gcTime: 0, // Don't cache order data
    refetchOnMount: 'always',
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: OrderCreateRequest) => orderApi.create(data),
    onSuccess: async () => {
      // Invalidate all order queries to refetch fresh data from backend
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Invalidate dashboard to update stats
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsCreateModalOpen(false);
      addToast({
        type: 'success',
        title: 'Order Created',
        message: 'Order has been created successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create order.',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrderCreateRequest }) =>
      orderApi.update(id, data),
    onSuccess: async () => {
      // Invalidate all order queries to refetch fresh data from backend
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Invalidate dashboard to update stats
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsEditModalOpen(false);
      setSelectedOrder(null);
      addToast({
        type: 'success',
        title: 'Order Updated',
        message: 'Order has been updated successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update order.',
      });
    },
  });

  // Update settlement mutation
  const updateSettlementMutation = useMutation({
    mutationFn: ({ id, is_settled }: { id: number; is_settled: boolean }) =>
      orderApi.updateSettled(id, { is_settled }),
    onSuccess: async () => {
      // Invalidate all order queries to refetch fresh data from backend
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Invalidate dashboard to update stats
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsSettlementDialogOpen(false);
      setSelectedOrder(null);
      addToast({
        type: 'success',
        title: 'Settlement Updated',
        message: 'Order settlement status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update settlement status.',
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: OrderStatus; notes?: string }) =>
      orderApi.updateStatus(id, { status, notes }),
    onSuccess: async () => {
      // Invalidate all order queries to refetch fresh data from backend
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Invalidate dashboard to update stats
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsStatusDialogOpen(false);
      setSelectedOrder(null);
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: 'Order status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update order status.',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => orderApi.delete(id),
    onSuccess: async () => {
      // Invalidate all order queries to refetch fresh data from backend
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Invalidate dashboard to update stats
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      addToast({
        type: 'success',
        title: 'Order Deleted',
        message: 'Order has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete order.',
      });
    },
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: PaymentCreateRequest }) =>
      paymentApi.create(orderId, data),
    onSuccess: async () => {
      // Invalidate all order queries to refetch fresh data from backend
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsPaymentModalOpen(false);
      setSelectedOrderForPayment(null);
      addToast({
        type: 'success',
        title: 'Payment Recorded',
        message: 'Payment has been recorded successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to record payment.',
      });
    },
  });

  // Handlers
  const handleCreateSubmit = (data: OrderCreateRequest) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: OrderCreateRequest) => {
    if (selectedOrder) {
      updateMutation.mutate({ id: selectedOrder.id, data });
    }
  };

  const handleStatusUpdate = (status: OrderStatus, notes?: string) => {
    if (selectedOrder) {
      updateStatusMutation.mutate({ id: selectedOrder.id, status, notes });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedOrder) {
      deleteMutation.mutate(selectedOrder.id);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateSettlement = (order: Order) => {
    setSelectedOrder(order);
    setIsSettlementDialogOpen(true);
  };

  const handleSettlementUpdate = (isSettled: boolean) => {
    if (selectedOrder) {
      updateSettlementMutation.mutate({ id: selectedOrder.id, is_settled: isSettled });
    }
  };

  const handleDelete = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleRecordPayment = (order: Order) => {
    setSelectedOrderForPayment(order);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (orderId: number, data: PaymentCreateRequest) => {
    createPaymentMutation.mutate({ orderId, data });
  };

  const handleFilterChange = (key: keyof OrderFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      per_page: 15,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.status ||
    filters.payment_status ||
    filters.customer_id ||
    filters.min_amount ||
    filters.max_amount ||
    filters.from_date ||
    filters.to_date;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'processed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'partially_paid':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage customer orders and track their status
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${hasActiveFilters
              ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={filters.payment_status || ''}
                  onChange={(e) => handleFilterChange('payment_status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Amount (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.min_amount || ''}
                  onChange={(e) =>
                    handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Amount (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1000.00"
                  value={filters.max_amount || ''}
                  onChange={(e) =>
                    handleFilterChange('max_amount', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.from_date || ''}
                  onChange={(e) => handleFilterChange('from_date', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.to_date || ''}
                  onChange={(e) => handleFilterChange('to_date', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sort_by || 'created_at'}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="created_at">Date Created</option>
                  <option value="order_number">Order Number</option>
                  <option value="total_amount">Total Amount</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort Order
                </label>
                <select
                  value={filters.sort_order || 'desc'}
                  onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Error loading orders
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please try again later or contact support if the problem persists.
              </p>
            </div>
          </div>
        ) : !data?.data.length ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No orders found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Get started by creating your first order.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Settlement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.data.map((order: Order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.order_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.customer?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ₦{Number(order.total_amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.is_settled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}
                        >
                          {order.is_settled ? 'Settled' : 'Unsettled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative dropdown-container">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Actions
                            <MoreVertical className="ml-2 h-4 w-4" />
                          </button>

                          {openDropdownId === order.id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1" role="menu">
                                <button
                                  onClick={() => {
                                    handleViewDetails(order);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                  role="menuitem"
                                >
                                  <Eye className="h-4 w-4 mr-3 text-blue-500" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    handleUpdateStatus(order);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                  role="menuitem"
                                >
                                  <RefreshCw className="h-4 w-4 mr-3 text-green-500" />
                                  Update Status
                                </button>
                                <button
                                  onClick={() => {
                                    handleUpdateSettlement(order);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                  role="menuitem"
                                >
                                  <CheckCircle className="h-4 w-4 mr-3 text-purple-500" />
                                  Update Settlement
                                </button>
                                {order.payment_status !== 'paid' &&
                                  order.payment_status !== 'refunded' && (
                                    <button
                                      onClick={() => {
                                        handleRecordPayment(order);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                      role="menuitem"
                                    >
                                      <CreditCard className="h-4 w-4 mr-3 text-indigo-500" />
                                      Record Payment
                                    </button>
                                  )}
                                <button
                                  onClick={() => {
                                    handleEdit(order);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                  role="menuitem"
                                >
                                  <Edit className="h-4 w-4 mr-3 text-yellow-500" />
                                  Edit Order
                                </button>
                                <div className="border-t border-gray-200 dark:border-gray-600"></div>
                                <button
                                  onClick={() => {
                                    handleDelete(order);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                  role="menuitem"
                                >
                                  <Trash2 className="h-4 w-4 mr-3" />
                                  Delete Order
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.meta && data.meta.last_page > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(data.meta.last_page, p + 1))
                    }
                    disabled={currentPage === data.meta.last_page}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{data.meta.from}</span> to{' '}
                      <span className="font-medium">{data.meta.to}</span> of{' '}
                      <span className="font-medium">{data.meta.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: data.meta.last_page }, (_, i) => i + 1)
                        .filter((page) => {
                          const distance = Math.abs(page - currentPage);
                          return (
                            distance === 0 ||
                            distance === 1 ||
                            page === 1 ||
                            page === data.meta.last_page
                          );
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                ? 'z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(data.meta.last_page, p + 1))
                        }
                        disabled={currentPage === data.meta.last_page}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <OrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.error?.message}
      />

      <OrderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleEditSubmit}
        order={selectedOrder}
        isLoading={updateMutation.isPending}
        error={updateMutation.error?.message}
      />

      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      <OrderStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => {
          setIsStatusDialogOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleStatusUpdate}
        currentStatus={selectedOrder?.status || 'pending'}
        orderNumber={selectedOrder?.order_number || ''}
        isLoading={updateStatusMutation.isPending}
      />

      <OrderSettlementDialog
        isOpen={isSettlementDialogOpen}
        onClose={() => {
          setIsSettlementDialogOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleSettlementUpdate}
        currentStatus={selectedOrder?.is_settled || false}
        orderNumber={selectedOrder?.order_number || ''}
        isLoading={updateSettlementMutation.isPending}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete order #${selectedOrder?.order_number}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={deleteMutation.isPending}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedOrderForPayment(null);
        }}
        onSubmit={handlePaymentSubmit}
        orderId={selectedOrderForPayment?.id}
        isLoading={createPaymentMutation.isPending}
        error={createPaymentMutation.error?.message}
      />
    </div>
  );
};

