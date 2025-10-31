import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Package,
  ShoppingCart,
  X,
  ExternalLink,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
  Hash,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../lib/api-client';

interface SearchResult {
  customers: Array<{
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    total_orders: number;
    total_spent: string;
    type: 'customer';
  }>;
  items: Array<{
    id: number;
    name: string;
    category: string;
    price: string;
    description?: string;
    stock_quantity: number;
    is_active: boolean;
    type: 'item';
  }>;
  orders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    total_amount: string;
    status: string;
    payment_status: string;
    created_at: string;
    type: 'order';
  }>;
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<'all' | 'customers' | 'items' | 'orders'>('all');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery) {
        setSearchParams({ q: searchQuery });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchParams]);

  // Fetch search results
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return null;
      
      const response = await apiClient.get<{ success: boolean; data: SearchResult }>(
        `/admin/search/global?query=${encodeURIComponent(debouncedQuery)}&limit=50`
      );
      return response.data as unknown as SearchResult;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchParams({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const totalResults = searchResults
    ? (searchResults.customers?.length || 0) +
      (searchResults.items?.length || 0) +
      (searchResults.orders?.length || 0)
    : 0;

  const filteredCustomers = activeTab === 'all' || activeTab === 'customers' ? searchResults?.customers || [] : [];
  const filteredItems = activeTab === 'all' || activeTab === 'items' ? searchResults?.items || [] : [];
  const filteredOrders = activeTab === 'all' || activeTab === 'orders' ? searchResults?.orders || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Search across customers, items, and orders
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for customers, items, or orders..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Tips */}
        {!debouncedQuery && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-2">Search tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Enter at least 2 characters to start searching</li>
              <li>Search by customer name, email, or phone</li>
              <li>Search by item name, category, or description</li>
              <li>Search by order number or customer name</li>
            </ul>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-200">
              Failed to perform search. Please try again.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && debouncedQuery.length >= 2 && searchResults && (
        <>
          {/* Results Summary & Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found <span className="font-semibold text-gray-900 dark:text-white">{totalResults}</span> results for "{debouncedQuery}"
              </p>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'customers'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Customers ({searchResults.customers?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Package className="h-4 w-4 mr-2" />
                Items ({searchResults.items?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Orders ({searchResults.orders?.length || 0})
              </button>
            </div>
          </div>

          {/* No Results */}
          {totalResults === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12">
              <div className="text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search terms or search for something else
                </p>
              </div>
            </div>
          )}

          {/* Customer Results */}
          {filteredCustomers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Customers
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.map((customer: any) => (
                  <div
                    key={customer.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate('/customers')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            {customer.name}
                          </h4>
                          <ExternalLink className="h-4 w-4 ml-2 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-4 w-4 mr-2" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-4 w-4 mr-2" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4 mr-2" />
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.total_orders} orders
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${Number(customer.total_spent).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Item Results */}
          {filteredItems.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Package className="h-5 w-5 mr-2 text-green-600" />
                  Items
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate('/items')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h4>
                          <ExternalLink className="h-4 w-4 ml-2 text-gray-400" />
                          {!item.is_active && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              Inactive
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            {item.category}
                          </div>
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 mr-1" />
                            Stock: {item.stock_quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          ${Number(item.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Results */}
          {filteredOrders.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-purple-600" />
                  Orders
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate('/orders')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            {order.order_number}
                          </h4>
                          <ExternalLink className="h-4 w-4 ml-2 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-2" />
                            {order.customer_name}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
                          <DollarSign className="h-5 w-5" />
                          {Number(order.total_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!debouncedQuery && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12">
          <div className="text-center">
            <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Start searching
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Enter a search term above to find customers, items, or orders in your system
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
