import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Lock, Save } from 'lucide-react';
import { authApi, userApi } from '../services/api';
import { useToast } from '../components/Toast';

export const ProfilePage: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const { data: userData, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const response = await authApi.getCurrentUser();
            return response.data.user;
        }
    });

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (userData) {
            setName(userData.name);
            setEmail(userData.email);
        }
    }, [userData]);

    const updateProfileMutation = useMutation({
        mutationFn: (data: { name: string; email: string }) => userApi.updateProfile(data),
        onSuccess: () => {
            addToast({ type: 'success', title: 'Success', message: 'Profile updated successfully' });
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
        onError: (error: any) => {
            addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update profile' });
        }
    });

    const updatePasswordMutation = useMutation({
        mutationFn: (data: { current_password: string; password: string; password_confirmation: string }) => userApi.updatePassword(data),
        onSuccess: () => {
            addToast({ type: 'success', title: 'Success', message: 'Password updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        },
        onError: (error: any) => {
            addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update password' });
        }
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({ name, email });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            addToast({ type: 'error', title: 'Error', message: 'Passwords do not match' });
            return;
        }
        updatePasswordMutation.mutate({
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword
        });
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

            {/* Profile Form */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="mr-2 h-5 w-5" /> Profile Information
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {updateProfileMutation.isPending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </button>
                </form>
            </div>

            {/* Password Form */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Lock className="mr-2 h-5 w-5" /> Update Password
                </h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            required
                            minLength={8}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            required
                            minLength={8}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={updatePasswordMutation.isPending}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {updatePasswordMutation.isPending ? 'Updating...' : <><Save className="mr-2 h-4 w-4" /> Update Password</>}
                    </button>
                </form>
            </div>
        </div>
    );
};
