import { Link } from 'react-router-dom';
import type { Campaign } from '../types';
import { formatMoney } from '@/lib/format';
import { useDeleteCampaign } from '../hooks';

export default function CampaignsTable({ items }: { items: Campaign[] }) {
    const del = useDeleteCampaign();

    if (!items.length) return <div className="card">No campaigns yet.</div>;

    return (
        <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>Name</th>
                        <th>Product</th>
                        <th>Bid</th>
                        <th>Fund</th>
                        <th>Town</th>
                        <th>Status</th>
                        <th>Keywords</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(c => (
                        <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>{c.product_name}</td>
                            <td style={{ textAlign: 'center' }}>{formatMoney(c.bid_amount_cents)}</td>
                            <td style={{ textAlign: 'center' }}>{formatMoney(c.fund_cents)}</td>
                            <td style={{ textAlign: 'center' }}>{c.town_name}</td>
                            <td style={{ textAlign: 'center' }}>{c.status}</td>
                            <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.keywords.join(', ')}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <Link className="btn" to={`/campaigns/${c.id}/edit`}>Edit</Link>{' '}
                                <button className="btn btn--ghost" onClick={() => {
                                    if (confirm('Delete campaign?')) del.mutate(c.id);
                                }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
