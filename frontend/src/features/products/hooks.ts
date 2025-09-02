import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, deleteProduct, listProducts, updateProduct } from './api';
import type { Product } from './types';

const key = ['products'];

export function useProducts() {
    return useQuery({ queryKey: key, queryFn: listProducts });
}

export function useCreateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => createProduct(name),
        onMutate: async (name) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<Product[]>(key) || [];
            const optimistic: Product = {
                id: `tmp-${Date.now()}`,
                name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            qc.setQueryData<Product[]>(key, [optimistic, ...prev]);
            return { prev };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData(key, ctx.prev);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });
}

export function useRenameProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => updateProduct(id, name),
        onMutate: async ({ id, name }) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<Product[]>(key) || [];
            qc.setQueryData<Product[]>(
                key,
                prev.map((p) => (p.id === id ? { ...p, name, updated_at: new Date().toISOString() } : p))
            );
            return { prev };
        },
        onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });
}

export function useDeleteProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onMutate: async (id) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<Product[]>(key) || [];
            qc.setQueryData<Product[]>(key, prev.filter((p) => p.id !== id));
            return { prev };
        },
        onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });
}
