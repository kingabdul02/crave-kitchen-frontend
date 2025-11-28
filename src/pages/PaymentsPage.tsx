import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Eye,
  DollarSign,
  AlertCircle,
  Filter,
  X,
  CreditCard,
} from 'lucide-react';
import { orderApi, paymentApi } from '../services/api';
import type { Payment, PaymentCreateRequest, PaymentMethod } from '../types/api';
import { PaymentModal } from '../components/PaymentModal';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useToast } from '../components/Toast';

interface PaymentFilters {
  payment_method?: PaymentMethod;
  min_amount?: number;
  max_amount?: number;
  from_date?: string;
  to_date?: string;
  order_search?: string;
}

export const PaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Fetch all orders with payments
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders-with-payments', currentPage, search, filters],
    queryFn: async () => {
      // Fetch orders to get payments
      const response = await orderApi.getAll({
        per_page: 50,
        page: currentPage,
        search: search || undefined,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      // Extract all payments from orders
      const allPayments: Payment[] = [];
      for (const order of response.data) {
        if (order.payments && order.payments.length > 0) {
          order.payments.forEach((payment) => {
            allPayments.push({
              ...payment,
              order: {
                id: order.id,
                order_number: order.order_number,
                customer_name: order.customer?.name || 'Unknown',
                total_amount: order.total_amount,
              },
            });
          });
        }
      }

      // Apply filters
      let filteredPayments = allPayments;

      if (filters.payment_method) {
        filteredPayments = filteredPayments.filter(
          (p) => p.payment_method === filters.payment_method
        );
      }

      if (filters.min_amount) {
        filteredPayments = filteredPayments.filter(
          (p) => Number(p.amount) >= filters.min_amount!
        );
      }

      if (filters.max_amount) {
        filteredPayments = filteredPayments.filter(
          (p) => Number(p.amount) <= filters.max_amount!
        );
      }

      if (filters.from_date) {
        filteredPayments = filteredPayments.filter(
          (p) => new Date(p.payment_date) >= new Date(filters.from_date!)
        );
      }

      if (filters.to_date) {
        filteredPayments = filteredPayments.filter(
          (p) => new Date(p.payment_date) <= new Date(filters.to_date!)
        );
      }

      if (filters.order_search) {
        filteredPayments = filteredPayments.filter(
          (p) =>
            p.order?.order_number
              .toLowerCase()
              .includes(filters.order_search!.toLowerCase()) ||
            p.order?.customer_name
              .toLowerCase()
              .includes(filters.order_search!.toLowerCase())
        );
      }

      // Sort by payment date (newest first)
      filteredPayments.sort(
        (a, b) =>
          new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      );

      return filteredPayments;
    },
    staleTime: 0,
    gcTime: 0, // Don't cache payment data
    refetchOnMount: 'always',
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: PaymentCreateRequest }) =>
      paymentApi.create(orderId, data),
    onSuccess: async () => {
      // Invalidate all payment and order queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['orders-with-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsCreateModalOpen(false);
      addToast({
        type: 'success',
        title: 'Payment Created',
        message: 'Payment has been recorded successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create payment.',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      orderId,
      paymentId,
      data,
    }: {
      orderId: number;
      paymentId: number;
      data: PaymentCreateRequest;
    }) => paymentApi.update(orderId, paymentId, data),
    onSuccess: async () => {
      // Invalidate all payment and order queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['orders-with-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsEditModalOpen(false);
      setSelectedPayment(null);
      addToast({
        type: 'success',
        title: 'Payment Updated',
        message: 'Payment has been updated successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update payment.',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ orderId, paymentId }: { orderId: number; paymentId: number }) =>
      paymentApi.delete(orderId, paymentId),
    onSuccess: async () => {
      // Invalidate all payment and order queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['orders-with-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
      addToast({
        type: 'success',
        title: 'Payment Deleted',
        message: 'Payment has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete payment.',
      });
    },
  });

  // Handlers
  const handleCreateSubmit = (orderId: number, data: PaymentCreateRequest) => {
    createMutation.mutate({ orderId, data });
  };

  const handleEditSubmit = (orderId: number, data: PaymentCreateRequest) => {
    if (selectedPayment) {
      updateMutation.mutate({ orderId, paymentId: selectedPayment.id, data });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedPayment) {
      deleteMutation.mutate({
        orderId: selectedPayment.order_id,
        paymentId: selectedPayment.id,
      });
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.payment_method ||
    filters.min_amount ||
    filters.max_amount ||
    filters.from_date ||
    filters.to_date ||
    filters.order_search;

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'card':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'transfer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'pos':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'transfer':
        return 'Bank Transfer';
      case 'pos':
        return 'POS';
      default:
        return method;
    }
  };

  // Calculate statistics
  const stats = data
    ? {
      total: data.length,
      totalAmount: data.reduce((sum, p) => sum + Number(p.amount), 0),
      byMethod: data.reduce((acc, p) => {
        acc[p.payment_method] = (acc[p.payment_method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    }
    : { total: 0, totalAmount: 0, byMethod: {} };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage payment transactions
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </button>
      </div>

      {/* Statistics Cards */}
      {!isLoading && data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Payments
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Amount
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ₦{stats.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Payment
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ₦{stats.total > 0 ? (stats.totalAmount / stats.total).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/20 rounded-lg p-3">
                <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Top Method
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Object.keys(stats.byMethod).length > 0
                    ? getPaymentMethodLabel(
                      Object.entries(stats.byMethod).sort((a, b) => b[1] - a[1])[0][0]
                    )
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order or customer..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={filters.payment_method || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'payment_method',
                      e.target.value || undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="digital_wallet">Digital Wallet</option>
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
                    handleFilterChange(
                      'min_amount',
                      e.target.value ? Number(e.target.value) : undefined
                    )
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
                    handleFilterChange(
                      'max_amount',
                      e.target.value ? Number(e.target.value) : undefined
                    )
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
                  onChange={(e) =>
                    handleFilterChange('from_date', e.target.value || undefined)
                  }
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
                  onChange={(e) =>
                    handleFilterChange('to_date', e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Order Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order/Customer
                </label>
                <input
                  type="text"
                  placeholder="Search order or customer..."
                  value={filters.order_search || ''}
                  onChange={(e) =>
                    handleFilterChange('order_search', e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
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

      {/* Payments Table */}
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
                Error loading payments
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please try again later or contact support if the problem persists.
              </p>
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No payments found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Start by recording your first payment.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((payment: Payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(payment.payment_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(payment.payment_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.order?.order_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.order?.customer_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ₦{Number(payment.amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(
                          payment.payment_method
                        )}`}
                      >
                        {getPaymentMethodLabel(payment.payment_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* <button
                          onClick={() => handleEdit(payment)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit payment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.error?.message}
      />

      <PaymentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPayment(null);
        }}
        onSubmit={handleEditSubmit}
        payment={selectedPayment}
        orderId={selectedPayment?.order_id}
        isLoading={updateMutation.isPending}
        error={updateMutation.error?.message}
      />

      <PaymentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPayment(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment"
        message={`Are you sure you want to delete this payment of ₦${selectedPayment ? Number(selectedPayment.amount).toFixed(2) : '0.00'
          }? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
