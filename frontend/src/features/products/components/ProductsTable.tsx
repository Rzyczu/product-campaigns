import { useState } from 'react';
import type { Product } from '../types';
import { useDeleteProduct } from '../hooks';
import ProductForm from './ProductForm';

type RowProps = { product: Product };
function Row({ product }: RowProps) {
    const del = useDeleteProduct();
    const [edit, setEdit] = useState(false);

    return (
        <tr>
            <td style={{ width: '60%' }}>
                {edit ? (
                    <ProductForm id={product.id} initialName={product.name} onDone={() => setEdit(false)} />
                ) : (
                    product.name
                )}
            </td>
            <td>{new Date(product.created_at).toLocaleString()}</td>
            <td style={{ textAlign: 'right' }}>
                {!edit && (
                    <button className="btn" onClick={() => setEdit(true)} disabled={del.isPending}>
                        Rename
                    </button>
                )}{' '}
                <button
                    className="btn btn--ghost"
                    onClick={() => {
                        if (confirm('Delete this product?')) del.mutate(product.id);
                    }}
                    disabled={del.isPending}
                >
                    Delete
                </button>
            </td>
        </tr>
    );
}

export default function ProductsTable({ items }: { items: Product[] }) {
    if (!items.length) return <div className="card">No products yet.</div>;

    return (
        <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>Name</th>
                        <th style={{ textAlign: 'left' }}>Created</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((p) => (
                        <Row key={p.id} product={p} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
