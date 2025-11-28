import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardApi } from '../services/api';
import type { DashboardData } from '../types/api';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981'];

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  change?: number;
  format?: 'number' | 'currency';
}> = ({ title, value, icon: Icon, change, format = 'number' }) => {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(val);
    }
    return val.toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatValue(value)}
                </div>
                {change !== undefined && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${change >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                      }`}
                  >
                    <TrendingUp className="flex-shrink-0 self-center h-4 w-4" />
                    {Math.abs(change)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<{
    from: string;
    to: string;
    label: string;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    label: 'Last 30 Days',
  });

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = React.useState(false);
  const [customDateFrom, setCustomDateFrom] = React.useState('');
  const [customDateTo, setCustomDateTo] = React.useState('');

  const handleRangeChange = (range: string) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();
    let label = '';

    if (range === 'custom') {
      setIsFilterOpen(false);
      setIsCustomDateModalOpen(true);
      return;
    }

    switch (range) {
      case '7days':
        from.setDate(today.getDate() - 7);
        label = 'Last 7 Days';
        break;
      case '30days':
        from.setDate(today.getDate() - 30);
        label = 'Last 30 Days';
        break;
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        label = 'This Month';
        break;
      case 'lastMonth':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        label = 'Last Month';
        break;
      default:
        from.setDate(today.getDate() - 30);
        label = 'Last 30 Days';
    }

    setDateRange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
      label,
    });
    setIsFilterOpen(false);
  };

  const applyCustomDateRange = () => {
    if (!customDateFrom || !customDateTo) return;

    setDateRange({
      from: customDateFrom,
      to: customDateTo,
      label: `${customDateFrom} - ${customDateTo}`,
    });
    setIsCustomDateModalOpen(false);
  };

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', dateRange],
    queryFn: async () => {
      const response = await dashboardApi.getData({
        date_from: dateRange.from,
        date_to: dateRange.to,
      });
      return response.data;
    },
    refetchOnMount: 'always', // Always refetch when component mounts
    staleTime: 0, // Consider data stale immediately
    gcTime: 0, // Don't cache dashboard data
  });

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
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading dashboard data
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              Please try refreshing the page or contact support if the problem persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const {
    current_period = {
      orders: { total: 0, pending: 0, processed: 0, completed: 0, cancelled: 0 },
      revenue: { total: 0, paid: 0, pending: 0, settled: 0, unsettled: 0, average_order_value: 0 },
      payments: { total_amount: 0, count: 0 },
      customers: { all: 0, new: 0, active: 0 }
    },
    trends = {
      orders: { total: 0, pending: 0, completed: 0 },
      revenue: { total: 0, settled: 0, unsettled: 0, average_order_value: 0 },
      customers: { all: 0, new: 0, active: 0 }
    },
    charts_data = { labels: [], orders: [], revenue: [] }
  } = dashboardData || {};

  // Transform data for display
  const stats = {
    new_customers: current_period.customers.new,
    active_customers: current_period.customers.active,
    total_customers: current_period.customers.all,
    total_orders: current_period.orders.total,
    total_revenue: current_period.revenue.total + current_period.revenue.pending,
    pending_orders: current_period.orders.pending,
    completed_orders: current_period.orders.completed,
    processed_orders: current_period.orders.processed,
    cancelled_orders: current_period.orders.cancelled,
  };

  // Create pie chart data from order status
  const orderStatusData = {
    pending: current_period.orders.pending,
    processed: current_period.orders.processed,
    completed: current_period.orders.completed,
    cancelled: current_period.orders.cancelled,
  };

  const pieData = Object.entries(orderStatusData).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  })).filter(item => item.value > 0);

  // Transform chart data for revenue chart
  const revenueChartData = charts_data.labels.map((label, index) => ({
    date: label,
    revenue: charts_data.revenue[index] || 0,
  }));

  // Debug: log chart data
  console.log('Revenue Chart Data:', revenueChartData);
  console.log('Charts Data from API:', charts_data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening with your business.
          </p>
          {dashboardData?.last_updated && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Last updated: {new Date(dashboardData.last_updated).toLocaleString()}
            </p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Calendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            {dateRange.label}
            <ChevronDown className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>

          {isFilterOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={() => handleRangeChange('7days')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => handleRangeChange('30days')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => handleRangeChange('thisMonth')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  This Month
                </button>
                <button
                  onClick={() => handleRangeChange('lastMonth')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Last Month
                </button>
                <button
                  onClick={() => handleRangeChange('custom')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                  role="menuitem"
                >
                  Custom Range
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {isCustomDateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Select Date Range
                  </h3>
                  <button
                    onClick={() => setIsCustomDateModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={applyCustomDateRange}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomDateModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={stats.total_customers}
          icon={Users}
        />
        <StatCard
          title="New Customers"
          value={stats.new_customers}
          icon={Users}
          change={trends.customers.new > 0 ? trends.customers.new : undefined}
        />
        <StatCard
          title="Active Customers"
          value={stats.active_customers}
          icon={Users}
          change={trends.customers.active > 0 ? trends.customers.active : undefined}
        />
        <StatCard
          title="Total Orders"
          value={stats.total_orders}
          icon={ShoppingCart}
          change={trends.orders.total > 0 ? trends.orders.total : undefined}
        />
      </div>

      {/* Revenue and Payment Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={stats.total_revenue}
          icon={DollarSign}
          format="currency"
          change={trends.revenue.total > 0 ? trends.revenue.total : undefined}
        />
        <StatCard
          title="Total Payments"
          value={current_period.payments.total_amount}
          icon={DollarSign}
          format="currency"
        />
        <StatCard
          title="Settled Amount"
          value={current_period.revenue.settled}
          icon={CheckCircle}
          format="currency"
          change={trends.revenue.settled > 0 ? trends.revenue.settled : undefined}
        />
        <StatCard
          title="Unsettled Amount"
          value={current_period.revenue.unsettled}
          icon={Clock}
          format="currency"
          change={trends.revenue.unsettled > 0 ? trends.revenue.unsettled : undefined}
        />
      </div>

      {/* Order Status Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Pending Orders"
          value={stats.pending_orders}
          icon={Clock}
          change={trends.orders.pending > 0 ? trends.orders.pending : undefined}
        />
        <StatCard
          title="Processed Orders"
          value={stats.processed_orders}
          icon={AlertTriangle}
        />
        <StatCard
          title="Completed Orders"
          value={stats.completed_orders}
          icon={CheckCircle}
          change={trends.orders.completed > 0 ? trends.orders.completed : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h2>
          <div className="h-80">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                    domain={[0, dataMax => dataMax > 0 ? dataMax : 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '6px',
                    }}
                    formatter={(value) => [`₦${value}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  No chart data available
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Chart data length: {revenueChartData.length}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Order Status Distribution
          </h2>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No order status data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Orders
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Recent orders feature coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Top Items
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Top items feature coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};