import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './Layout';
import LoginPage from '@/pages/LoginPage';
import CampaignsListPage from '@/pages/CampaignsListPage';
import CampaignCreatePage from '@/pages/CampaignCreatePage';
import CampaignEditPage from '@/pages/CampaignEditPage';
import ProductsPage from '@/pages/ProductsPage';
import { useAuth } from '@/features/auth/store';
import type { JSX } from 'react';

function Protected({ element }: { element: JSX.Element }) {
    const user = useAuth((s) => s.user);
    if (!user) return <Navigate to="/login" replace />;
    return element;
}

export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/campaigns" replace /> },
    {
        element: <Layout />,
        children: [
            { path: '/login', element: <LoginPage /> },
            { path: '/campaigns', element: <Protected element={<CampaignsListPage />} /> },
            { path: '/campaigns/new', element: <Protected element={<CampaignCreatePage />} /> },
            { path: '/campaigns/:id/edit', element: <Protected element={<CampaignEditPage />} /> },
            { path: '/products', element: <Protected element={<ProductsPage />} /> },
        ],
    },
]);
