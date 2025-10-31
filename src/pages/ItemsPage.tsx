import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  Filter,
  X,
  Edit,
} from 'lucide-react';
import { itemApi } from '../services/api';
import type { Item, ItemCreateRequest, ItemFilters } from '../types/api';
import { ItemModal } from '../components/ItemModal';
import { ItemDetailsModal } from '../components/ItemDetailsModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useToast } from '../components/Toast';

export const ItemsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ItemFilters>({
    per_page: 15,
    sort_by: 'name',
    sort_order: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Fetch items
  const { data, isLoading, error } = useQuery({
    queryKey: ['items', currentPage, search, filters],
    queryFn: async () => {
      const params: ItemFilters = {
        ...filters,
        page: currentPage,
        search: search || undefined,
      };
      const response = await itemApi.getAll(params);
      return response;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ItemCreateRequest) => itemApi.create(data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['items'], type: 'active' });
      setIsCreateModalOpen(false);
      addToast({
        type: 'success',
        title: 'Item Created',
        message: 'Item has been created successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create item.',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemCreateRequest }) =>
      itemApi.update(id, data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['items'], type: 'active' });
      setIsEditModalOpen(false);
      setSelectedItem(null);
      addToast({
        type: 'success',
        title: 'Item Updated',
        message: 'Item has been updated successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update item.',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => itemApi.delete(id),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['items'], type: 'active' });
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      addToast({
        type: 'success',
        title: 'Item Deleted',
        message: 'Item has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete item.',
      });
    },
  });

  // Handlers
  const handleCreateSubmit = (data: ItemCreateRequest) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: ItemCreateRequest) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) {
      deleteMutation.mutate(selectedItem.id);
    }
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleFilterChange = (key: keyof ItemFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      per_page: 15,
      sort_by: 'name',
      sort_order: 'asc',
    });
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.category ||
    filters.is_active !== undefined ||
    filters.min_price ||
    filters.max_price ||
    filters.min_stock ||
    filters.max_stock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Items</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your menu items and inventory
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
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
                placeholder="Search items..."
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
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              hasActiveFilters
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
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Main Course"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={
                    filters.is_active === undefined
                      ? ''
                      : filters.is_active
                      ? 'active'
                      : 'inactive'
                  }
                  onChange={(e) =>
                    handleFilterChange(
                      'is_active',
                      e.target.value === '' ? undefined : e.target.value === 'active'
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.min_price || ''}
                  onChange={(e) =>
                    handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  value={filters.max_price || ''}
                  onChange={(e) =>
                    handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Min Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Stock
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.min_stock || ''}
                  onChange={(e) =>
                    handleFilterChange('min_stock', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Max Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Stock
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={filters.max_stock || ''}
                  onChange={(e) =>
                    handleFilterChange('max_stock', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sort_by || 'name'}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="category">Category</option>
                  <option value="stock_quantity">Stock</option>
                  <option value="created_at">Date Created</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort Order
                </label>
                <select
                  value={filters.sort_order || 'asc'}
                  onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
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

      {/* Items Table */}
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
                Error loading items
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please try again later or contact support if the problem persists.
              </p>
            </div>
          </div>
        ) : !data?.data.length ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No items found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Get started by creating your first item.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.data.map((item) => {
                    const isLowStock = item.stock_quantity < 10;
                    const isOutOfStock = item.stock_quantity === 0;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {item.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {item.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ₦{Number(item.price).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-medium ${
                                isOutOfStock
                                  ? 'text-red-600 dark:text-red-400'
                                  : isLowStock
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {item.stock_quantity}
                            </span>
                            {(isOutOfStock || isLowStock) && (
                              <AlertCircle
                                className={`ml-1 h-4 w-4 ${
                                  isOutOfStock
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-yellow-600 dark:text-yellow-400'
                                }`}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(item)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Edit item"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
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
      <ItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.error?.message}
      />

      <ItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleEditSubmit}
        item={selectedItem}
        isLoading={updateMutation.isPending}
        error={updateMutation.error?.message}
      />

      <ItemDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
