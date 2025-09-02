import ProductForm from '@/features/products/components/ProductForm';
import ProductsTable from '@/features/products/components/ProductsTable';
import { useProducts } from '@/features/products/hooks';

export default function ProductsPage() {
    const { data, isLoading, isError, error, refetch } = useProducts();

    return (
        <section>
            <div className="pagehead">
                <h1>Products</h1>
                <button className="btn" onClick={() => refetch()} disabled={isLoading}>Refresh</button>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
                <h3 style={{ marginTop: 0 }}>Add product</h3>
                <ProductForm />
                {isError && <div className="alert" style={{ marginTop: 8 }}>{(error as any)?.message ?? 'Error'}</div>}
            </div>

            {isLoading ? (
                <div className="card">Loading…</div>
            ) : (
                <ProductsTable items={data ?? []} />
            )}
        </section>
    );
}
