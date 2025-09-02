import { Link } from 'react-router-dom';
import { useCampaigns } from '@/features/campaigns/hooks';
import CampaignsTable from '@/features/campaigns/components/CampaignsTable';

export default function CampaignsListPage() {
    const { data, isLoading, isError, error, refetch } = useCampaigns();

    return (
        <section>
            <div className="pagehead">
                <h1>Campaigns</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => refetch()} disabled={isLoading}>Refresh</button>
                    <Link to="/campaigns/new" className="btn btn--primary">New campaign</Link>
                </div>
            </div>
            {isError && <div className="alert">{(error as any)?.message ?? 'Error'}</div>}
            {isLoading ? <div className="card">Loading…</div> : <CampaignsTable items={data ?? []} />}
        </section>
    );
}
