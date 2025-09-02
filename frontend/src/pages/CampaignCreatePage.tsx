import { useNavigate } from 'react-router-dom';
import CampaignForm from '@/features/campaigns/components/CampaignForm';
import { useCreateCampaign } from '@/features/campaigns/hooks';
import { useToast } from '@/components/Toast/ToastProvider';
import { parseInsufficientFunds } from '@/lib/errors';
import { deposit } from '@/features/auth/api';
import { useAuth } from '@/features/auth/store';
import { ApiError } from '@/app/providers/apiClient';

export default function CampaignCreatePage() {
    const nav = useNavigate();
    const create = useCreateCampaign();
    const toast = useToast();
    const setUser = useAuth(s => s.setUser);

    return (
        <section>
            <div className="pagehead"><h1>New campaign</h1></div>
            <CampaignForm
                mode="create"
                onSubmit={async (dto) => {
                    try {
                        await create.mutateAsync(dto);
                        toast.success('Campaign created');
                        nav('/campaigns', { replace: true });
                    } catch (e: any) {
                        const err = e as ApiError;
                        if (err.code === 'INSUFFICIENT_FUNDS' && err.missing_cents && err.missing_cents > 0) {
                            const pln = (err.missing_cents / 100).toFixed(2).replace('.', ',');
                            toast.error(`Niewystarczające środki: ${pln} PLN. Kliknij saldo, aby szybko wpłacić.`);
                            create.reset();
                            return;
                        }
                        toast.error(err.message || 'Nie udało się utworzyć kampanii');
                        throw err;
                    }
                }}
                submitting={create.isPending}
            />
            {create.isError && <div className="alert"> {(create.error as any)?.message ?? 'Error'} </div>}
        </section>
    );
}
