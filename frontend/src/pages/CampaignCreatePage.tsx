import { useNavigate } from 'react-router-dom';
import CampaignForm from '@/features/campaigns/components/CampaignForm';
import { useCreateCampaign } from '@/features/campaigns/hooks';

export default function CampaignCreatePage() {
    const nav = useNavigate();
    const create = useCreateCampaign();

    return (
        <section>
            <div className="pagehead"><h1>New campaign</h1></div>
            <CampaignForm
                mode="create"
                onSubmit={async (dto) => {
                    try {
                        await create.mutateAsync(dto);
                        nav('/campaigns', { replace: true });
                    } catch (e) { }
                }}
                submitting={create.isPending}
            />
            {create.isError && <div className="alert"> {(create.error as any)?.message ?? 'Error'} </div>}
        </section>
    );
}
