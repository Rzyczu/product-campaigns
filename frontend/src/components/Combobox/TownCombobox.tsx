import { useEffect, useRef, useState } from 'react';
import { useTownsDropdown } from '@/features/towns/hooks';
import { DEFAULT_COUNTRY } from '@/lib/constants';
import type { Town } from '@/features/towns/api';

type Props = {
    value?: { id: number; name: string } | null;
    onChange: (town: { id: number; name: string } | null) => void;
    onBlur?: () => void;
    country?: string;
    placeholder?: string;
};

export default function TownCombobox({ value, onChange, onBlur, country = DEFAULT_COUNTRY, placeholder = 'Select town' }: Props) {
    const [q, setQ] = useState<string>(value?.name ?? '');
    const { data, isLoading } = useTownsDropdown(q, country);
    const list: Town[] = data ?? [];
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (value?.name) setQ(value.name); }, [value?.name]);

    function pick(id: number, name: string) {
        onChange({ id, name });
        onBlur?.();
    }

    return (
        <div className="card" style={{ padding: 8 }}>
            <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                onBlur={onBlur}
            />
            <div style={{ marginTop: 8, display: 'grid', gap: 4, maxHeight: 200, overflow: 'auto' }}>
                {isLoading ? (
                    <div>Loading…</div>
                ) : list.length ? (
                    list.slice(0, 50).map((t: Town) => (
                        <button type="button" key={t.id} className="btn" onClick={() => pick(t.id, t.name)}>
                            {t.name} <span className="muted">({t.country_code})</span>
                        </button>
                    ))
                ) : (
                    <div className="muted">No towns</div>
                )}
            </div>
        </div>
    );
}
