import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, CreditCard, Calendar, FileText, Wallet } from 'lucide-react';
import { orderApi } from '../services/api';
import type { PaymentCreateRequest, PaymentMethod, Payment } from '../types/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: number, data: PaymentCreateRequest) => void;
  payment?: Payment | null;
  orderId?: number;
  isLoading?: boolean;
  error?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  payment,
  orderId: initialOrderId,
  isLoading = false,
  error,
}) => {
  const [orderId, setOrderId] = useState<number>(initialOrderId || 0);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Fetch orders for selection
  const { data: ordersData } = useQuery({
    queryKey: ['orders', orderSearch],
    queryFn: async () => {
      const response = await orderApi.getAll({
        search: orderSearch || undefined,
        per_page: 50,
        sort_by: 'created_at',
        sort_order: 'desc',
      });
      return response;
    },
    enabled: isOpen && !initialOrderId,
  });

  // Fetch selected order details
  const { data: orderData } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await orderApi.getById(orderId);
      return response.data;
    },
    enabled: isOpen && orderId > 0,
  });

  // Populate form when editing
  useEffect(() => {
    if (payment) {
      setOrderId(payment.order_id);
      setAmount(payment.amount.toString());
      setPaymentMethod(payment.payment_method);
      setPaymentDate(payment.payment_date.split('T')[0]);
      setNotes(payment.notes || '');
    } else if (initialOrderId) {
      setOrderId(initialOrderId);
    }
  }, [payment, initialOrderId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (!initialOrderId) {
        setOrderId(0);
      }
      setAmount('');
      setPaymentMethod('cash');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setOrderSearch('');
    }
  }, [isOpen, initialOrderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId || orderId === 0) {
      return;
    }

    const data: PaymentCreateRequest = {
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      payment_date: new Date(paymentDate).toISOString(),
      notes: notes.trim() || undefined,
    };

    onSubmit(orderId, data);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const orderBalance = orderData
    ? parseFloat(orderData.total_amount.toString()) -
      (orderData.payments?.reduce(
        (sum: number, p: any) => sum + parseFloat(p.amount.toString()),
        0
      ) || 0)
    : 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
      onClick={handleBackdropClick}
      onKeyDown={handleEscKey}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {payment ? 'Edit Payment' : 'Create Payment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Order Selection */}
          {!initialOrderId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                />
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select an order</option>
                  {ordersData?.data.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - {order.customer?.name} - ₦
                      {Number(order.total_amount).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Order Info Display */}
          {orderData && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                Order Details
              </h3>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <p>
                  <span className="font-medium">Order Number:</span>{' '}
                  {orderData.order_number}
                </p>
                <p>
                  <span className="font-medium">Customer:</span>{' '}
                  {orderData.customer?.name}
                </p>
                <p>
                  <span className="font-medium">Total Amount:</span> ₦
                  {Number(orderData.total_amount).toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Payment Status:</span>{' '}
                  <span className="capitalize">{orderData.payment_status}</span>
                </p>
                {orderBalance > 0 && (
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    Outstanding Balance: ₦{orderBalance.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Wallet className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={orderBalance > 0 ? orderBalance : undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
                required
                disabled={isLoading}
              />
            </div>
            {orderBalance > 0 && parseFloat(amount) > orderBalance && (
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                Amount exceeds outstanding balance
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
                required
                disabled={isLoading}
              >
                <option value="cash">Cash</option>
                <option value="POS">POS</option>
                <option value="transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Additional payment notes..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !orderId || !amount}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : payment ? (
                'Update Payment'
              ) : (
                'Create Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
