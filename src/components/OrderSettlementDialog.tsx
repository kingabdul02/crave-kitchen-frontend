import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface OrderSettlementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (isSettled: boolean) => void;
  currentStatus: boolean;
  orderNumber: string;
  isLoading?: boolean;
}

export const OrderSettlementDialog: React.FC<OrderSettlementDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  orderNumber,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<boolean>(currentStatus);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
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
    onConfirm(selectedStatus);
  };

  if (!isOpen) return null;

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
              {selectedStatus ? (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Update Settlement Status
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Order: {orderNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Settlement Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Settled Option */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus(true)}
                  disabled={isLoading}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    selectedStatus
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <CheckCircle
                    className={`h-8 w-8 mb-2 ${
                      selectedStatus
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedStatus
                        ? 'text-green-900 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Settled
                  </span>
                  {selectedStatus && (
                    <div className="absolute top-2 right-2">
                      <div className="h-3 w-3 rounded-full bg-green-600 dark:bg-green-400"></div>
                    </div>
                  )}
                </button>

                {/* Unsettled Option */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus(false)}
                  disabled={isLoading}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    !selectedStatus
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-600'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <XCircle
                    className={`h-8 w-8 mb-2 ${
                      !selectedStatus
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      !selectedStatus
                        ? 'text-orange-900 dark:text-orange-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Unsettled
                  </span>
                  {!selectedStatus && (
                    <div className="absolute top-2 right-2">
                      <div className="h-3 w-3 rounded-full bg-orange-600 dark:bg-orange-400"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Info message */}
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedStatus
                      ? 'Marking this order as settled indicates that all financial transactions related to this order have been completed and reconciled.'
                      : 'Marking this order as unsettled indicates that there are pending financial transactions or reconciliation required for this order.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedStatus === currentStatus}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedStatus
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
