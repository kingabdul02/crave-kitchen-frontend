import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { OrderStatus } from '../types/api';

interface OrderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: OrderStatus, notes?: string) => void;
  currentStatus: OrderStatus;
  orderNumber: string;
  isLoading?: boolean;
}

export const OrderStatusDialog: React.FC<OrderStatusDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  orderNumber,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
      setNotes('');
    }
  }, [isOpen, currentStatus]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedStatus, notes || undefined);
  };

  if (!isOpen) return null;

  const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'processed', label: 'Processed', color: 'blue' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
  ];

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
      case 'red':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Update Order Status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order: {orderNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Current Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Status
              </label>
              <div className="flex items-center">
                <span
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                    getStatusColor(
                      statusOptions.find((s) => s.value === currentStatus)?.color || 'gray'
                    )
                  }`}
                >
                  {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                </span>
              </div>
            </div>

            {/* New Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Status *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedStatus(option.value)}
                    disabled={isLoading}
                    className={`px-4 py-3 rounded-md text-sm font-medium border-2 transition-all ${
                      selectedStatus === option.value
                        ? getStatusColor(option.color) + ' ring-2 ring-offset-2 ring-blue-500'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                rows={3}
                placeholder="Add any notes about this status change..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Warning for cancelled status */}
            {selectedStatus === 'cancelled' && selectedStatus !== currentStatus && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Warning:</strong> Cancelling this order may affect inventory and payments.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedStatus === currentStatus}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
