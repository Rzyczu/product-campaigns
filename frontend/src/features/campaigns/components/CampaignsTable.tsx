import { Link } from 'react-router-dom';
import type { Campaign } from '../types';
import { formatMoney } from '@/lib/format';
import { useDeleteCampaign } from '../hooks';
import { Pencil, Trash2 } from 'lucide-react';

export default function CampaignsTable({ items }: { items: Campaign[] }) {
    const del = useDeleteCampaign();
    if (!items.length) return <div className="card">No campaigns yet.</div>;

    return (
        <div className="card table--responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Product</th>
                        <th>Bid</th>
                        <th>Fund</th>
                        <th>Town</th>
                        <th>Status</th>
                        <th>Keywords</th>
                        <th className="ta-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((c) => (
                        <tr key={c.id}>
                            <td data-label="Name">{c.name}</td>
                            <td data-label="Product">{c.product_name}</td>
                            <td data-label="Bid" className="ta-center">{formatMoney(c.bid_amount_cents)}</td>
                            <td data-label="Fund" className="ta-center">{formatMoney(c.fund_cents)}</td>
                            <td data-label="Town" className="ta-center">{c.town_name}</td>
                            <td data-label="Status" className="ta-center">{c.status}</td>
                            <td data-label="Keywords" className="nowrap">{c.keywords.join(', ')}</td>
                            <td data-label="Actions" className="ta-right">
                                <div className="actions-inline">
                                    <Link
                                        className="btn btn--icon"
                                        to={`/campaigns/${c.id}/edit`}
                                        aria-label="Edit campaign"
                                    >
                                        <Pencil size={16} aria-hidden="true" />
                                        <span className="btn__label">Edit</span>
                                    </Link>
                                    <button
                                        className="btn btn--icon btn--ghost"
                                        onClick={() => { if (confirm('Delete campaign?')) del.mutate(c.id); }}
                                        aria-label="Delete campaign"
                                    >
                                        <Trash2 size={16} aria-hidden="true" />
                                        <span className="btn__label">Delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
