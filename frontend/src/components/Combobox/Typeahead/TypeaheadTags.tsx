import { useMemo, useRef, useState } from 'react';
import { useKeywordTypeahead } from '@/features/keywords/hooks';
import type { Keyword } from '@/features/keywords/api';

type Props = {
    value: string[];
    onChange: (next: string[]) => void;
    max?: number;
    placeholder?: string;
};

export default function TypeaheadTags({ value, onChange, max = 10, placeholder = 'Add keyword' }: Props) {
    const [q, setQ] = useState('');
    const { data } = useKeywordTypeahead(q);
    const inputRef = useRef<HTMLInputElement>(null);

    const suggestions = useMemo<string[]>(
        () => (data ?? [])
            .map((k: Keyword) => k.term)
            .filter((term: string) => !value.includes(term)),
        [data, value]
    );

    function addTag(term: string) {
        const t = term.trim();
        if (!t) return;
        if (value.includes(t)) return;
        if (value.length >= max) return;
        onChange([...value, t]);
        setQ('');
        inputRef.current?.focus();
    }

    function removeTag(term: string) {
        onChange(value.filter((v: string) => v !== term));
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(q);
        } else if (e.key === 'Backspace' && !q && value.length) {
            removeTag(value[value.length - 1]);
        }
    }

    return (
        <div className="card" style={{ padding: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {value.map((v: string) => (
                    <span key={v} className="badge">
                        {v}
                        <button type="button" className="btn btn--ghost" onClick={() => removeTag(v)} aria-label={`Remove ${v}`}>×</button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    style={{ minWidth: 160, flex: '1 1 160px' }}
                />
            </div>

            {suggestions.length > 0 && (
                <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                    {suggestions.slice(0, 8).map((s: string) => (
                        <button type="button" key={s} className="btn" onClick={() => addTag(s)}>
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
