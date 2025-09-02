import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { campaignSchema, type CampaignFormValues } from '@/lib/validators';
import { useProducts } from '@/features/products/hooks';
import { useKeywordTypeahead } from '@/features/keywords/hooks';
import { useTownsDropdown } from '@/features/towns/hooks';
import { KEYWORDS_MAX, MIN_BID_CENTS } from '@/lib/constants';
import { parseMoneyToCents, toNumber1Dec } from '@/lib/format';

type Props = {
    mode: 'create' | 'edit';
    defaultValues?: Partial<CampaignFormValues> & {
        bid_amount_cents?: number;
        fund_cents?: number;
    };
    onSubmit: (dto: {
        product_id: string;
        name: string;
        bid_amount_cents: number;
        fund_cents: number;
        status: 'on' | 'off';
        town_id: number;
        radius_km: number;
        keywords: string[];
    }) => Promise<void> | void;
    submitting?: boolean;
};

export default function CampaignForm({ mode, defaultValues, onSubmit, submitting }: Props) {
    // Prefill: konwersja cents -> PLN string
    const dv: CampaignFormValues = {
        product_id: defaultValues?.product_id ?? '',
        name: defaultValues?.name ?? '',
        bid_amount: defaultValues?.bid_amount_cents != null ? (defaultValues.bid_amount_cents / 100).toString() : '',
        fund: defaultValues?.fund_cents != null ? (defaultValues.fund_cents / 100).toString() : '',
        status: (defaultValues?.status as any) ?? 'on',
        town_id: defaultValues?.town_id ?? (0 as any), // RHF wymaga wartości początkowej
        radius_km: defaultValues?.radius_km != null ? String(defaultValues.radius_km) : '10.0',
        keywords: defaultValues?.keywords ?? [],
    };

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CampaignFormValues>({
        defaultValues: dv,
        resolver: zodResolver(campaignSchema),
    });

    // Products
    const { data: products } = useProducts();

    // Keywords typeahead
    const [kwQuery, setKwQuery] = useState('');
    const { data: kwOptions } = useKeywordTypeahead(kwQuery);
    const keywords = watch('keywords') || [];

    function addKeyword(term: string) {
        term = term.trim();
        if (!term || keywords.includes(term) || keywords.length >= KEYWORDS_MAX) return;
        setValue('keywords', [...keywords, term], { shouldValidate: true });
        setKwQuery('');
    }
    function removeKeyword(term: string) {
        setValue('keywords', keywords.filter(t => t !== term), { shouldValidate: true });
    }

    // Town dropdown
    const [townQuery, setTownQuery] = useState('');
    const { data: towns } = useTownsDropdown(townQuery, 'PL');

    // Przy edycji – gdy town_id istnieje, zadbaj o pokazanie nazwy
    const townNameById = useMemo(() => {
        const map = new Map<number, string>();
        (towns ?? []).forEach(t => map.set(t.id, t.name));
        return map;
    }, [towns]);

    useEffect(() => {
        // jeśli town_id = 0 (domyślne), spróbuj wybrać pierwszą propozycję dla UX
        const current = watch('town_id') as unknown as number;
        if (!current && towns && towns[0]) {
            setValue('town_id', towns[0].id as any);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [towns]);

    const onSubmitForm = async (v: CampaignFormValues) => {
        const dto = {
            product_id: v.product_id,
            name: v.name.trim(),
            bid_amount_cents: parseMoneyToCents(v.bid_amount),
            fund_cents: parseMoneyToCents(v.fund),
            status: v.status,
            town_id: Number(v.town_id),
            radius_km: toNumber1Dec(v.radius_km),
            keywords: (v.keywords || []).map(s => s.trim()).filter(Boolean),
        };
        await onSubmit(dto);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="form">
            <div className="card" style={{ marginBottom: 12 }}>
                <div className="form__row">
                    <label>Product*</label>
                    <select {...register('product_id', { required: true })} disabled={mode === 'edit' || submitting}>
                        <option value="">— Select product —</option>
                        {(products ?? []).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    {errors.product_id && <div className="alert">Product is required</div>}
                </div>

                <div className="form__row">
                    <label>Name*</label>
                    <input placeholder="Campaign name" {...register('name')} disabled={submitting} />
                    {errors.name && <div className="alert">Enter a name (max 100)</div>}
                </div>

                <div className="form__row">
                    <label>Keywords (max {KEYWORDS_MAX})</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {keywords.map(k => (
                            <span key={k} className="badge">{k} <button className="btn btn--ghost" type="button" onClick={() => removeKeyword(k)}>×</button></span>
                        ))}
                    </div>
                    <input
                        placeholder="type to search…"
                        value={kwQuery}
                        onChange={e => setKwQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); addKeyword(kwQuery); }
                        }}
                        disabled={submitting}
                    />
                    {kwQuery && kwOptions && kwOptions.length > 0 && (
                        <div className="card" style={{ marginTop: 6 }}>
                            {kwOptions.map(k => (
                                <div key={k.id} style={{ padding: 6, cursor: 'pointer' }} onClick={() => addKeyword(k.term)}>
                                    {k.term}
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.keywords && <div className="alert">Max {KEYWORDS_MAX} słów kluczowych</div>}
                </div>

                <div className="form__row">
                    <label>Bid amount* (PLN)</label>
                    <input placeholder={(MIN_BID_CENTS / 100).toFixed(2)} {...register('bid_amount')} disabled={submitting} />
                    {errors.bid_amount && <div className="alert">{errors.bid_amount.message?.toString()}</div>}
                </div>

                <div className="form__row">
                    <label>Campaign fund* (PLN)</label>
                    <input placeholder="200.00" {...register('fund')} disabled={submitting} />
                    {errors.fund && <div className="alert">Podaj kwotę w PLN</div>}
                </div>

                <div className="form__row">
                    <label>Status*</label>
                    <select {...register('status')} disabled={submitting}>
                        <option value="on">on</option>
                        <option value="off">off</option>
                    </select>
                </div>

                <div className="form__row">
                    <label>Town*</label>
                    <input
                        placeholder="search town…"
                        value={townQuery}
                        onChange={e => setTownQuery(e.target.value)}
                        disabled={submitting}
                    />
                    <select {...register('town_id', { valueAsNumber: true })} disabled={submitting} style={{ marginTop: 6 }}>
                        {(towns ?? []).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    {errors.town_id && <div className="alert">Wybierz miasto</div>}
                </div>

                <div className="form__row">
                    <label>Radius (km)*</label>
                    <input placeholder="10.0" {...register('radius_km')} disabled={submitting} />
                    {errors.radius_km && <div className="alert">{errors.radius_km.message?.toString()}</div>}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn--primary" type="submit" disabled={submitting}>
                        {mode === 'create' ? 'Create' : 'Save'}
                    </button>
                </div>
            </div>
        </form>
    );
}
