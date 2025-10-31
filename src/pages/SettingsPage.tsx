import { Settings as SettingsIcon, User, Bell, Shield, Database, Palette } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your application settings and preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Settings
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your account information
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Edit Profile
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Email Preferences
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
              <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure notification preferences
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Email Notifications
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Push Notifications
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Notification Frequency
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 dark:bg-red-900 rounded-lg p-3">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage security and access
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Two-Factor Authentication
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Active Sessions
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Login History
            </button>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
              <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data & Privacy
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Control your data and privacy
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Export Data
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Data Backup
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Privacy Settings
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3">
              <Palette className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize the look and feel
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Theme Settings
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Language & Region
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Display Preferences
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <SettingsIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                System
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                System configuration and logs
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              API Configuration
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              System Logs
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              About
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Settings Coming Soon
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              These settings pages are placeholders. Full functionality will be implemented in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
