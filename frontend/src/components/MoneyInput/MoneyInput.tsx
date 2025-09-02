import { useState } from 'react';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
    value: string;
    onValueChange: (v: string) => void;
    placeholder?: string;
};

export default function MoneyInput({ value, onValueChange, placeholder = '0,00', ...rest }: Props) {
    const [raw, setRaw] = useState(value);

    function norm(s: string) {
        const cleaned = s.replace(/[^\d.,]/g, '');
        return cleaned.replace(/\./g, ',');
    }

    return (
        <input
            {...rest}
            inputMode="decimal"
            value={raw}
            placeholder={placeholder}
            onChange={(e) => {
                const v = norm(e.target.value);
                setRaw(v);
                onValueChange(v);
            }}
            onBlur={() => setRaw((prev) => prev.replace(/^,/, '0,').replace(/,$/, ',00'))}
        />
    );
}
