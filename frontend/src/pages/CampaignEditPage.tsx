import { useParams, useNavigate } from 'react-router-dom';
import CampaignForm from '@/features/campaigns/components/CampaignForm';
import { useCampaign, useUpdateCampaign } from '@/features/campaigns/hooks';

export default function CampaignEditPage() {
    const { id = '' } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { data, isLoading, isError, error } = useCampaign(id);
    const update = useUpdateCampaign(id);

    if (isLoading) return <div className="card">Loading…</div>;
    if (isError || !data) return <div className="alert">{(error as any)?.message ?? 'Not found'}</div>;

    return (
        <section>
            <div className="pagehead"><h1>Edit campaign</h1></div>
            <CampaignForm
                mode="edit"
                defaultValues={{
                    product_id: data.product_id,
                    name: data.name,
                    bid_amount_cents: data.bid_amount_cents,
                    fund_cents: data.fund_cents,
                    status: data.status,
                    town_id: data.town_id,
                    radius_km: data.radius_km.toString(),
                    keywords: data.keywords,
                }}
                onSubmit={async (dto) => {
                    try {
                        await update.mutateAsync(dto);
                        nav('/campaigns', { replace: true });
                    } catch { /* handled */ }
                }}
                submitting={update.isPending}
            />
            {update.isError && <div className="alert">{(update.error as any)?.message ?? 'Error'}</div>}
        </section>
    );
}
