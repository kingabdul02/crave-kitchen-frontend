# Crave Kitchen Frontend

A production-ready React frontend application built with TypeScript, Vite, and Tailwind CSS that integrates with the Crave Kitchen backend API.

## Features

- 🔐 **Authentication**: Complete login/logout flow with JWT token management
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📊 **Dashboard**: Real-time analytics with charts and statistics
- 👥 **Customer Management**: Full CRUD operations for customers
- 📦 **Item Management**: Inventory management with stock tracking
- 🛒 **Order Management**: Complete order lifecycle management
- 💳 **Payment Tracking**: Payment processing and tracking
- 🔍 **Global Search**: Search across customers, items, and orders
- 📱 **Responsive**: Mobile-first design that works on all devices
- ⚡ **Performance**: Optimized with React Query for data fetching and caching

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 22+ (managed with nvm)
- npm or yarn
- Crave Kitchen backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   # .env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Default Login Credentials

- **Email**: admin@example.com
- **Password**: A1000B2000

## API Integration

The application integrates directly with the Crave Kitchen backend API using:

- **Authentication**: `/auth/*` endpoints for login/logout
- **Dashboard**: `/admin/dashboard` for analytics data
- **Customers**: `/admin/customers` for customer CRUD operations
- **Items**: `/admin/items` for inventory management
- **Orders**: `/admin/orders` for order management
- **Payments**: `/admin/orders/{order}/payments` for payment tracking
- **Search**: `/admin/search/*` for global search functionality

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for all new components
3. Include proper error handling
4. Test with the real backend API
5. Update documentation as needed
