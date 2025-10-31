import React from 'react';
import { X, CreditCard, Calendar, FileText, DollarSign, ShoppingCart } from 'lucide-react';
import type { Payment } from '../types/api';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
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

  if (!isOpen || !payment) return null;

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'transfer':
        return '🏦';
      case 'pos':
        return '📱';
      default:
        return '💰';
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
            Payment Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Amount Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Payment Amount
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                  ₦{Number(payment.amount).toFixed(2)}
                </p>
              </div>
              <div className="text-5xl">{getPaymentMethodIcon(payment.payment_method)}</div>
            </div>
          </div>

          {/* Order Information */}
          {payment.order && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.order.order_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.order.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Order Total</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦{Number(payment.order.total_amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment Amount</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦{Number(payment.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getPaymentMethodLabel(payment.payment_method)}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(payment.payment_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦{Number(payment.amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {payment.notes && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {payment.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Record Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Payment ID</p>
                <p className="font-mono text-gray-900 dark:text-white">#{payment.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                <p className="font-mono text-gray-900 dark:text-white">#{payment.order_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(payment.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Updated At</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(payment.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
