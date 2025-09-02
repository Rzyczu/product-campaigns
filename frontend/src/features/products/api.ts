import { apiFetch } from '@/app/providers/apiClient';
import type { Product } from './types';

export async function listProducts(): Promise<Product[]> {
    return apiFetch<Product[]>('/products');
}

export async function createProduct(name: string): Promise<Product> {
    return apiFetch<Product>('/products', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}

export async function updateProduct(id: string, name: string): Promise<Product> {
    return apiFetch<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
    });
}

export async function deleteProduct(id: string): Promise<void> {
    await apiFetch(`/products/${id}`, { method: 'DELETE', parse: 'text' });
}
