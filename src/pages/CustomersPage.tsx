import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Users as UsersIcon, Eye, Edit, Trash2 } from 'lucide-react';
import { customerApi } from '../services/api';
import { CustomerModal } from '../components/CustomerModal';
import { CustomerDetailsModal } from '../components/CustomerDetailsModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useToast } from '../components/Toast';
import type { Customer, CustomerFilters, CustomerCreateRequest } from '../types/api';

export const CustomersPage: React.FC = () => {
  const [filters, setFilters] = useState<CustomerFilters>({
    per_page: 15,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const response = await customerApi.getAll(filters);
      return response;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always',
  });

  // Create customer mutation
  const createMutation = useMutation({
    mutationFn: customerApi.create,
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['customers'], type: 'active' });
      addToast({
        type: 'success',
        title: 'Customer Created',
        message: 'Customer has been created successfully.',
      });
      setIsCreateModalOpen(false);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create customer.',
      });
    },
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerCreateRequest }) =>
      customerApi.update(id, data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['customers'], type: 'active' });
      addToast({
        type: 'success',
        title: 'Customer Updated',
        message: 'Customer has been updated successfully.',
      });
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update customer.',
      });
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: customerApi.delete,
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['customers'], type: 'active' });
      addToast({
        type: 'success',
        title: 'Customer Deleted',
        message: 'Customer has been deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete customer.',
      });
    },
  });

  // Event handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleCreateCustomer = async (data: CustomerCreateRequest) => {
    await createMutation.mutateAsync(data);
  };

  const handleEditCustomer = async (data: CustomerCreateRequest) => {
    if (selectedCustomer) {
      await updateMutation.mutateAsync({ id: selectedCustomer.id, data });
    }
  };

  const handleDeleteCustomer = async () => {
    if (selectedCustomer) {
      await deleteMutation.mutateAsync(selectedCustomer.id);
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleFilterChange = (newFilters: Partial<CustomerFilters>) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="text-red-800 dark:text-red-200">
          Error loading customers: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const customers = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your customer database
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </form>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Has Orders
                </label>
                <select
                  value={filters.has_orders?.toString() || ''}
                  onChange={(e) => handleFilterChange({ 
                    has_orders: e.target.value ? e.target.value === 'true' : undefined 
                  })}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Customers</option>
                  <option value="true">With Orders</option>
                  <option value="false">Without Orders</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Spent
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.min_spent || ''}
                  onChange={(e) => handleFilterChange({ 
                    min_spent: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  value={`${filters.sort_by}-${filters.sort_order}`}
                  onChange={(e) => {
                    const [sort_by, sort_order] = e.target.value.split('-');
                    handleFilterChange({ 
                      sort_by: sort_by as CustomerFilters['sort_by'], 
                      sort_order: sort_order as 'asc' | 'desc' 
                    });
                  }}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="total_spent-desc">Highest Spent</option>
                  <option value="total_spent-asc">Lowest Spent</option>
                  <option value="total_orders-desc">Most Orders</option>
                  <option value="total_orders-asc">Least Orders</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    per_page: 15,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                  });
                  setSearchTerm('');
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            Customers ({meta?.total || 0})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer: Customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {customer.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {customer.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {customer.total_orders || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₦{(customer.total_spent || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(customer)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Edit Customer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(meta.current_page + 1)}
                disabled={meta.current_page >= meta.last_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{meta.from}</span> to{' '}
                  <span className="font-medium">{meta.to}</span> of{' '}
                  <span className="font-medium">{meta.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {meta.current_page} of {meta.last_page}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page >= meta.last_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals and Dialogs */}
      <CustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCustomer}
        title="Create New Customer"
        isLoading={createMutation.isPending}
      />

      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleEditCustomer}
        customer={selectedCustomer || undefined}
        title="Edit Customer"
        isLoading={updateMutation.isPending}
      />

      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        message={`Are you sure you want to delete "${selectedCustomer?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};