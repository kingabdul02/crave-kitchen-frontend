import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook to handle query invalidation
 * This ensures immediate UI updates after mutations
 */
export const useInvalidateQueries = () => {
    const queryClient = useQueryClient();

    const invalidateCustomers = async () => {
        await queryClient.invalidateQueries({ queryKey: ['customers'] });
    };

    const invalidateItems = async () => {
        await queryClient.invalidateQueries({ queryKey: ['items'] });
    };

    const invalidateOrders = async () => {
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
        await queryClient.invalidateQueries({ queryKey: ['orders-with-payments'] });
    };

    const invalidatePayments = async () => {
        await queryClient.invalidateQueries({ queryKey: ['orders-with-payments'] });
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    const invalidateDashboard = async () => {
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const invalidateAll = async () => {
        await queryClient.invalidateQueries();
    };

    // Invalidate related queries based on entity type
    const invalidateRelated = async (entity: 'customer' | 'item' | 'order' | 'payment') => {
        switch (entity) {
            case 'customer':
                await invalidateCustomers();
                await invalidateDashboard();
                break;
            case 'item':
                await invalidateItems();
                break;
            case 'order':
                await invalidateOrders();
                await invalidateDashboard();
                break;
            case 'payment':
                await invalidatePayments();
                await invalidateDashboard();
                break;
        }
    };

    return {
        invalidateCustomers,
        invalidateItems,
        invalidateOrders,
        invalidatePayments,
        invalidateDashboard,
        invalidateAll,
        invalidateRelated,
    };
};
