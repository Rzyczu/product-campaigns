import { useState } from 'react';
import type { Product } from '../types';
import { useDeleteProduct } from '../hooks';
import ProductForm from './ProductForm';
import { Pencil, Trash2 } from 'lucide-react';

type RowProps = { product: Product };

function Row({ product }: RowProps) {
    const del = useDeleteProduct();
    const [edit, setEdit] = useState(false);

    return (
        <tr>
            <td data-label="Name">
                {edit ? (
                    <ProductForm id={product.id} initialName={product.name} onDone={() => setEdit(false)} />
                ) : (
                    product.name
                )}
            </td>
            <td data-label="Created" className="nowrap">
                {new Date(product.created_at).toLocaleString()}
            </td>
            <td data-label="Actions" className="ta-right">
                <div className="actions-inline">
                    {!edit && (
                        <button
                            className="btn btn--icon"
                            onClick={() => setEdit(true)}
                            disabled={del.isPending}
                            aria-label="Rename product"
                        >
                            <Pencil size={16} aria-hidden="true" />
                            <span className="btn__label">Rename</span>
                        </button>
                    )}
                    <button
                        className="btn btn--icon btn--ghost"
                        onClick={() => {
                            if (confirm('Delete this product?')) del.mutate(product.id);
                        }}
                        disabled={del.isPending}
                        aria-label="Delete product"
                    >
                        <Trash2 size={16} aria-hidden="true" />
                        <span className="btn__label">Delete</span>
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function ProductsTable({ items }: { items: Product[] }) {
    if (!items.length) return <div className="card">No products yet.</div>;

    return (
        <div className="card table--responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Created</th>
                        <th className="ta-right">Actions</th>
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
