import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import ToastProvider from '@/components/Toast/ToastProvider';
import { router } from './Router';
import { queryClient } from './providers/queryClient';

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <ToastProvider />
        </QueryClientProvider>
    );
}
