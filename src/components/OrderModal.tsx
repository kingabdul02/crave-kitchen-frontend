import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { customerApi, itemApi } from '../services/api';
import type { Order, OrderCreateRequest, Customer, Item } from '../types/api';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrderCreateRequest) => void;
  order?: Order | null;
  isLoading?: boolean;
  error?: string | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  order,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<OrderCreateRequest>({
    customer_id: 0,
    items: [],
    discount_type: undefined,
    discount_value: undefined,
    notes: '',
  });

  // Fetch customers for selection
  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const response = await customerApi.getAll({ per_page: 100 });
      return response;
    },
    enabled: isOpen,
  });

  // Fetch items for selection
  const { data: itemsData } = useQuery({
    queryKey: ['items-list'],
    queryFn: async () => {
      const response = await itemApi.getAll({ per_page: 100, is_active: true });
      return response;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (order) {
      setFormData({
        customer_id: order.customer_id,
        items: order.order_items.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })) || [],
        discount_type: order.discount_type || undefined,
        discount_value: order.discount_value || undefined,
        notes: order.notes || '',
      });
    } else {
      setFormData({
        customer_id: 0,
        items: [],
        discount_type: undefined,
        discount_value: undefined,
        notes: '',
      });
    }
  }, [order, isOpen]);

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
    if (formData.items.length === 0) {
      return;
    }
    onSubmit(formData);
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_id: 0, quantity: 1, unit_price: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-fill price when item is selected
          if (field === 'item_id' && itemsData?.data) {
            const selectedItem = itemsData.data.find((it: Item) => it.id === Number(value));
            if (selectedItem) {
              updatedItem.unit_price = Number(selectedItem.price);
            }
          }
          
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (!formData.discount_type || !formData.discount_value) return 0;
    
    if (formData.discount_type === 'percentage') {
      return (subtotal * formData.discount_value) / 100;
    }
    return formData.discount_value;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  if (!isOpen) return null;

  const customers = customersData?.data || [];
  const items = itemsData?.data || [];

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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {order ? 'Edit Order' : 'Create New Order'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer *
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_id: Number(e.target.value) }))}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                <option value={0}>Select a customer</option>
                {customers.map((customer: Customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order Items *
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              {formData.items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No items added. Click "Add Item" to start.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <select
                            value={item.item_id}
                            onChange={(e) => handleItemChange(index, 'item_id', Number(e.target.value))}
                            required
                            disabled={isLoading}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                          >
                            <option value={0}>Select item</option>
                            {items.map((it: Item) => (
                              <option key={it.id} value={it.id}>
                                {it.name} - ${Number(it.price).toFixed(2)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            required
                            disabled={isLoading}
                            placeholder="Qty"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                          required
                          disabled={isLoading}
                          placeholder="Price"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={isLoading}
                        className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount Type
                </label>
                <select
                  value={formData.discount_type || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    discount_type: e.target.value as any || undefined 
                  }))}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                >
                  <option value="">No Discount</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_value || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    discount_value: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  disabled={isLoading || !formData.discount_type}
                  placeholder={formData.discount_type === 'percentage' ? 'e.g., 10 for 10%' : 'e.g., 5.00'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                disabled={isLoading}
                rows={3}
                placeholder="Any special instructions or notes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Order Summary */}
            {formData.items.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                {formData.discount_type && formData.discount_value && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Discount ({formData.discount_type === 'percentage' ? `${formData.discount_value}%` : 'Fixed'}):
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -${calculateDiscount().toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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
              disabled={isLoading || formData.items.length === 0 || formData.customer_id === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
