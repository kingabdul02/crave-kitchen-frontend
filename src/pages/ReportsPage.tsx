import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  BarChart3,
  PieChart,
  FileText,
} from 'lucide-react';
import { orderApi, customerApi } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type ReportType = 'sales' | 'orders' | 'customers' | 'items' | 'payments';
type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Calculate date range
  const getDateRange = () => {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (dateRange) {
      case 'today':
        from = new Date();
        to = new Date();
        break;
      case 'week':
        from = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'month':
        from = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'year':
        from = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      case 'custom':
        return { date_from: fromDate, date_to: toDate };
    }

    return {
      date_from: from.toISOString().split('T')[0],
      date_to: to.toISOString().split('T')[0],
    };
  };

  const dates = getDateRange();

  // Fetch orders data
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders-report', dates],
    queryFn: async () => {
      const response = await orderApi.getAll({
        per_page: 1000,
        date_from: dates.date_from,
        date_to: dates.date_to,
        sort_by: 'created_at',
        sort_order: 'asc',
      });
      return response.data;
    },
  });

  // Fetch orders summary
  const { data: ordersSummary } = useQuery({
    queryKey: ['orders-summary', dates],
    queryFn: async () => {
      const response = await orderApi.getSummary({
        date_from: dates.date_from,
        date_to: dates.date_to,
      });
      return response.data;
    },
  });

  // Fetch customers data
  const { data: customersData } = useQuery({
    queryKey: ['customers-report', dates],
    queryFn: async () => {
      const response = await customerApi.getAll({
        per_page: 1000,
        created_from: dates.date_from,
        created_to: dates.date_to,
      });
      return response.data;
    },
  });

  // Process data functions
  const processOrdersData = () => {
    if (!ordersData) return [];

    const dataByDate: Record<string, { date: string; revenue: number; orders: number }> = {};

    ordersData.forEach((order: any) => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dataByDate[date]) {
        dataByDate[date] = { date, revenue: 0, orders: 0 };
      }

      dataByDate[date].revenue += Number(order.total_amount);
      dataByDate[date].orders += 1;
    });

    return Object.values(dataByDate);
  };

  const processStatusData = () => {
    if (!ordersData) return [];

    const statusCount: Record<string, number> = {};

    ordersData.forEach((order: any) => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  };

  const processPaymentMethodData = () => {
    if (!ordersData) return [];

    const methodCount: Record<string, number> = {};

    ordersData.forEach((order: any) => {
      if (order.payments && order.payments.length > 0) {
        order.payments.forEach((payment: any) => {
          methodCount[payment.payment_method] =
            (methodCount[payment.payment_method] || 0) + 1;
        });
      }
    });

    return Object.entries(methodCount).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value,
    }));
  };

  const processTopItems = () => {
    if (!ordersData) return [];

    const itemStats: Record<number, { name: string; quantity: number; revenue: number }> = {};

    ordersData.forEach((order: any) => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item: any) => {
          if (!itemStats[item.item_id]) {
            itemStats[item.item_id] = {
              name: item.item?.name || 'Unknown',
              quantity: 0,
              revenue: 0,
            };
          }
          itemStats[item.item_id].quantity += item.quantity;
          itemStats[item.item_id].revenue += Number(item.total_price || 0);
        });
      }
    });

    return Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const chartData = processOrdersData();
  const statusData = processStatusData();
  const paymentMethodData = processPaymentMethodData();
  const topItems = processTopItems();

  // Calculate summary statistics
  const totalRevenue = ordersData?.reduce(
    (sum: number, order: any) => sum + Number(order.total_amount),
    0
  ) || 0;
  const totalOrders = ordersData?.length || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalCustomers = customersData?.length || 0;

  const handleExport = () => {
    // Create CSV content
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'sales':
        csvContent = 'Date,Revenue,Orders\n';
        chartData.forEach((row) => {
          csvContent += `${row.date},${row.revenue.toFixed(2)},${row.orders}\n`;
        });
        filename = 'sales-report.csv';
        break;

      case 'orders':
        csvContent = 'Order Number,Customer,Total,Status,Payment Status,Date\n';
        ordersData?.forEach((order: any) => {
          csvContent += `${order.order_number},${order.customer?.name || 'N/A'},${order.total_amount},${order.status},${order.payment_status},${order.created_at}\n`;
        });
        filename = 'orders-report.csv';
        break;

      case 'customers':
        csvContent = 'Name,Email,Phone,Total Orders,Total Spent,Created\n';
        customersData?.forEach((customer: any) => {
          csvContent += `${customer.name},${customer.email},${customer.phone},${customer.total_orders || 0},${customer.total_spent || 0},${customer.created_at}\n`;
        });
        filename = 'customers-report.csv';
        break;

      case 'items':
        csvContent = 'Name,Category,Price,Stock,Orders\n';
        topItems.forEach((item) => {
          csvContent += `${item.name},${item.quantity},${item.revenue.toFixed(2)}\n`;
        });
        filename = 'items-report.csv';
        break;

      case 'payments':
        csvContent = 'Method,Count\n';
        paymentMethodData.forEach((method) => {
          csvContent += `${method.name},${method.value}\n`;
        });
        filename = 'payments-report.csv';
        break;
    }

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analyze business performance and trends
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="sales">Sales Overview</option>
              <option value="orders">Orders Analysis</option>
              <option value="customers">Customer Insights</option>
              <option value="items">Product Performance</option>
              <option value="payments">Payment Methods</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ₦{totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg Order Value
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ₦{averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/20 rounded-lg p-3">
              <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Customers
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalCustomers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {ordersLoading ? (
        <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Sales Report */}
          {reportType === 'sales' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Revenue Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                    <XAxis dataKey="date" className="dark:text-gray-400" />
                    <YAxis className="dark:text-gray-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Revenue (₦)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Orders Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                    <XAxis dataKey="date" className="dark:text-gray-400" />
                    <YAxis className="dark:text-gray-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="orders" fill="#10B981" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Orders Report */}
          {reportType === 'orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Order Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Order Summary
                </h3>
                <div className="space-y-4">
                  {ordersSummary && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Total Orders
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {ordersSummary.total_orders}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Total Revenue
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          ₦{Number(ordersSummary.total_revenue).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Average Order Value
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          ₦{Number(ordersSummary.average_order_value).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Items Report */}
          {reportType === 'items' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Top Performing Items
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                  <XAxis type="number" className="dark:text-gray-400" />
                  <YAxis dataKey="name" type="category" width={150} className="dark:text-gray-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (₦)" />
                  <Bar dataKey="quantity" fill="#10B981" name="Quantity Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Payments Report */}
          {reportType === 'payments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Methods Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Method Breakdown
                </h3>
                <div className="space-y-3">
                  {paymentMethodData.map((method, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {method.value} transactions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Customers Report */}
          {reportType === 'customers' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Customer Growth
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                    Total Customers
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                    {totalCustomers}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                    New Customers
                  </p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                    {customersData?.length || 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                    Avg. Spent
                  </p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">
                    $
                    {customersData && customersData.length > 0
                      ? (
                        customersData.reduce(
                          (sum: number, c: any) => sum + Number(c.total_spent || 0),
                          0
                        ) / customersData.length
                      ).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
