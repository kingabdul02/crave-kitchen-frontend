import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import type { Customer } from '../types/api';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  isLoading?: boolean;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  customer,
  isLoading = false,
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{ pointerEvents: 'auto' }}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 dark:bg-gray-900 opacity-75 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div 
          className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Customer Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : customer ? (
              <div className="space-y-6">
                {/* Customer Basic Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {customer.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Customer ID: {customer.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">{customer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">{customer.phone}</span>
                    </div>
                    <div className="flex items-start md:col-span-2">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-900 dark:text-white">{customer.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        Joined: {new Date(customer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                        <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Total Orders
                        </p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {customer.total_orders || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Total Spent
                        </p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          ₦{(customer.total_spent || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Average Order Value */}
                {customer.total_orders && customer.total_orders > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
                        <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                          Average Order Value
                        </p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          ₦{((customer.total_spent || 0) / (customer.total_orders || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Activity Status */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Customer Status
                  </h5>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      (customer.total_orders || 0) > 0 
                        ? 'bg-green-400' 
                        : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {(customer.total_orders || 0) > 0 ? 'Active Customer' : 'New Customer'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Customer not found</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};